#!/usr/bin/env bun
/**
 * Design Bench CLI — the single entry point for all bench operations.
 *
 * Usage:
 *   bun bench init   --provider <key> --label <label> --model <model> [--cases ...]
 *   bun bench measure <run-id>
 *   bun bench seed                   # rebuild DB from existing runs/ on disk
 *   bun bench status                 # show providers, runs, cell counts
 *   bun bench dev                    # start the Astro viewer
 */
import { parseArgs } from "node:util";
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, isAbsolute } from "node:path";
import { ROOT, loadCases, evalHashOf, snapshotEval, CELL_ORDER, cellName, baseArm } from "./cases.ts";
import {
  openDb,
  upsertProvider,
  upsertRun,
  upsertCell,
  markMeasured,
  allProviders,
  allRuns,
  runStats,
  type CellInsert,
} from "./db.ts";
import { getMetric, DEFAULT_METRIC, loadCaseSamples } from "./metrics/index.ts";
import type { MetricContext, CellSamples } from "./metrics/types.ts";

const [subcommand, ...rest] = process.argv.slice(2);

switch (subcommand) {
  case "init":
    await cmdInit(rest);
    break;
  case "measure":
    await cmdMeasure(rest);
    break;
  case "seed":
    await cmdSeed();
    break;
  case "status":
    cmdStatus();
    break;
  case "dev":
    await cmdDev();
    break;
  default:
    console.log(`Design Bench CLI

Commands:
  init      Register a provider + run and create the directory scaffold
  measure   Score all HTML files in a run and write results to the database
  seed      Rebuild the database from existing runs/ on disk
  status    Show providers, runs, and measurement status
  dev       Start the Astro viewer

Run any command with --help for details.`);
    if (subcommand && subcommand !== "--help" && subcommand !== "-h") {
      console.error(`\nUnknown command: ${subcommand}`);
      process.exit(1);
    }
}

// ---------------------------------------------------------------------------
// init: register provider + run, create scaffold
// ---------------------------------------------------------------------------

async function cmdInit(args: string[]) {
  const { values } = parseArgs({
    args,
    options: {
      provider: { type: "string" },
      label: { type: "string" },
      model: { type: "string" },
      tool: { type: "string", default: "agent" },
      "run-id": { type: "string" },
      cases: { type: "string" },
      channels: { type: "string", default: "prompt" },
      help: { type: "boolean", short: "h" },
    },
    allowPositionals: false,
  });

  if (values.help) {
    console.log(`bun bench init --provider <key> --label <label> --model <model> [options]

Options:
  --provider   Provider key (e.g. opus46)
  --label      Display label (e.g. "Opus 4.6")
  --model      Model identifier (e.g. claude-opus-4.6)
  --tool       Tool name (default: agent)
  --run-id     Run ID (default: value of --model)
  --cases      Comma-separated case keys (default: all)
  --channels   Comma-separated channels (default: prompt)`);
    return;
  }

  if (!values.provider || !values.label || !values.model) {
    console.error("Required: --provider, --label, --model");
    process.exit(1);
  }

  const runId = values["run-id"] ?? values.model;
  const caseFilter = values.cases?.split(",").map((s) => s.trim());
  const channels = (values.channels ?? "prompt").split(",").map((s) => s.trim());

  // Load cases from disk
  const cases = loadCases(caseFilter);
  if (!cases.length) {
    console.error(`No cases found${caseFilter ? ` matching: ${caseFilter.join(", ")}` : ""}`);
    process.exit(1);
  }

  // Eval hash
  const { evalHash, caseHashes } = evalHashOf(cases);

  // Create run directory + scaffold
  const runDir = join(ROOT, "runs", runId);
  mkdirSync(runDir, { recursive: true });

  // Create cell directories
  for (const c of cases) {
    for (const arm of CELL_ORDER) {
      for (const ch of channels) {
        const cellDir = join(runDir, c.key, cellName(arm, ch));
        mkdirSync(cellDir, { recursive: true });
      }
    }
  }

  // Snapshot eval
  snapshotEval(cases, join(runDir, "eval"));

  // Write config.json (for backward compat and human reference)
  const config = {
    cases: cases.map((c) => c.key),
    samples: 1,
    controlSamples: 1,
    arms: "all",
    channels,
    experiment: "method-grounding",
    metric: "escape-from-center",
    tool: values.tool,
    model: values.model,
    evalHash,
    caseHashes,
    startedAt: new Date().toISOString(),
  };
  const configPath = join(runDir, "config.json");
  if (!existsSync(configPath)) {
    Bun.write(configPath, JSON.stringify(config, null, 2));
  }

  // Register in database
  const db = openDb();
  upsertProvider(db, values.provider, values.label);
  upsertRun(db, {
    id: runId,
    providerKey: values.provider,
    model: values.model,
    tool: values.tool,
    evalHash,
    experiment: "method-grounding",
    metric: "escape-from-center",
    config,
  });
  db.close();

  console.log(`Initialized run: ${runId}`);
  console.log(`  Provider:  ${values.provider} (${values.label})`);
  console.log(`  Model:     ${values.model}`);
  console.log(`  Cases:     ${cases.map((c) => c.key).join(", ")}`);
  console.log(`  Eval hash: ${evalHash}`);
  console.log(`  Directory: ${runDir}`);
  console.log(`\nGenerate HTML into the cell directories, then run:\n  bun bench measure ${runId}`);
}

// ---------------------------------------------------------------------------
// measure: score HTML and write to DB
// ---------------------------------------------------------------------------

async function cmdMeasure(args: string[]) {
  const runArg = args.find((a) => !a.startsWith("--"));
  if (!runArg) {
    console.error("Usage: bun bench measure <run-id>");
    process.exit(1);
  }

  const runDir = isAbsolute(runArg) ? runArg : join(ROOT, "runs", runArg);
  const runId = runArg.replace(/^runs\//, "");

  if (!existsSync(runDir)) {
    console.error(`Run directory not found: ${runDir}`);
    process.exit(1);
  }

  // Load config
  const configPath = join(runDir, "config.json");
  const config = existsSync(configPath)
    ? JSON.parse(readFileSync(configPath, "utf8"))
    : {};

  // Resolve metric
  const metricFlag = args.indexOf("--metric");
  const metricName = metricFlag >= 0 ? args[metricFlag + 1] : (config.metric ?? DEFAULT_METRIC);
  const metric = getMetric(metricName);

  // Load cases from the run's eval snapshot
  const { loadRunCases } = await import("./cases.ts");
  const cases = loadRunCases(runDir);

  // Load samples
  const samplesByCase = new Map<string, CellSamples>();
  for (const c of cases) {
    const loaded = loadCaseSamples(runDir, c);
    if (loaded) samplesByCase.set(c.key, loaded);
  }

  if (samplesByCase.size === 0) {
    console.error(`No samples found under ${runDir}`);
    process.exit(1);
  }

  // Run the metric
  const ctx: MetricContext = { runDir, config, cases, samplesByCase };
  const result = metric.measure(ctx) as any;

  // Write cells to database
  const db = openDb();

  for (const caseResult of result.cases ?? []) {
    const caseKey = caseResult.case;
    for (const cell of caseResult.cells ?? []) {
      const arm = baseArm(cell.cell);
      const channel = cell.cell.includes("+") ? cell.cell.split("+")[1] : "prompt";

      const cellInsert: CellInsert = {
        runId,
        caseKey,
        arm,
        channel,
        samples: cell.samples ?? 0,
        paletteAdherence: cell.paletteAdherence ?? null,
        meanDeltaE: cell.meanDeltaE ?? null,
        fontMatchRate: cell.fontMatchRate ?? null,
        distanceFromControl: cell.distanceFromControl ?? null,
        excessDistance: cell.excessDistanceFromControl ?? null,
        intraArmDispersion: cell.intraArmDispersion ?? null,
        violations: cell.violationRates ?? null,
        meanViolations: cell.meanViolations ?? null,
        raw: cell,
      };
      upsertCell(db, cellInsert);
    }
  }

  markMeasured(db, runId);
  db.close();

  // Still write report.md for human reference
  const md: string[] = [];
  md.push(`# Eval report — ${metric.name}`);
  md.push(``);
  md.push(
    `Run: \`${runArg}\` · metric: ${metric.name} · model: ${config.model ?? "unrecorded"} · tool: ${config.tool ?? "unrecorded"} · eval: ${config.evalHash ?? "unrecorded"}`,
  );
  md.push(``);
  md.push(...metric.render(result, ctx));
  const reportMd = md.join("\n");
  Bun.write(join(runDir, "report.md"), reportMd);
  Bun.write(
    join(runDir, "report.json"),
    JSON.stringify(
      { config, metric: metric.name, ...(result as Record<string, unknown>) },
      (_key, value) => (value instanceof Set ? [...value] : value),
      2,
    ),
  );

  console.log(reportMd);
  console.log(`\nWrote report.md + report.json to ${runDir}`);
  console.log(`Database updated: cells written for ${samplesByCase.size} cases.`);
}

// ---------------------------------------------------------------------------
// seed: rebuild DB from existing runs/ on disk
// ---------------------------------------------------------------------------

async function cmdSeed() {
  const runsDir = join(ROOT, "runs");
  if (!existsSync(runsDir)) {
    console.error(`No runs/ directory found at ${runsDir}`);
    process.exit(1);
  }

  const db = openDb();

  // Known provider mappings (for existing runs that predate the CLI)
  // featured: 1 = show on home page grid, 0 = only visible on /matrix
  const KNOWN_PROVIDERS: Record<string, { key: string; label: string; featured: number }> = {
    // Featured providers (home page)
    demo: { key: "stitch", label: "Stitch", featured: 1 },
    "stitch-new": { key: "stitch", label: "Stitch", featured: 1 },
    "gemini-grid": { key: "gemini", label: "Gemini 3.5 Flash", featured: 1 },
    "gemini-new": { key: "gemini", label: "Gemini 3.5 Flash", featured: 1 },
    "opus-grid": { key: "opus", label: "Opus 4.8", featured: 1 },
    "gpt-grid": { key: "gpt", label: "GPT 5.5", featured: 1 },
    "glm-grid": { key: "glm", label: "GLM 5.2", featured: 1 },
    // Non-featured providers (visible on /matrix)
    "claude-opus-4.6": { key: "opus46", label: "Opus 4.6", featured: 0 },
    "claude-sonnet-4.6": { key: "sonnet46", label: "Sonnet 4.6", featured: 0 },
    // Legacy experimental runs — map to Stitch
    "tool-comp-smoke": { key: "stitch", label: "Stitch", featured: 1 },
    "par-diag": { key: "stitch", label: "Stitch", featured: 1 },
    "demo-flash": { key: "stitch", label: "Stitch", featured: 1 },
  };

  // Seed the providers
  const seenProviders = new Set<string>();
  let sortOrder = 0;
  for (const [, prov] of Object.entries(KNOWN_PROVIDERS)) {
    if (!seenProviders.has(prov.key)) {
      upsertProvider(db, prov.key, prov.label, sortOrder++, prov.featured);
      seenProviders.add(prov.key);
    }
  }

  // Scan each run directory
  const runDirs = readdirSync(runsDir).filter((d) => statSync(join(runsDir, d)).isDirectory());
  let runsSeeded = 0;
  let cellsSeeded = 0;

  for (const runName of runDirs) {
    const runDir = join(runsDir, runName);
    const configPath = join(runDir, "config.json");
    const reportPath = join(runDir, "report.json");

    const config = existsSync(configPath)
      ? JSON.parse(readFileSync(configPath, "utf8"))
      : {};

    const provider = KNOWN_PROVIDERS[runName];
    if (!provider) {
      // Unknown run — skip it rather than creating a junk provider.
      // To include a new run, either use `bun bench init` or add it to KNOWN_PROVIDERS.
      console.log(`  skip: ${runName} (not in KNOWN_PROVIDERS — use 'bun bench init' to register)`);
      continue;
    }

    upsertRun(db, {
      id: runName,
      providerKey: provider.key,
      model: config.model ?? runName,
      tool: config.tool ?? "stitch",
      evalHash: config.evalHash,
      experiment: config.experiment ?? "method-grounding",
      metric: config.metric ?? "escape-from-center",
      config,
    });

    // If measured, load cells from report.json
    if (existsSync(reportPath)) {
      const report = JSON.parse(readFileSync(reportPath, "utf8"));
      for (const caseResult of report.cases ?? []) {
        for (const cell of caseResult.cells ?? []) {
          const arm = baseArm(cell.cell);
          const channel = cell.cell.includes("+") ? cell.cell.split("+")[1] : "prompt";

          upsertCell(db, {
            runId: runName,
            caseKey: caseResult.case,
            arm,
            channel,
            samples: cell.samples ?? 0,
            paletteAdherence: cell.paletteAdherence ?? null,
            meanDeltaE: cell.meanDeltaE ?? null,
            fontMatchRate: cell.fontMatchRate ?? null,
            distanceFromControl: cell.distanceFromControl ?? null,
            excessDistance: cell.excessDistanceFromControl ?? null,
            intraArmDispersion: cell.intraArmDispersion ?? null,
            violations: cell.violationRates ?? null,
            meanViolations: cell.meanViolations ?? null,
            raw: cell,
          });
          cellsSeeded++;
        }
      }
      markMeasured(db, runName);
    }

    runsSeeded++;
  }

  db.close();
  console.log(`Seeded ${runsSeeded} runs, ${cellsSeeded} cells into bench.db`);
}

// ---------------------------------------------------------------------------
// status: show what's in the database
// ---------------------------------------------------------------------------

function cmdStatus() {
  const db = openDb(true);
  const providers = allProviders(db);
  const runs = allRuns(db);

  console.log("Providers:");
  for (const p of providers) {
    const provRuns = runs.filter((r) => r.provider_key === p.key);
    const measured = provRuns.filter((r) => r.measured_at);
    const total = provRuns.reduce((s, r) => {
      const stats = runStats(db, r.id);
      return s + stats.cellCount;
    }, 0);
    console.log(
      `  ${p.key.padEnd(14)} ${p.label.padEnd(20)} ${provRuns.length} run${provRuns.length !== 1 ? "s" : " "}   ${total} cells   ${measured.length} measured`,
    );
  }

  console.log("\nRuns:");
  for (const r of runs) {
    const stats = runStats(db, r.id);
    const measured = r.measured_at ? `measured ${r.measured_at.slice(0, 10)}` : "not measured";
    console.log(
      `  ${r.id.padEnd(24)} ${r.provider_key.padEnd(14)} ${measured.padEnd(24)} ${stats.cellCount} cells, ${stats.sampleCount} samples`,
    );
  }

  db.close();
}

// ---------------------------------------------------------------------------
// dev: start the Astro viewer
// ---------------------------------------------------------------------------

async function cmdDev() {
  // Ensure the database exists
  const db = openDb();
  db.close();

  const proc = Bun.spawn(["bunx", "astro", "dev"], {
    cwd: join(ROOT, "app"),
    stdin: "inherit",
    stdout: "inherit",
    stderr: "inherit",
  });
  await proc.exited;
}
