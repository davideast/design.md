/**
 * Method grounding: the founding experiment. Holds the tool fixed and varies
 * the design direction across the grounding ladder — no direction (the control,
 * the generic center), tokens only, adjective description, one real object, one
 * hard constraint, one governing metaphor, full specification — each optionally
 * delivered through two channels (the tool's design-system pipeline, or written
 * straight into the prompt). Scored by how far each arm escaped the control.
 *
 * The cell expansion here is exactly what generate.ts did inline before the
 * experiment abstraction existed; routing it through this file is the
 * behavior-preserving step that makes the bench experiment-driven.
 */
import { CONTROL, cellName, type DesignCase } from "../cases.ts";
import type { Experiment, PlannedCell, PlanOptions } from "./types.ts";

export const methodGrounding: Experiment = {
  name: "method-grounding",
  description:
    "One brief, the same tool, increasing design direction across the grounding ladder. Tests whether grounded direction beats adjective description at escaping the model's default look.",
  metric: "escape-from-center",

  plan(cases: DesignCase[], options: PlanOptions): PlannedCell[] {
    const cells: PlannedCell[] = [];
    const want = (key: string) => !options.arms || options.arms.includes(key);
    for (const c of cases) {
      // The no-direction control has no document to inject, so it runs exactly
      // once per case (design-system channel by convention, though nothing is
      // delivered through it).
      if (want(CONTROL)) {
        cells.push({ caseKey: c.key, cell: CONTROL, tool: options.defaultTool, armKey: CONTROL, directionArm: null, armFile: null, channel: "design-system" });
      }
      for (const [armKey, armFile] of c.armFiles) {
        if (!want(armKey)) continue;
        for (const channel of options.channels) {
          // Here the cell name IS the arm, so the handed direction is the arm itself.
          cells.push({ caseKey: c.key, cell: cellName(armKey, channel), tool: options.defaultTool, armKey, directionArm: armKey, armFile, channel });
        }
      }
    }
    return cells;
  },
};
