/**
 * The experiment interface: the object that binds the bench's four parts into
 * one question. An experiment declares a set of briefs (cases), an axis (the
 * arms — the conditions it varies), the tool(s) that generate, and the metric
 * that scores. Method grounding is the first; tool comparison is the second.
 *
 * The axis is what makes one experiment differ from another, and it lives in
 * how the experiment expands cases into cells:
 *   - method grounding varies the DESIGN.md across arms, holding the tool fixed
 *     — every cell carries the same tool, a different direction.
 *   - tool comparison varies the tool across arms, holding the direction fixed
 *     — every cell carries the same direction, a different tool.
 * That is exactly why `tool` is a property of each planned cell, not a global:
 * either the direction or the tool can be the thing that varies.
 */
import type { DesignCase } from "../cases.ts";
import type { DirectionChannel } from "../tools/index.ts";

/** One unit of generation: a (case × arm × channel) on a specific tool. Maps to
 *  one cell directory of N samples under runs/<id>/<case>/<cell>/. */
export interface PlannedCell {
  caseKey: string;
  /** Cell directory name, e.g. "object", "object+prompt", "gemini". */
  cell: string;
  /** Which tool generates this cell (registry key). Varies across cells only
   *  when the tool is the axis. */
  tool: string;
  /** The arm key — the axis label (a grounding arm, or a tool name when the tool
   *  is the axis). Used for sample-count (control vs not) and ordering. */
  armKey: string;
  /** The arm whose DESIGN.md tokens were handed to this cell, for measurement —
   *  distinct from armKey when the cell name doesn't name an arm (tool axis).
   *  Null when no direction was handed (the control). A metric reads this to
   *  recover the tokens the output was supposed to honor. */
  directionArm: string | null;
  /** Absolute path to the DESIGN.md delivered for this cell, or null (control). */
  armFile: string | null;
  /** How the direction is delivered. */
  channel: DirectionChannel;
}

/** Knobs the bench passes to planning. The experiment interprets `arms` as the
 *  conditions on ITS axis (grounding arms for method grounding, tool names for
 *  tool comparison) and `defaultTool` as the tool to use when the tool is fixed. */
export interface PlanOptions {
  /** Restrict to these arms (axis conditions); undefined means all. */
  arms?: string[];
  /** Channels to deliver the direction through. */
  channels: DirectionChannel[];
  /** The tool to use when the experiment holds the tool fixed. */
  defaultTool: string;
}

/** A named question binding briefs + axis + tool(s) + metric. */
export interface Experiment {
  readonly name: string;
  readonly description: string;
  /** The metric (registry name) that scores this experiment's runs. */
  readonly metric: string;
  /** Expand the selected cases into the cells to generate. */
  plan(cases: DesignCase[], options: PlanOptions): PlannedCell[];
}
