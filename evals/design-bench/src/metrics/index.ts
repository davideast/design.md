/**
 * The metric registry. The bench selects a metric by name; experiments will
 * declare which one they use. Registering a new check (fidelity to the handed
 * direction, human-preference agreement, …) is one line here once it implements
 * the Metric interface — the driver and loader don't change.
 */
import type { Metric } from "./types.ts";
import { escapeMetric } from "./escape.ts";
import { fidelityMetric } from "./fidelity.ts";

export type { Metric, MetricContext, LoadedSample, CellSamples } from "./types.ts";
export { loadCaseSamples } from "./samples.ts";

const METRICS: Record<string, Metric> = {
  [escapeMetric.name]: escapeMetric,
  [fidelityMetric.name]: fidelityMetric,
};

export const METRIC_NAMES = Object.keys(METRICS);
export const DEFAULT_METRIC = escapeMetric.name;

export function getMetric(name: string): Metric {
  const metric = METRICS[name];
  if (!metric) throw new Error(`unknown metric "${name}" (known: ${METRIC_NAMES.join(", ")})`);
  return metric;
}
