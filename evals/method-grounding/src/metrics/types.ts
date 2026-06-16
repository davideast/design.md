/**
 * The metric interface: the seam between the bench and how renderings are
 * scored. "Escape from the generic center" — the method-grounding analysis — is
 * the first metric; a tool-comparison experiment will want a different one
 * (fidelity to the handed direction), and we'll find better checks over time.
 *
 * A metric reads the loaded samples of a run, scores and compares them however
 * it likes, and returns a JSON-serializable result plus the markdown sections
 * that explain it. The bench drives loading and report assembly; the metric
 * owns the analysis and its interpretation.
 *
 * Deliberately minimal — we have one metric today. The real shape of the
 * abstraction won't be known until a second one (fidelity) exercises it, so we
 * resist fitting it to the escape metric's contours now, the same discipline we
 * applied to the tool interface.
 */
import type { DesignCase } from "../cases.ts";

/** One generated artifact on disk, with the provenance written beside it. */
export interface LoadedSample {
  /** Sample index within the cell ("0", "1", …). */
  index: string;
  /** Absolute path to the generated HTML. */
  htmlPath: string;
  /** The sample's <i>.json — channel, model, tool, projectId, … (may be empty). */
  meta: Record<string, unknown>;
}

/** A case's samples grouped by cell (arm × channel), e.g. "object", "object+prompt". */
export type CellSamples = Map<string, LoadedSample[]>;

/** Everything a metric needs to analyze a run. */
export interface MetricContext {
  runDir: string;
  /** The run's config.json (model, tool, channels, evalHash, …). */
  config: Record<string, unknown>;
  /** The cases as the run actually saw them (its eval snapshot). */
  cases: DesignCase[];
  /** Loaded samples keyed by case key. Cases with no samples are absent. */
  samplesByCase: Map<string, CellSamples>;
}

/** A named way of scoring and comparing renderings. The result type is the
 *  metric's own; the driver treats it opaquely (serializes it, hands it back to
 *  render()). */
export interface Metric<R = unknown> {
  readonly name: string;
  readonly description: string;
  /** Score the run. Returns a JSON-serializable result written to report.json. */
  measure(ctx: MetricContext): R;
  /** Render the result as markdown sections (without the report's top title /
   *  header — the driver owns those). */
  render(result: R, ctx: MetricContext): string[];
}
