/**
 * The "fidelity to the handed direction" metric — the tool-comparison check.
 * Where the escape metric measures distance AWAY from the no-direction control,
 * fidelity measures distance TOWARD the DESIGN.md a cell was handed: did the
 * output actually use the palette and fonts it was given? It needs no control;
 * it compares cells (tools, in tool comparison) by how faithfully each
 * reproduced the same direction.
 *
 * This is the second metric, and building it tested the metric seam: it reuses
 * the OKLab palette machinery but reframes it, recovers the handed tokens from
 * the directionArm recorded in each sample's provenance (the cell name is a
 * tool name here, not an arm), and produces a different result shape — cell
 * rankings, not control distances. The interface held without change.
 */
import { readFileSync, existsSync } from "node:fs";
import { extractFingerprint, parseColor, deltaE, type OKLab } from "../fingerprint.ts";
import { baseArm, type DesignCase } from "../cases.ts";
import type { Metric, MetricContext, CellSamples, LoadedSample } from "./types.ts";

/** A color counts as "on the handed palette" below this OKLab distance to the nearest token. */
const ADHERENCE_THRESHOLD = 0.05;

/** Read the palette + fonts a cell was handed, from its direction arm's front matter. */
function directionTokens(designCase: DesignCase, arm: string): { colors: OKLab[]; fonts: string[] } | null {
  const file = designCase.armFiles.get(arm);
  if (!file || !existsSync(file)) return null;
  const fm = /^---\n([\s\S]*?)\n---/.exec(readFileSync(file, "utf8"))?.[1] ?? "";
  const colors = [...fm.matchAll(/#[0-9a-fA-F]{6}\b/g)]
    .map((m) => parseColor(m[0]))
    .filter((c): c is OKLab => c !== undefined);
  const fonts = [...fm.matchAll(/fontFamily:\s*(.+)/g)].map((m) => m[1].trim().toLowerCase());
  return { colors, fonts: [...new Set(fonts)] };
}

interface SampleFidelity {
  paletteAdherence: number | null;
  meanPaletteDistance: number | null;
  usesSpecifiedFonts: boolean | null;
}

function measureSample(htmlPath: string, tokens: { colors: OKLab[]; fonts: string[] }): SampleFidelity {
  const fp = extractFingerprint(readFileSync(htmlPath, "utf8"));
  let paletteAdherence: number | null = null;
  let meanPaletteDistance: number | null = null;
  if (tokens.colors.length > 0 && fp.colors.length > 0) {
    let weight = 0;
    let adherent = 0;
    let distSum = 0;
    for (const use of fp.colors) {
      const nearest = Math.min(...tokens.colors.map((p) => deltaE(use.lab, p)));
      weight += use.count;
      distSum += nearest * use.count;
      if (nearest < ADHERENCE_THRESHOLD) adherent += use.count;
    }
    paletteAdherence = adherent / weight;
    meanPaletteDistance = distSum / weight;
  }
  const usesSpecifiedFonts = tokens.fonts.length > 0 ? tokens.fonts.some((f) => fp.fontFamilies.includes(f)) : null;
  return { paletteAdherence, meanPaletteDistance, usesSpecifiedFonts };
}

function mean(xs: number[]): number | null {
  return xs.length === 0 ? null : xs.reduce((s, v) => s + v, 0) / xs.length;
}

interface CellFidelity {
  cell: string;
  tool: string;
  directionArm: string;
  samples: number;
  paletteAdherence: number | null;
  meanPaletteDistance: number | null;
  fontMatchRate: number | null;
}

interface CaseFidelity {
  case: string;
  title: string;
  cells: CellFidelity[];
}

export interface FidelityResult {
  cases: CaseFidelity[];
}

/** The arm a cell was handed: recorded in provenance going forward; for older
 *  runs the cell name was the arm, so fall back to baseArm. */
function directionArmOf(cell: string, samples: LoadedSample[]): string {
  const recorded = samples.find((s) => typeof s.meta.directionArm === "string")?.meta.directionArm;
  return (recorded as string) ?? baseArm(cell);
}

function toolOf(cell: string, samples: LoadedSample[]): string {
  const recorded = samples.find((s) => typeof s.meta.tool === "string")?.meta.tool;
  return (recorded as string) ?? cell;
}

function measureCase(designCase: DesignCase, loaded: CellSamples): CaseFidelity | null {
  const cells: CellFidelity[] = [];
  for (const [cell, samples] of loaded) {
    const arm = directionArmOf(cell, samples);
    const tokens = directionTokens(designCase, arm);
    if (!tokens) continue; // no handed direction (e.g. a control cell) — nothing to be faithful to
    const measured = samples.map((s) => measureSample(s.htmlPath, tokens));
    cells.push({
      cell,
      tool: toolOf(cell, samples),
      directionArm: arm,
      samples: samples.length,
      paletteAdherence: mean(measured.map((m) => m.paletteAdherence).filter((v): v is number => v !== null)),
      meanPaletteDistance: mean(measured.map((m) => m.meanPaletteDistance).filter((v): v is number => v !== null)),
      fontMatchRate: measured.some((m) => m.usesSpecifiedFonts !== null)
        ? measured.filter((m) => m.usesSpecifiedFonts === true).length / measured.filter((m) => m.usesSpecifiedFonts !== null).length
        : null,
    });
  }
  if (cells.length === 0) return null;
  // Rank by adherence (higher is more faithful); ties broken by lower mean distance.
  cells.sort((a, b) => (b.paletteAdherence ?? -1) - (a.paletteAdherence ?? -1) || (a.meanPaletteDistance ?? 1) - (b.meanPaletteDistance ?? 1));
  return { case: designCase.key, title: designCase.config.title, cells };
}

function fmt(v: number | null, digits = 3): string {
  return v === null ? "—" : v.toFixed(digits);
}
function pct(v: number | null): string {
  return v === null ? "—" : `${Math.round(v * 100)}%`;
}

export const fidelityMetric: Metric<FidelityResult> = {
  name: "fidelity-to-direction",
  description:
    "How faithfully each cell reproduced the design direction it was handed: share of color use on the handed palette, mean perceptual distance to it, and whether the specified fonts appear. Ranks cells (tools, in tool comparison) by fidelity. Needs no control.",

  measure(ctx: MetricContext): FidelityResult {
    const cases: CaseFidelity[] = [];
    for (const designCase of ctx.cases) {
      const loaded = ctx.samplesByCase.get(designCase.key);
      if (!loaded) continue;
      const report = measureCase(designCase, loaded);
      if (report) cases.push(report);
    }
    return { cases };
  },

  render(result: FidelityResult): string[] {
    const md: string[] = [];
    md.push(
      `Fidelity measured as the share of color use within OKLab ΔE < ${ADHERENCE_THRESHOLD} of the handed palette, plus mean distance to it and whether the specified fonts appear. Cells are ranked most-faithful first; the handed direction is named per row.`,
    );
    md.push(``);
    for (const report of result.cases) {
      md.push(`## Case: ${report.case} — ${report.title}`);
      md.push(``);
      md.push(`| cell | tool | handed direction | n | palette adherence ↑ | mean ΔE to palette ↓ | specified fonts used ↑ |`);
      md.push(`|---|---|---|---|---|---|---|`);
      for (const c of report.cells) {
        md.push(
          `| ${c.cell} | ${c.tool} | ${c.directionArm} | ${c.samples} | ${pct(c.paletteAdherence)} | ${fmt(c.meanPaletteDistance)} | ${pct(c.fontMatchRate)} |`,
        );
      }
      md.push(``);
    }
    return md;
  },
};
