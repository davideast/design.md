/**
 * Shared sample loader: walk a run directory and group each case's generated
 * HTML by cell, with the provenance JSON written beside each sample. Metrics
 * consume this instead of re-walking the tree, so the directory layout is
 * known in one place.
 */
import { readdirSync, readFileSync, existsSync, statSync } from "node:fs";
import { join } from "node:path";
import type { CellSamples, LoadedSample } from "./types.ts";
import type { DesignCase } from "../cases.ts";

/** Load one case's samples grouped by cell, or null if the case has no dir. */
export function loadCaseSamples(runDir: string, designCase: DesignCase): CellSamples | null {
  const caseDir = join(runDir, designCase.key);
  if (!existsSync(caseDir)) return null;
  const byCell: CellSamples = new Map();
  for (const cell of readdirSync(caseDir).filter((d) => statSync(join(caseDir, d)).isDirectory())) {
    const cellDir = join(caseDir, cell);
    const samples: LoadedSample[] = readdirSync(cellDir)
      .filter((f) => f.endsWith(".html"))
      .sort()
      .map((f) => {
        const index = f.replace(/\.html$/, "");
        const metaPath = join(cellDir, `${index}.json`);
        let meta: Record<string, unknown> = {};
        if (existsSync(metaPath)) {
          try {
            meta = JSON.parse(readFileSync(metaPath, "utf8"));
          } catch {
            // provenance unreadable — the HTML is what matters
          }
        }
        return { index, htmlPath: join(cellDir, f), meta };
      });
    if (samples.length > 0) byCell.set(cell, samples);
  }
  return byCell.size > 0 ? byCell : null;
}
