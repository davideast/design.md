/**
 * Measurement phase: load a generation run's samples and score them with a
 * metric, writing report.json and report.md into the run directory.
 *
 * The metric is pluggable (see src/metrics/) — "escape from the generic center"
 * is the default and the only one today. This file is just the driver: it loads
 * samples, hands them to the metric, and assembles the report. The analysis
 * itself lives in the metric.
 *
 * Usage:
 *   bun src/measure.ts runs/<run-id> [--metric escape-from-center]
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, isAbsolute } from "node:path";
import { ROOT, loadRunCases, evalDirFor } from "./cases.ts";
import { getMetric, DEFAULT_METRIC, loadCaseSamples, type MetricContext, type CellSamples } from "./metrics/index.ts";

function main() {
  const args = process.argv.slice(2);
  const runArg = args.find((a) => !a.startsWith("--"));
  if (!runArg) {
    console.error("usage: bun src/measure.ts runs/<run-id> [--metric <name>]");
    process.exit(1);
  }
  const runDir = isAbsolute(runArg) ? runArg : join(ROOT, runArg);
  const config = existsSync(join(runDir, "config.json"))
    ? JSON.parse(readFileSync(join(runDir, "config.json"), "utf8"))
    : {};

  // Default to the metric the run's experiment declared (recorded in config),
  // falling back to the escape metric for runs that predate the experiment field.
  const metricFlag = args.indexOf("--metric");
  const metricName = metricFlag >= 0 ? args[metricFlag + 1] : (config.metric ?? DEFAULT_METRIC);
  const metric = getMetric(metricName);

  // Measure against the definition the run actually saw (its eval snapshot),
  // not the current working tree — arm prose may have changed since.
  const cases = loadRunCases(runDir);
  const samplesByCase = new Map<string, CellSamples>();
  for (const c of cases) {
    const loaded = loadCaseSamples(runDir, c);
    if (loaded) samplesByCase.set(c.key, loaded);
  }
  if (samplesByCase.size === 0) {
    console.error(`no samples found under ${runDir}`);
    process.exit(1);
  }

  const ctx: MetricContext = { runDir, config, cases, samplesByCase };
  const result = metric.measure(ctx);

  const md: string[] = [];
  md.push(`# Eval report — ${metric.name}`);
  md.push(``);
  md.push(
    `Run: \`${runArg}\` · metric: ${metric.name} · model: ${config.model ?? "unrecorded"} · tool: ${config.tool ?? "unrecorded"} · eval: ${config.evalHash ?? "unrecorded"}${evalDirFor(runDir) ? " (snapshot)" : " (no snapshot — measured against working tree)"} · stitch-sdk: ${config.stitchSdkVersion ?? "unrecorded"}`,
  );
  md.push(``);
  md.push(...metric.render(result, ctx));

  const reportMd = md.join("\n");
  writeFileSync(join(runDir, "report.md"), reportMd);
  writeFileSync(
    join(runDir, "report.json"),
    JSON.stringify(
      { config, metric: metric.name, ...(result as Record<string, unknown>) },
      (_key, value) => (value instanceof Set ? [...value] : value),
      2,
    ),
  );

  console.log(reportMd);
  console.log(`\nwrote ${join(runDir, "report.md")} and report.json`);
}

main();
