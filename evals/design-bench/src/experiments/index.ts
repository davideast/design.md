/**
 * The experiment registry. The bench selects an experiment by name; it declares
 * its axis (via plan), its tool default, and the metric that scores it. Adding
 * an experiment — a prompt-phrasing sweep, a parameter study — is one line here.
 */
import type { Experiment } from "./types.ts";
import { methodGrounding } from "./method-grounding.ts";
import { toolComparison } from "./tool-comparison.ts";

export type { Experiment, PlannedCell, PlanOptions } from "./types.ts";

const EXPERIMENTS: Record<string, Experiment> = {
  [methodGrounding.name]: methodGrounding,
  [toolComparison.name]: toolComparison,
};

export const EXPERIMENT_NAMES = Object.keys(EXPERIMENTS);
export const DEFAULT_EXPERIMENT = methodGrounding.name;

export function getExperiment(name: string): Experiment {
  const experiment = EXPERIMENTS[name];
  if (!experiment) throw new Error(`unknown experiment "${name}" (known: ${EXPERIMENT_NAMES.join(", ")})`);
  return experiment;
}
