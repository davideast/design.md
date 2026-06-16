/** Typed read layer over the runs/ root — shared by all views and the JSON API. */
import { readFileSync, readdirSync, existsSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { ROOT, loadCases, loadRunCases, evalHashOf, cellOrder, baseArm, RUN_RESERVED_DIRS } from "../cases.ts";
import { extractFingerprint, parseColor, deltaE, type Fingerprint, type OKLab } from "../fingerprint.ts";

/** A used color counts as "on palette" below this OKLab distance to the nearest token (mirrors measure.ts). */
export const ADHERENCE_THRESHOLD = 0.05;

export interface RunCaseSummary {
  key: string;
  cells: number;
  samples: number;
  failed: number;
  caseHash?: string;
  headline: { cell: string; excess: number; significant: boolean } | null;
}

export interface RunSummary {
  id: string;
  startedAt?: string;
  resumedAt?: string[];
  model?: string;
  channels?: string[];
  evalHash?: string;
  demo: boolean;
  measured: boolean;
  judged: number;
  cases: RunCaseSummary[];
  totalSamples: number;
  totalFailed: number;
}

export interface MatrixSample {
  index: string;
  png: boolean;
}

export interface MatrixCell {
  cell: string;
  samples: MatrixSample[];
}

export interface MatrixCase {
  key: string;
  title: string;
  deviceType: string;
  genericCenter?: string;
  prohibitions: string[];
  requirements: string[];
  evalHash?: string;
  drifted: boolean;
  cells: MatrixCell[];
}

export interface Matrix {
  run: string;
  /** Absolute runs root — lets views resolve per-sample artifacts lazily. */
  root: string;
  config: any | null;
  report: any | null;
  cases: MatrixCase[];
}

function isDir(p: string) {
  return existsSync(p) && statSync(p).isDirectory();
}

function readJson(p: string): any | null {
  try {
    return existsSync(p) ? JSON.parse(readFileSync(p, "utf8")) : null;
  } catch {
    return null;
  }
}

export function caseDirsOf(runDir: string): string[] {
  return readdirSync(runDir).filter((d) => !RUN_RESERVED_DIRS.has(d) && isDir(join(runDir, d)));
}

export function runIds(root: string): string[] {
  if (!existsSync(root)) return [];
  return readdirSync(root)
    .filter((d) => isDir(join(root, d)))
    .filter((d) => existsSync(join(root, d, "config.json")) || caseDirsOf(join(root, d)).length > 0);
}

export function buildIndex(root: string): RunSummary[] {
  const runs = runIds(root).map((id): RunSummary => {
    const runDir = join(root, id);
    const config = readJson(join(runDir, "config.json"));
    const report = readJson(join(runDir, "report.json"));

    const cases = caseDirsOf(runDir).map((caseKey): RunCaseSummary => {
      const caseDir = join(runDir, caseKey);
      let samples = 0;
      let failed = 0;
      const cells = readdirSync(caseDir).filter((d) => isDir(join(caseDir, d)));
      for (const cell of cells) {
        const files = readdirSync(join(caseDir, cell));
        samples += files.filter((f) => f.endsWith(".html")).length;
        failed += files.filter((f) => f.endsWith(".error.txt")).length;
      }
      // Headline: the cell furthest from the generic center, with significance
      // vs description when the permutation test has it.
      let headline: RunCaseSummary["headline"] = null;
      const rc = report?.cases?.find((c: any) => c.case === caseKey);
      if (rc) {
        for (const cell of rc.cells ?? []) {
          if (cell.excessDistanceFromControl == null) continue;
          if (!headline || cell.excessDistanceFromControl > headline.excess) {
            const cmp = rc.comparisons?.find((x: any) => x.cell === cell.cell);
            headline = {
              cell: cell.cell,
              excess: cell.excessDistanceFromControl,
              significant: cmp?.pDistFromControl != null && cmp.pDistFromControl < 0.05,
            };
          }
        }
      }
      return { key: caseKey, cells: cells.length, samples, failed, caseHash: config?.caseHashes?.[caseKey], headline };
    });

    return {
      id,
      startedAt: config?.startedAt,
      resumedAt: config?.resumedAt,
      model: config?.model,
      channels: config?.channels,
      evalHash: config?.evalHash,
      demo: config?.demo ?? false,
      measured: existsSync(join(runDir, "report.json")),
      judged: Object.keys(readJudgments(root, id)).length,
      cases,
      totalSamples: cases.reduce((s, c) => s + c.samples, 0),
      totalFailed: cases.reduce((s, c) => s + c.failed, 0),
    };
  });
  // Newest first; undated (legacy) runs last.
  runs.sort((a, b) => (b.startedAt ?? "").localeCompare(a.startedAt ?? ""));
  return runs;
}

export function buildMatrix(root: string, runId: string): Matrix {
  const runDir = join(root, runId);
  const runCases = loadRunCases(runDir);
  const caseMeta = new Map(runCases.map((c) => [c.key, c.config]));
  const snapshotHashes = evalHashOf(runCases).caseHashes;
  let workingHashes: Record<string, string> = {};
  try {
    workingHashes = evalHashOf(loadCases(runCases.map((c) => c.key))).caseHashes;
  } catch {
    // a case may have been renamed/deleted in the working tree; treat as drifted
  }

  const cases = caseDirsOf(runDir)
    .sort()
    .map((caseKey): MatrixCase => {
      const caseDir = join(runDir, caseKey);
      const cells = readdirSync(caseDir)
        .filter((d) => isDir(join(caseDir, d)))
        .sort((a, b) => cellOrder(a) - cellOrder(b))
        .map((cell) => {
          const cellDir = join(caseDir, cell);
          const samples = readdirSync(cellDir)
            .filter((f) => f.endsWith(".html"))
            .sort()
            .map((f) => {
              const index = f.replace(/\.html$/, "");
              return { index, png: existsSync(join(cellDir, `${index}.png`)) };
            });
          return { cell, samples };
        })
        .filter((c) => c.samples.length > 0);
      const meta = caseMeta.get(caseKey);
      return {
        key: caseKey,
        title: meta?.title ?? caseKey,
        deviceType: meta?.deviceType ?? "DESKTOP",
        genericCenter: meta?.genericCenter,
        prohibitions: meta?.prohibitions ?? [],
        requirements: meta?.requirements ?? [],
        evalHash: snapshotHashes[caseKey],
        drifted: caseKey in snapshotHashes && workingHashes[caseKey] !== snapshotHashes[caseKey],
        cells,
      };
    })
    .filter((c) => c.cells.length > 0);

  return { run: runId, root, config: readJson(join(runDir, "config.json")), report: readJson(join(runDir, "report.json")), cases };
}

// ---------------------------------------------------------------------------
// Per-sample artifacts, resolved lazily from the filesystem
// ---------------------------------------------------------------------------

const fpCache = new Map<string, { mtime: number; fp: Fingerprint }>();

/** Style fingerprint of one sample, computed from its HTML on demand (mtime-cached). */
export function fingerprintFor(root: string, runId: string, caseKey: string, cell: string, index: string): Fingerprint | null {
  const file = join(root, runId, caseKey, cell, `${index}.html`);
  if (!existsSync(file)) return null;
  const mtime = statSync(file).mtimeMs;
  const cached = fpCache.get(file);
  if (cached && cached.mtime === mtime) return cached.fp;
  const fp = extractFingerprint(readFileSync(file, "utf8"));
  fpCache.set(file, { mtime, fp });
  return fp;
}

export interface PaletteInfo {
  colors: { css: string; lab: OKLab }[];
  fonts: string[];
}

/** The token palette a cell was generated against, from its arm's front matter. */
export function cellPalette(root: string, runId: string, caseKey: string, cell: string): PaletteInfo | null {
  const doc = armDocFor(root, runId, caseKey, cell);
  if (!doc) return null;
  const fm = /^---\n([\s\S]*?)\n---/.exec(doc.content)?.[1] ?? "";
  const seen = new Set<string>();
  const colors: PaletteInfo["colors"] = [];
  for (const m of fm.matchAll(/#[0-9a-fA-F]{6}\b/g)) {
    const css = m[0].toLowerCase();
    const lab = parseColor(css);
    if (lab && !seen.has(css)) {
      seen.add(css);
      colors.push({ css, lab });
    }
  }
  const fonts = [...new Set([...fm.matchAll(/fontFamily:\s*(.+)/g)].map((m) => m[1].trim().toLowerCase()))];
  return { colors, fonts };
}

/** Nearest palette token for a used color, with its OKLab distance. */
export function nearestToken(lab: OKLab, palette: PaletteInfo): { css: string; dist: number } | null {
  if (palette.colors.length === 0) return null;
  let best = palette.colors[0];
  let bestDist = deltaE(lab, best.lab);
  for (const p of palette.colors.slice(1)) {
    const d = deltaE(lab, p.lab);
    if (d < bestDist) {
      best = p;
      bestDist = d;
    }
  }
  return { css: best.css, dist: bestDist };
}

/** Generation metadata written by generate.ts (<i>.json), if present. */
export function sampleMetaFor(root: string, runId: string, caseKey: string, cell: string, index: string): any | null {
  return readJson(join(root, runId, caseKey, cell, `${index}.json`));
}

/** Raw MCP response dumps for a cell, if any. */
export function rawFilesFor(root: string, runId: string, caseKey: string, cell: string): string[] {
  const dir = join(root, runId, caseKey, cell, "raw");
  if (!isDir(dir)) return [];
  return readdirSync(dir).filter((f) => f.endsWith(".json")).sort();
}

// ---------------------------------------------------------------------------
// Human judgments — captured in the viewer (ideally blinded), persisted per
// run, and the eventual calibration target for any LLM judge.
// ---------------------------------------------------------------------------

export type Verdict = "good" | "mixed" | "poor";
export const VERDICTS: Verdict[] = ["good", "mixed", "poor"];

export interface Judgment {
  verdict: Verdict;
  note: string;
  /** True when the verdict was given in blind mode — the credible kind. */
  blinded: boolean;
  at: string;
}

export function judgmentKey(caseKey: string, cell: string, index: string): string {
  return `${caseKey}/${cell}/${index}`;
}

export function readJudgments(root: string, runId: string): Record<string, Judgment> {
  return readJson(join(root, runId, "judgments.json")) ?? {};
}

export function writeJudgment(root: string, runId: string, key: string, judgment: Judgment) {
  const all = readJudgments(root, runId);
  all[key] = judgment;
  writeFileSync(join(root, runId, "judgments.json"), JSON.stringify(all, null, 2));
}

export function cellVerdictCounts(judgments: Record<string, Judgment>, caseKey: string, cell: string) {
  const counts = { good: 0, mixed: 0, poor: 0, total: 0, blinded: 0 };
  const prefix = `${caseKey}/${cell}/`;
  for (const [key, j] of Object.entries(judgments)) {
    if (!key.startsWith(prefix)) continue;
    counts[j.verdict]++;
    counts.total++;
    if (j.blinded) counts.blinded++;
  }
  return counts;
}

// ---------------------------------------------------------------------------
// View-state helpers shared by run/sample/blind pages
// ---------------------------------------------------------------------------

export interface ViewState {
  caseKey: string | null;
  channel: "all" | "design-system" | "prompt";
  size: number;
  blind: boolean;
  reveal: boolean;
}

export function parseViewState(url: URL, matrix: Matrix): ViewState {
  const caseParam = url.searchParams.get("case");
  const keys = matrix.cases.map((c) => c.key);
  const channel = url.searchParams.get("channel");
  return {
    caseKey: caseParam && keys.includes(caseParam) ? caseParam : keys[0] ?? null,
    channel: channel === "design-system" || channel === "prompt" ? channel : "all",
    size: Math.max(160, Math.min(420, Number(url.searchParams.get("size")) || 260)),
    blind: url.searchParams.get("blind") === "1",
    reveal: url.searchParams.get("reveal") === "1",
  };
}

export function visibleCells(c: MatrixCase, channel: ViewState["channel"]): MatrixCell[] {
  return c.cells.filter((cell) => {
    if (channel === "all") return true;
    const isPrompt = cell.cell.includes("+prompt");
    if (channel === "prompt") return isPrompt || cell.cell === "no-design-md";
    return !isPrompt;
  });
}

export interface FlatSample {
  case: string;
  cell: string;
  index: string;
  png: boolean;
}

/** Samples of a case in grid order, or seeded-shuffled order when blinded. */
export function flatSamples(matrix: Matrix, c: MatrixCase, state: ViewState): FlatSample[] {
  const flat: FlatSample[] = [];
  for (const cell of visibleCells(c, state.channel)) {
    for (const s of cell.samples) flat.push({ case: c.key, cell: cell.cell, index: s.index, png: s.png });
  }
  return state.blind ? seededShuffle(flat, matrix.run + c.key) : flat;
}

export function seededShuffle<T>(arr: T[], seedStr: string): T[] {
  let h = 2166136261;
  for (const ch of seedStr) {
    h ^= ch.charCodeAt(0);
    h = Math.imul(h, 16777619);
  }
  const rand = () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export function cellMetrics(matrix: Matrix, caseKey: string, cell: string): any | null {
  const rc = matrix.report?.cases?.find((c: any) => c.case === caseKey);
  return rc?.cells?.find((c: any) => c.cell === cell) ?? null;
}

export function sampleMetrics(matrix: Matrix, caseKey: string, cell: string, index: string): any | null {
  return cellMetrics(matrix, caseKey, cell)?.sampleSummaries?.find((s: any) => s.index === index) ?? null;
}

export interface ArmDoc {
  content: string;
  /** Where the document came from — the run's snapshot, or the working tree (legacy runs). */
  source: "snapshot" | "working-tree";
}

/** The DESIGN.md a cell was generated from, preferring the run's eval snapshot. */
export function armDocFor(root: string, runId: string, caseKey: string, cell: string): ArmDoc | null {
  const arm = baseArm(cell);
  if (arm === "no-design-md") return null;
  const candidates: [string, ArmDoc["source"]][] = [
    [join(root, runId, "eval", caseKey, "arms", `${arm}.DESIGN.md`), "snapshot"],
    [join(ROOT, "cases", caseKey, "arms", `${arm}.DESIGN.md`), "working-tree"],
  ];
  for (const [file, source] of candidates) {
    if (existsSync(file)) return { content: readFileSync(file, "utf8"), source };
  }
  return null;
}

export function caseComparison(matrix: Matrix, caseKey: string, cell: string): any | null {
  const rc = matrix.report?.cases?.find((c: any) => c.case === caseKey);
  return rc?.comparisons?.find((x: any) => x.cell === cell) ?? null;
}

export const VIEWPORT: Record<string, [number, number]> = {
  DESKTOP: [1280, 800],
  TABLET: [834, 1112],
  MOBILE: [390, 844],
  AGNOSTIC: [1280, 800],
};
