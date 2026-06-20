/**
 * Generation phase: for each case × arm × injection channel, open a generation
 * session on the selected tool, install the arm's DESIGN.md (per channel), then
 * generate N screens from the case's brief. Saves HTML, screenshots, and raw
 * responses under runs/. The tool is pluggable (Stitch today) behind the
 * GenerationTool interface — see src/tools/.
 *
 * Injection channels:
 *   design-system — the direction is handed to the tool the way a real design
 *                   system would be (Stitch extracts it into an asset). The product path.
 *   prompt        — DESIGN.md content embedded directly in the generation prompt
 *                   (bypasses a tool's design-system extraction; calibrates whether
 *                   that pipeline transmits or flattens the prose treatment).
 *
 * Usage:
 *   STITCH_API_KEY=... bun src/generate.ts \
 *     [--tool stitch] [--cases ai-landing,recipe-card] [--arms object,description] \
 *     [--samples 5] [--control-samples 10] \
 *     [--channels design-system,prompt] [--model GEMINI_3_1_PRO] [--run my-run]
 */
import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { getTool, DEFAULT_TOOL, type GenerationTool } from "./tools/index.ts";
import { getExperiment, DEFAULT_EXPERIMENT, type PlannedCell } from "./experiments/index.ts";
import {
  ROOT,
  CONTROL,
  loadCases,
  verifySharedTokens,
  evalHashOf,
  evalHashFromCaseHashes,
  snapshotEval,
  evalDirFor,
  type DesignCase,
} from "./cases.ts";

type Channel = "design-system" | "prompt";

const DEFAULT_MODEL = "GEMINI_3_1_PRO";

function parseArgs() {
  const args = process.argv.slice(2);
  const get = (flag: string) => {
    const i = args.indexOf(flag);
    return i >= 0 ? args[i + 1] : undefined;
  };
  const samples = Number(get("--samples") ?? 5);
  const channels = (get("--channels") ?? "design-system").split(",") as Channel[];
  for (const c of channels) {
    if (c !== "design-system" && c !== "prompt") throw new Error(`unknown channel: ${c}`);
  }
  return {
    samples,
    // The control arm defines the generic center — estimate it more tightly by default.
    controlSamples: Number(get("--control-samples") ?? samples * 2),
    cases: get("--cases")?.split(","),
    arms: get("--arms")?.split(","),
    channels,
    experiment: get("--experiment") ?? DEFAULT_EXPERIMENT,
    tool: get("--tool") ?? DEFAULT_TOOL,
    model: get("--model") ?? DEFAULT_MODEL,
    // Cells run in parallel (each is its own Stitch project, so screen
    // attribution stays unambiguous); samples within a cell stay serial.
    concurrency: Math.max(1, Math.min(8, Number(get("--concurrency") ?? 3))),
    run: get("--run") ?? new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19),
  };
}

function sdkVersion(): string {
  try {
    return JSON.parse(readFileSync(join(ROOT, "node_modules/@google/stitch-sdk/package.json"), "utf8")).version;
  } catch {
    return "unknown";
  }
}

async function download(url: string, dest: string) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`download failed (${res.status}): ${url}`);
  writeFileSync(dest, Buffer.from(await res.arrayBuffer()));
}

async function runCell(
  tool: GenerationTool,
  designCase: DesignCase,
  planned: PlannedCell,
  config: ReturnType<typeof parseArgs>,
  runDir: string,
) {
  const cell = planned.cell;
  const cellDir = join(runDir, designCase.key, cell);
  const rawDir = join(cellDir, "raw");
  mkdirSync(rawDir, { recursive: true });

  let rawCount = 0;
  const log = (msg: string, raw?: unknown) => {
    console.log(`  [${designCase.key}/${cell}] ${msg}`);
    if (raw !== undefined) {
      writeFileSync(
        join(rawDir, `${String(rawCount++).padStart(2, "0")}-${msg.split(" ")[0].replace(/[^a-z_]/gi, "")}.json`),
        JSON.stringify(raw, null, 2),
      );
    }
  };

  console.log(`\n=== ${designCase.key}/${cell} (tool: ${tool.name}, model: ${config.model}, device: ${designCase.config.deviceType}) ===`);
  const designMd = planned.armFile ? readFileSync(planned.armFile, "utf8") : undefined;
  const session = await tool.openSession(
    {
      label: `${config.run}/${designCase.key}/${cell}`,
      brief: designCase.brief,
      designMd,
      channel: planned.channel,
      deviceType: designCase.config.deviceType,
      model: config.model,
    },
    log,
  );

  try {
    const sampleCount = planned.armKey === CONTROL ? config.controlSamples : config.samples;

    for (let i = 0; i < sampleCount; i++) {
      const htmlPath = join(cellDir, `${i}.html`);
      if (existsSync(htmlPath)) {
        log(`sample ${i} already exists, skipping`);
        continue;
      }
      const started = Date.now();
      try {
        const screen = await session.generate(log);
        if (screen.htmlUrl) {
          await download(screen.htmlUrl, htmlPath);
        } else if (screen.html) {
          writeFileSync(htmlPath, screen.html);
        } else {
          throw new Error("no HTML on generated screen");
        }
        if (screen.imageUrl) {
          await download(screen.imageUrl, join(cellDir, `${i}.png`)).catch((e) => log(`screenshot download failed: ${e}`));
        }
        writeFileSync(
          join(cellDir, `${i}.json`),
          JSON.stringify(
            {
              case: designCase.key,
              ...session.provenance,
              screenId: screen.id,
              htmlUrl: screen.htmlUrl,
              imageUrl: screen.imageUrl,
              channel: planned.channel,
              directionArm: planned.directionArm,
              model: config.model,
              deviceType: designCase.config.deviceType,
              elapsedMs: Date.now() - started,
            },
            null,
            2,
          ),
        );
        log(`sample ${i} done in ${Math.round((Date.now() - started) / 1000)}s`);
      } catch (err) {
        log(`sample ${i} FAILED: ${err}`);
        writeFileSync(join(cellDir, `${i}.error.txt`), String(err));
        if (/rate.?limit|429|RESOURCE_EXHAUSTED|quota/i.test(String(err))) {
          log("rate limited — backing off 30s");
          await sleep(30_000);
        }
      }
    }
  } finally {
    await session.close().catch(() => {});
  }
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function main() {
  const config = parseArgs();
  const experiment = getExperiment(config.experiment);
  const cases = loadCases(config.cases);
  if (cases.length === 0) throw new Error(`no cases matched ${config.cases}`);
  for (const c of cases) verifySharedTokens(c);
  console.log(`✓ front matter is byte-identical within each of ${cases.length} case(s)`);

  // The experiment expands the cases into cells: it owns the axis (what varies
  // across arms) and assigns each cell its tool. Resolve and validate tools per
  // cell — the tool is a cell property because the tool itself can be the axis
  // (method grounding fixes it; tool comparison varies it). Validate before any
  // filesystem write so a bad tool/channel fails without leaving a half-run.
  const planned = experiment.plan(cases, { arms: config.arms, channels: config.channels, defaultTool: config.tool });
  if (planned.length === 0) throw new Error(`experiment "${experiment.name}" planned no cells for the given cases/arms`);
  const toolCache = new Map<string, GenerationTool>();
  const toolFor = (name: string): GenerationTool => {
    let t = toolCache.get(name);
    if (!t) {
      t = getTool(name);
      toolCache.set(name, t);
    }
    return t;
  };
  for (const cell of planned) {
    const t = toolFor(cell.tool);
    if (!t.channels.includes(cell.channel)) {
      throw new Error(
        `tool "${t.name}" does not support the "${cell.channel}" channel (cell ${cell.caseKey}/${cell.cell}; supports: ${t.channels.join(", ")})`,
      );
    }
  }
  const caseByKey = new Map(cases.map((c) => [c.key, c]));

  const runDir = join(ROOT, "runs", config.run);
  mkdirSync(runDir, { recursive: true });

  // Snapshot the evaluation definition into the run, or — when resuming — verify
  // the definition hasn't drifted since the run's existing samples were generated.
  // A run must never mix samples from two versions of the arm documents.
  const { caseHashes } = evalHashOf(cases);
  const evalDir = join(runDir, "eval");
  if (evalDirFor(runDir)) {
    const snapshotCases = loadCases(undefined, evalDir);
    const snapshotHashes = evalHashOf(snapshotCases).caseHashes;
    const newCases: DesignCase[] = [];
    for (const c of cases) {
      if (!(c.key in snapshotHashes)) {
        newCases.push(c); // resuming with a case this run hasn't seen — snapshot it
      } else if (snapshotHashes[c.key] !== caseHashes[c.key]) {
        throw new Error(
          `case "${c.key}" has changed since run "${config.run}" was generated ` +
            `(snapshot ${snapshotHashes[c.key]} ≠ current ${caseHashes[c.key]}). ` +
            `A run cannot mix eval versions — start a new run, or restore the definition the run was built against (see ${evalDir}).`,
        );
      }
    }
    if (newCases.length > 0) snapshotEval(newCases, evalDir);
  } else {
    snapshotEval(cases, evalDir);
  }
  // Recompute over everything snapshotted so far (resume may have added cases).
  const allCaseHashes = evalHashOf(loadCases(undefined, evalDir)).caseHashes;
  const evalHash = evalHashFromCaseHashes(allCaseHashes);
  console.log(`✓ eval snapshot: ${evalHash} (${Object.entries(allCaseHashes).map(([k, v]) => `${k}:${v}`).join(", ")})`);

  const configPath = join(runDir, "config.json");
  const prior = existsSync(configPath) ? JSON.parse(readFileSync(configPath, "utf8")) : null;
  if (prior && prior.model && prior.model !== config.model) {
    throw new Error(
      `run "${config.run}" was generated with model ${prior.model}; refusing to resume with ${config.model} — start a new run.`,
    );
  }
  if (prior && prior.tool && prior.tool !== config.tool) {
    throw new Error(
      `run "${config.run}" was generated with tool ${prior.tool}; refusing to resume with ${config.tool} — start a new run.`,
    );
  }
  if (prior && prior.experiment && prior.experiment !== config.experiment) {
    throw new Error(
      `run "${config.run}" was generated for experiment ${prior.experiment}; refusing to resume as ${config.experiment} — start a new run.`,
    );
  }
  writeFileSync(
    configPath,
    JSON.stringify(
      {
        cases: [...new Set([...(prior?.cases ?? []), ...cases.map((c) => c.key)])],
        samples: config.samples,
        controlSamples: config.controlSamples,
        arms: config.arms ?? "all",
        channels: config.channels,
        experiment: config.experiment,
        metric: experiment.metric,
        tool: config.tool,
        model: config.model,
        concurrency: config.concurrency,
        stitchSdkVersion: sdkVersion(),
        evalHash,
        caseHashes: allCaseHashes,
        startedAt: prior?.startedAt ?? new Date().toISOString(),
        resumedAt: prior ? [...(prior.resumedAt ?? []), new Date().toISOString()] : undefined,
      },
      null,
      2,
    ),
  );

  // Cells run in parallel — each cell opens its own session (its own Stitch
  // project), so concurrent generations can never confuse screen attribution
  // (which lives within a project). Samples within a cell stay serial for
  // exactly that reason. Tools are stateless and shared; each cell's session is
  // created and closed by runCell, so a failed cell can't leak resources.
  const workers = Math.min(config.concurrency, planned.length);
  console.log(`\n${planned.length} cell(s) across ${cases.length} case(s) · experiment ${experiment.name} · concurrency ${workers}`);
  const queue = [...planned];
  const cellFailures: string[] = [];
  await Promise.all(
    Array.from({ length: workers }, async () => {
      for (let cell = queue.shift(); cell; cell = queue.shift()) {
        const cellLabel = `${cell.caseKey}/${cell.cell}`;
        try {
          await runCell(toolFor(cell.tool), caseByKey.get(cell.caseKey)!, cell, config, runDir);
        } catch (err) {
          console.error(`  [${cellLabel}] CELL FAILED: ${err}`);
          cellFailures.push(cellLabel);
        }
      }
    }),
  );

  if (cellFailures.length > 0) {
    console.error(`\n${cellFailures.length}/${planned.length} cells failed: ${cellFailures.join(", ")}`);
    if (cellFailures.length === planned.length) {
      throw new Error("every cell failed — check the key (viewer → settings) and the log above");
    }
  }
  console.log(`\nrun complete: ${runDir}`);
  console.log(`next: bun src/measure.ts runs/${config.run}`);
  console.log(`view: bun src/viewer.ts runs/${config.run}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
