/**
 * The "escape from the generic center" metric — the original method-grounding
 * analysis. For each case it measures, per cell: token adherence (palette +
 * fonts), inherited-prohibition violations, intra-arm dispersion, and distance
 * from the no-direction control (the generic center), with permutation tests of
 * each grounded arm against the adjective-description baseline.
 *
 * This is one metric among future others. Its math is unchanged from the
 * original measure.ts; only its packaging — consuming pre-loaded samples,
 * returning a result + markdown via the Metric interface — is new.
 */
import { readFileSync, existsSync } from "node:fs";
import {
  extractFingerprint,
  fingerprintDistance,
  parseColor,
  deltaE,
  type Fingerprint,
  type OKLab,
} from "../fingerprint.ts";
import { CONTROL, baseArm, cellOrder, type DesignCase } from "../cases.ts";
import type { Metric, MetricContext, CellSamples } from "./types.ts";

/** A used color counts as "on palette" below this OKLab distance to the nearest token. */
const ADHERENCE_THRESHOLD = 0.05;
const PERMUTATIONS = 10_000;

interface SampleMetrics {
  index: string;
  fingerprint: Fingerprint;
  paletteAdherence: number | null;
  meanPaletteDistance: number | null;
  usesSpecifiedFonts: boolean | null;
  darkBackground: boolean;
  flags: Record<string, boolean>;
  violationCount: number;
  distToControl: number | null;
}

interface CellReport {
  cell: string;
  samples: number;
  paletteAdherence: number | null;
  meanPaletteDistance: number | null;
  fontMatchRate: number | null;
  violationRates: Record<string, number>;
  meanViolationCount: number;
  meanCounts: { gradients: number; shadows: number; roundedCorners: number; boldUses: number; fontFamilies: number };
  intraArmDispersion: number | null;
  distanceFromControl: number | null;
  excessDistanceFromControl: number | null;
  sampleSummaries: { index: string; violationCount: number; paletteAdherence: number | null; distToControl: number | null }[];
}

interface Comparison {
  cell: string;
  baseline: string;
  deltaDistFromControl: number | null;
  pDistFromControl: number | null;
  deltaViolations: number | null;
  pViolations: number | null;
  deltaDispersion: number | null;
  pDispersion: number | null;
}

export interface CaseReport {
  case: string;
  title: string;
  controlSamples: number;
  controlDispersion: number | null;
  prohibitions: string[];
  requirements: string[];
  cells: CellReport[];
  comparisons: Comparison[];
}

export interface EscapeResult {
  cases: CaseReport[];
}

function palette(designCase: DesignCase, cell: string): { colors: OKLab[]; fonts: string[] } | null {
  const file = designCase.armFiles.get(baseArm(cell));
  if (!file || !existsSync(file)) return null;
  const content = readFileSync(file, "utf8");
  const fm = /^---\n([\s\S]*?)\n---/.exec(content)?.[1] ?? "";
  const colors = [...fm.matchAll(/#[0-9a-fA-F]{6}\b/g)]
    .map((m) => parseColor(m[0]))
    .filter((c): c is OKLab => c !== undefined);
  const fonts = [...fm.matchAll(/fontFamily:\s*(.+)/g)].map((m) => m[1].trim().toLowerCase());
  return { colors, fonts: [...new Set(fonts)] };
}

function measureSample(
  htmlPath: string,
  index: string,
  pal: ReturnType<typeof palette>,
  prohibitions: string[],
  requirements: string[],
): SampleMetrics {
  const html = readFileSync(htmlPath, "utf8");
  const fp = extractFingerprint(html);

  let paletteAdherence: number | null = null;
  let meanPaletteDistance: number | null = null;
  if (pal && pal.colors.length > 0 && fp.colors.length > 0) {
    let weight = 0;
    let adherent = 0;
    let distSum = 0;
    for (const use of fp.colors) {
      const nearest = Math.min(...pal.colors.map((p) => deltaE(use.lab, p)));
      weight += use.count;
      distSum += nearest * use.count;
      if (nearest < ADHERENCE_THRESHOLD) adherent += use.count;
    }
    paletteAdherence = adherent / weight;
    meanPaletteDistance = distSum / weight;
  }

  let usesSpecifiedFonts: boolean | null = null;
  if (pal && pal.fonts.length > 0) {
    usesSpecifiedFonts = pal.fonts.some((f) => fp.fontFamilies.includes(f));
  }

  const bg = fp.backgroundLightness;
  const darkBackground = bg.length > 0 && bg.filter((l) => l < 0.5).length > bg.length / 2;

  const allFlags: Record<string, boolean> = {
    gradients: fp.gradients > 0,
    shadows: fp.shadows > 0,
    roundedCorners: fp.roundedCorners > 0,
    boldUses: fp.boldUses > 0,
    iconFonts: fp.iconFonts > 0,
    extraFonts: fp.fontFamilies.length > 2,
    darkBackground,
  };
  // A violation is a prohibited feature present OR a required feature missing.
  const violationCount =
    prohibitions.filter((p) => allFlags[p]).length + requirements.filter((r) => !allFlags[r]).length;

  return {
    index,
    fingerprint: fp,
    paletteAdherence,
    meanPaletteDistance,
    usesSpecifiedFonts,
    darkBackground,
    flags: allFlags,
    violationCount,
    distToControl: null,
  };
}

function mean(xs: number[]): number | null {
  return xs.length === 0 ? null : xs.reduce((s, v) => s + v, 0) / xs.length;
}

function meanPairwise(fps: Fingerprint[]): number | null {
  if (fps.length < 2) return null;
  const dists: number[] = [];
  for (let i = 0; i < fps.length; i++) {
    for (let j = i + 1; j < fps.length; j++) {
      dists.push(fingerprintDistance(fps[i], fps[j]));
    }
  }
  return mean(dists);
}

function shuffleInPlace<T>(xs: T[]) {
  for (let i = xs.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [xs[i], xs[j]] = [xs[j], xs[i]];
  }
}

function permTestMeans(a: number[], b: number[]): number | null {
  if (a.length < 2 || b.length < 2) return null;
  const obs = Math.abs(mean(a)! - mean(b)!);
  const pool = [...a, ...b];
  let extreme = 0;
  for (let i = 0; i < PERMUTATIONS; i++) {
    shuffleInPlace(pool);
    let sumA = 0;
    for (let k = 0; k < a.length; k++) sumA += pool[k];
    let sumB = 0;
    for (let k = a.length; k < pool.length; k++) sumB += pool[k];
    if (Math.abs(sumA / a.length - sumB / b.length) >= obs - 1e-12) extreme++;
  }
  return (extreme + 1) / (PERMUTATIONS + 1);
}

function permTestDispersion(a: Fingerprint[], b: Fingerprint[]): number | null {
  if (a.length < 3 || b.length < 3) return null;
  const obs = Math.abs((meanPairwise(a) ?? 0) - (meanPairwise(b) ?? 0));
  const pool = [...a, ...b];
  let extreme = 0;
  const iters = Math.min(PERMUTATIONS, 5_000);
  for (let i = 0; i < iters; i++) {
    shuffleInPlace(pool);
    const pa = pool.slice(0, a.length);
    const pb = pool.slice(a.length);
    if (Math.abs((meanPairwise(pa) ?? 0) - (meanPairwise(pb) ?? 0)) >= obs - 1e-12) extreme++;
  }
  return (extreme + 1) / (iters + 1);
}

function baselineFor(cell: string, cells: Set<string>): string | null {
  if (baseArm(cell) === "description" || baseArm(cell) === CONTROL) return null;
  const sameChannel = cell.includes("+prompt") ? "description+prompt" : "description";
  if (cells.has(sameChannel)) return sameChannel;
  if (cells.has("description")) return "description";
  return null;
}

function measureCase(designCase: DesignCase, loaded: CellSamples): CaseReport | null {
  const prohibitions = designCase.config.prohibitions;
  const requirements = designCase.config.requirements ?? [];

  const byCell = new Map<string, SampleMetrics[]>();
  for (const [cell, loadedSamples] of loaded) {
    const pal = palette(designCase, cell);
    const samples = loadedSamples.map((s) => measureSample(s.htmlPath, s.index, pal, prohibitions, requirements));
    if (samples.length > 0) byCell.set(cell, samples);
  }
  if (byCell.size === 0) return null;

  const controlFps = (byCell.get(CONTROL) ?? []).map((s) => s.fingerprint);
  const controlDispersion = meanPairwise(controlFps);
  for (const [cell, samples] of byCell) {
    if (cell === CONTROL) continue;
    for (const s of samples) {
      s.distToControl = controlFps.length > 0 ? mean(controlFps.map((c) => fingerprintDistance(s.fingerprint, c))) : null;
    }
  }

  const cells: CellReport[] = [];
  for (const [cell, samples] of byCell) {
    const fps = samples.map((s) => s.fingerprint);
    const n = samples.length;
    const violationRates: Record<string, number> = {};
    for (const p of prohibitions) {
      violationRates[p] = samples.filter((s) => s.flags[p]).length / n;
    }
    for (const r of requirements) {
      violationRates[`missing-${r}`] = samples.filter((s) => !s.flags[r]).length / n;
    }
    const distanceFromControl =
      cell === CONTROL ? null : mean(samples.map((s) => s.distToControl).filter((v): v is number => v !== null));
    cells.push({
      cell,
      samples: n,
      paletteAdherence: mean(samples.map((s) => s.paletteAdherence).filter((v): v is number => v !== null)),
      meanPaletteDistance: mean(samples.map((s) => s.meanPaletteDistance).filter((v): v is number => v !== null)),
      fontMatchRate: samples.some((s) => s.usesSpecifiedFonts !== null)
        ? samples.filter((s) => s.usesSpecifiedFonts === true).length / samples.filter((s) => s.usesSpecifiedFonts !== null).length
        : null,
      violationRates,
      meanViolationCount: mean(samples.map((s) => s.violationCount)) ?? 0,
      meanCounts: {
        gradients: mean(fps.map((f) => f.gradients)) ?? 0,
        shadows: mean(fps.map((f) => f.shadows)) ?? 0,
        roundedCorners: mean(fps.map((f) => f.roundedCorners)) ?? 0,
        boldUses: mean(fps.map((f) => f.boldUses)) ?? 0,
        fontFamilies: mean(fps.map((f) => f.fontFamilies.length)) ?? 0,
      },
      intraArmDispersion: meanPairwise(fps),
      distanceFromControl,
      excessDistanceFromControl:
        distanceFromControl !== null && controlDispersion !== null ? distanceFromControl - controlDispersion : null,
      sampleSummaries: samples.map((s) => ({
        index: s.index,
        violationCount: s.violationCount,
        paletteAdherence: s.paletteAdherence,
        distToControl: s.distToControl,
      })),
    });
  }
  cells.sort((a, b) => cellOrder(a.cell) - cellOrder(b.cell));

  const cellSet = new Set(byCell.keys());
  const comparisons: Comparison[] = [];
  for (const report of cells) {
    const baseline = baselineFor(report.cell, cellSet);
    if (!baseline) continue;
    const a = byCell.get(report.cell)!;
    const b = byCell.get(baseline)!;
    const aDist = a.map((s) => s.distToControl).filter((v): v is number => v !== null);
    const bDist = b.map((s) => s.distToControl).filter((v): v is number => v !== null);
    const aFps = a.map((s) => s.fingerprint);
    const bFps = b.map((s) => s.fingerprint);
    comparisons.push({
      cell: report.cell,
      baseline,
      deltaDistFromControl: aDist.length && bDist.length ? mean(aDist)! - mean(bDist)! : null,
      pDistFromControl: permTestMeans(aDist, bDist),
      deltaViolations: mean(a.map((s) => s.violationCount))! - mean(b.map((s) => s.violationCount))!,
      pViolations: permTestMeans(a.map((s) => s.violationCount), b.map((s) => s.violationCount)),
      deltaDispersion:
        meanPairwise(aFps) !== null && meanPairwise(bFps) !== null ? meanPairwise(aFps)! - meanPairwise(bFps)! : null,
      pDispersion: permTestDispersion(aFps, bFps),
    });
  }

  return {
    case: designCase.key,
    title: designCase.config.title,
    controlSamples: controlFps.length,
    controlDispersion,
    prohibitions,
    requirements,
    cells,
    comparisons,
  };
}

// ---------------------------------------------------------------------------
// Report rendering
// ---------------------------------------------------------------------------

function fmt(v: number | null, digits = 2): string {
  return v === null ? "—" : v.toFixed(digits);
}

function pct(v: number | null | undefined): string {
  return v === null || v === undefined ? "—" : `${Math.round(v * 100)}%`;
}

function pStr(p: number | null): string {
  if (p === null) return "—";
  return p < 0.05 ? `**${p.toFixed(3)}**` : p.toFixed(3);
}

function renderCase(md: string[], report: CaseReport) {
  md.push(`## Case: ${report.case} — ${report.title}`);
  md.push(``);
  md.push(`### Token adherence`);
  md.push(``);
  md.push(`| cell | n | palette adherence | mean ΔE to palette | specified fonts used |`);
  md.push(`|---|---|---|---|---|`);
  for (const r of report.cells) {
    md.push(`| ${r.cell} | ${r.samples} | ${pct(r.paletteAdherence)} | ${fmt(r.meanPaletteDistance, 3)} | ${pct(r.fontMatchRate)} |`);
  }
  md.push(``);
  const reqCols = report.requirements.map((r) => `missing-${r}`);
  const cols = [...report.prohibitions, ...reqCols];
  md.push(
    `### Inherited prohibitions and requirements (stated only in the full-spec arm, nowhere else: forbid ${report.prohibitions.join(", ") || "—"}${report.requirements.length ? `; require ${report.requirements.join(", ")}` : ""})`,
  );
  md.push(``);
  md.push(`| cell | ${cols.join(" | ")} | mean violations |`);
  md.push(`|---|${cols.map(() => "---").join("|")}|---|`);
  for (const r of report.cells) {
    md.push(`| ${r.cell} | ${cols.map((p) => pct(r.violationRates[p])).join(" | ")} | ${fmt(r.meanViolationCount, 1)} |`);
  }
  md.push(``);
  md.push(`### Consistency and distance from the generic center`);
  md.push(``);
  md.push(
    `Distance measured against ${report.controlSamples} \`${CONTROL}\` samples; **excess distance** subtracts the control's own dispersion (${fmt(report.controlDispersion, 3)}).`,
  );
  md.push(``);
  md.push(`| cell | intra-arm dispersion ↓ | distance from control | excess distance ↑ |`);
  md.push(`|---|---|---|---|`);
  for (const r of report.cells) {
    md.push(`| ${r.cell} | ${fmt(r.intraArmDispersion, 3)} | ${fmt(r.distanceFromControl, 3)} | ${fmt(r.excessDistanceFromControl, 3)} |`);
  }
  md.push(``);
  md.push(`### Significance vs the description baseline (permutation tests)`);
  md.push(``);
  md.push(`| cell | baseline | Δ dist-from-control (p) | Δ violations (p) | Δ dispersion (p) |`);
  md.push(`|---|---|---|---|---|`);
  for (const c of report.comparisons) {
    md.push(
      `| ${c.cell} | ${c.baseline} | ${fmt(c.deltaDistFromControl, 3)} (${pStr(c.pDistFromControl)}) | ${fmt(c.deltaViolations, 2)} (${pStr(c.pViolations)}) | ${fmt(c.deltaDispersion, 3)} (${pStr(c.pDispersion)}) |`,
    );
  }
  if (report.comparisons.length === 0) md.push(`| — | — | no description baseline in this run | | |`);
  md.push(``);
}

export const escapeMetric: Metric<EscapeResult> = {
  name: "escape-from-center",
  description:
    "Distance each grounded arm achieved from the no-direction control (the generic center), with token adherence, inherited-prohibition violations, dispersion, and permutation tests vs the adjective-description baseline.",

  measure(ctx: MetricContext): EscapeResult {
    const cases: CaseReport[] = [];
    for (const designCase of ctx.cases) {
      const loaded = ctx.samplesByCase.get(designCase.key);
      if (!loaded) continue;
      const report = measureCase(designCase, loaded);
      if (report) cases.push(report);
    }
    return { cases };
  },

  render(result: EscapeResult): string[] {
    const md: string[] = [];
    md.push(
      `Adherence threshold: OKLab ΔE < ${ADHERENCE_THRESHOLD} · permutations: ${PERMUTATIONS.toLocaleString()}.`,
    );
    md.push(``);
    md.push(
      `Cells suffixed \`+prompt\` injected the DESIGN.md directly into the generation prompt; unsuffixed cells used the tool's design-system pipeline. A large gap between channels for the same arm means the design-system pipeline is flattening the prose treatment. Bold p-values < 0.05; with small n, non-significance means underpowered, not "no effect".`,
    );
    md.push(``);
    for (const report of result.cases) renderCase(md, report);
    return md;
  },
};
