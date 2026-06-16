/**
 * Build-time data layer: reads the real measured run (runs/demo) — report.json,
 * config.json, and the eval snapshot — and exposes typed views for the pages.
 * This is what makes the MVP real: the numbers and renderings come from an
 * actual generate+measure run, not placeholders.
 */
import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { join, resolve } from "node:path";

const RUNS = resolve(process.cwd(), "..", "runs");
const RUN = "demo";
const runDir = join(RUNS, RUN);

const report = JSON.parse(readFileSync(join(runDir, "report.json"), "utf8"));
const config = report.config ?? {};

// --- display vocabulary ---------------------------------------------------
export const CASE_TITLES: Record<string, string> = {
  "agent-slides": "Agent Architecture",
  auralis: "Auralis",
  "dc-tracks": "DC Tracks",
  "night-birding": "Urban Nocturnal Field Guide",
};
export const CASE_WORLDS: Record<string, string> = {
  "agent-slides": "A seven-slide technical talk on AI agent loops.",
  auralis: "A marketing site for an AI voice platform.",
  "dc-tracks": "An editorial music publication for Washington, DC.",
  "night-birding": "A field-notes site for night birding in the city.",
};
export const TREATMENTS: Record<string, { name: string; blurb: string }> = {
  "no-design-md": { name: "No direction", blurb: "The brief alone — the default look everything else is measured from." },
  "tokens-only": { name: "Tokens only", blurb: "The shared palette and type, with no words about how to use them." },
  description: { name: "Adjectives", blurb: "The shared tokens, plus an adjective description. The method being challenged." },
  object: { name: "One real object", blurb: "The shared tokens, plus one named artifact: a graduate CS lecture handout." },
  constraint: { name: "One hard constraint", blurb: "The shared tokens, plus one limitation to live inside." },
  metaphor: { name: "One governing metaphor", blurb: "The shared tokens, plus one idea mapped onto every element." },
  "full-spec": { name: "Full specification", blurb: "The complete designer-grade specification." },
};
export const ORDER = ["no-design-md", "tokens-only", "description", "object", "constraint", "metaphor", "full-spec"];

const round2 = (n: number | null | undefined) => (n == null ? null : Math.round(n * 100) / 100);
const toolLabel = `${config.tool ?? "stitch"} · ${config.model ?? "GEMINI_3_1_PRO"}`
  .replace("stitch", "Stitch")
  .replace("GEMINI_3_1_PRO", "Gemini 3.1 Pro");

export interface Treatment {
  key: string;
  name: string;
  blurb: string;
  distance: number | null; // excess distance from the tool's default look
  samplePath: string | null; // live iframe of a real rendering
  samples: number;
  isControl: boolean;
}

export interface CaseView {
  key: string;
  title: string;
  world: string;
  tool: string;
  evalHash: string;
  measuredCount: number;
  headline: string;
  treatments: Treatment[];
}

/** Design-system-channel cells only (drop "+prompt"), in ladder order, that have samples. */
function caseCells(caseKey: string) {
  const c = report.cases.find((x: any) => x.case === caseKey);
  if (!c) return null;
  const cells = c.cells.filter((cell: any) => !cell.cell.includes("+"));
  cells.sort((a: any, b: any) => ORDER.indexOf(a.cell) - ORDER.indexOf(b.cell));
  return { c, cells };
}

function samplePath(caseKey: string, cell: string): string | null {
  const p = join("public", "samples", caseKey, `${cell}.html`);
  return existsSync(p) ? `/samples/${caseKey}/${cell}.html` : null;
}

/** The nth rendering of a cell, from the per-sample copies. */
function samplePathN(caseKey: string, cell: string, n: number): string | null {
  const p = join("public", "samples", caseKey, cell, `${n}.html`);
  return existsSync(p) ? `/samples/${caseKey}/${cell}/${n}.html` : null;
}

export function caseView(caseKey: string): CaseView | null {
  const found = caseCells(caseKey);
  if (!found) return null;
  const { c, cells } = found;
  const treatments: Treatment[] = cells.map((cell: any) => ({
    key: cell.cell,
    name: TREATMENTS[cell.cell]?.name ?? cell.cell,
    blurb: TREATMENTS[cell.cell]?.blurb ?? "",
    distance: cell.cell === "no-design-md" ? 0 : round2(cell.excessDistanceFromControl),
    samplePath: samplePath(caseKey, cell.cell),
    samples: cell.samples ?? 0,
    isControl: cell.cell === "no-design-md",
  }));
  const obj = treatments.find((t) => t.key === "object");
  const desc = treatments.find((t) => t.key === "description");
  const headline =
    obj && desc && obj.distance != null && desc.distance != null
      ? `Naming one real object — a graduate CS lecture handout — landed ${obj.distance} from the model's default look, versus ${desc.distance} for an adjective description.`
      : `Measured across ${c.cells.reduce((s: number, x: any) => s + (x.samples ?? 0), 0)} renderings.`;
  return {
    key: caseKey,
    title: CASE_TITLES[caseKey] ?? caseKey,
    world: CASE_WORLDS[caseKey] ?? "",
    tool: toolLabel,
    evalHash: config.evalHash ?? "—",
    measuredCount: c.cells.reduce((s: number, x: any) => s + (x.samples ?? 0), 0),
    headline,
    treatments,
  };
}

export function listCases(): { key: string; title: string; world: string; headline: string; thumb: string | null }[] {
  return report.cases.map((c: any) => {
    const v = caseView(c.case)!;
    const best = v.treatments.find((t) => t.key === "object") ?? v.treatments.find((t) => t.samplePath);
    return { key: c.case, title: v.title, world: v.world, headline: v.headline, thumb: best?.samplePath ?? null };
  });
}

// ---------------------------------------------------------------------------
// Blind judgment: the reader picks the rendering that most escapes the default
// look without seeing labels, then the reveal shows whether the measurement
// agrees. Options are shuffled deterministically so the judge and reveal pages
// place the same letter on the same rendering.
// ---------------------------------------------------------------------------

function strHash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export interface JudgeOption {
  letter: string; // A, B, C…
  treatmentKey: string;
  treatmentName: string;
  distance: number | null; // excess from the default look
  isControl: boolean;
  isWinner: boolean; // the measurement's pick — farthest from default
  samplePath: string | null;
}

export interface JudgeView {
  caseKey: string;
  caseTitle: string;
  tool: string;
  evalHash: string;
  options: JudgeOption[]; // shuffled, lettered
  winnerLetter: string;
  winnerName: string;
  winnerProse: string; // the grounding words that produced the winner
  index: number; // this case's place in the judging sequence (0-based)
  total: number; // cases that can be judged
  prevKey: string | null;
  nextKey: string | null;
}

/** Cases with at least two sampled treatments — enough to judge between. */
function judgeableCases(): string[] {
  return listCases()
    .filter((c) => {
      const v = caseView(c.key);
      return (v?.treatments.filter((t) => t.samplePath).length ?? 0) >= 2;
    })
    .map((c) => c.key);
}

export function judgeView(caseKey: string): JudgeView | null {
  const v = caseView(caseKey);
  if (!v) return null;
  const pool = v.treatments.filter((t) => t.samplePath);
  if (pool.length < 2) return null;
  // The measurement's pick: farthest from the default look.
  const winnerKey = pool.reduce((best, t) => ((t.distance ?? 0) > (best.distance ?? 0) ? t : best), pool[0]).key;
  // Deterministic shuffle: stable order keyed by case, identical on both pages.
  const shuffled = [...pool].sort((a, b) => strHash(caseKey + a.key) - strHash(caseKey + b.key));
  const options: JudgeOption[] = shuffled.map((t, i) => ({
    letter: String.fromCharCode(65 + i),
    treatmentKey: t.key,
    treatmentName: t.name,
    distance: t.isControl ? 0 : t.distance,
    isControl: t.isControl,
    isWinner: t.key === winnerKey,
    samplePath: t.samplePath,
  }));
  const winner = options.find((o) => o.isWinner)!;
  const seq = judgeableCases();
  const index = seq.indexOf(caseKey);
  return {
    caseKey,
    caseTitle: v.title,
    tool: v.tool,
    evalHash: v.evalHash,
    options,
    winnerLetter: winner.letter,
    winnerName: winner.treatmentName,
    winnerProse: firstParagraph(armProse(caseKey, winnerKey)),
    index,
    total: seq.length,
    prevKey: index > 0 ? seq[index - 1] : null,
    nextKey: index >= 0 && index + 1 < seq.length ? seq[index + 1] : null,
  };
}

/** The first real paragraph of a grounding doc — the sentence(s) that set the look. */
function firstParagraph(md: string): string {
  for (const block of md.split(/\n\s*\n/)) {
    const t = block.trim();
    if (!t || t.startsWith("#") || t.startsWith("-") || t.startsWith("*")) continue;
    return t.replace(/\s+/g, " ");
  }
  return md.split(/\n\s*\n/)[0]?.trim() ?? "";
}

export function listJudgeable(): string[] {
  return judgeableCases();
}

export interface RenderingView {
  caseTitle: string;
  caseKey: string;
  treatmentKey: string;
  treatmentName: string;
  n: number;
  total: number;
  tool: string;
  date: string;
  samplePath: string | null;
  distance: number | null;
  fieldMarks: { label: string; value: string }[];
  exactWords: string;
}

/** The exact words the model received: the arm's full grounding document (after
 *  the front matter), as markdown. Token references like {colors.neutral} are
 *  inline annotations in the source — strip them so the prose reads cleanly. */
function armProse(caseKey: string, treatment: string): string {
  const p = join(runDir, "eval", caseKey, "arms", `${treatment}.DESIGN.md`);
  if (!existsSync(p)) return "";
  return readFileSync(p, "utf8")
    .replace(/^---\n[\s\S]*?\n---\n?/, "")
    .replace(/\s*\{[a-z][\w.-]*\}/gi, "")
    .trim();
}

export function renderingView(caseKey: string, treatment: string, n: number): RenderingView | null {
  const found = caseCells(caseKey);
  if (!found) return null;
  const cell = found.c.cells.find((x: any) => x.cell === treatment);
  if (!cell) return null;
  const mc = cell.meanCounts ?? {};
  const fieldMarks = [
    { label: "Gradients", value: mc.gradients > 0 ? `${mc.gradients.toFixed(1)} avg` : "none found" },
    { label: "Drop shadows", value: mc.shadows > 0 ? `${mc.shadows.toFixed(1)} avg` : "none found" },
    { label: "Rounded corners", value: mc.roundedCorners > 0 ? `${mc.roundedCorners.toFixed(1)} avg` : "none found" },
    { label: "Font families", value: `${(mc.fontFamilies ?? 0).toFixed(1)} avg` },
    { label: "Palette adherence", value: cell.paletteAdherence != null ? `${Math.round(cell.paletteAdherence * 100)}%` : "—" },
  ];
  // Per-sample distance when we have it, falling back to the treatment mean.
  const base = cellBaseline(cell);
  const ss = (cell.sampleSummaries ?? []).find((x: any) => String(x.index) === String(n));
  const perSample = treatment === "no-design-md" ? 0 : ss && ss.distToControl != null ? round2(Math.max(0, ss.distToControl - base)) : round2(cell.excessDistanceFromControl);
  return {
    caseTitle: CASE_TITLES[caseKey] ?? caseKey,
    caseKey,
    treatmentKey: treatment,
    treatmentName: TREATMENTS[treatment]?.name ?? treatment,
    n,
    total: cell.samples ?? 0,
    tool: toolLabel,
    date: /^\d{4}-\d{2}-\d{2}/.test(config.startedAt ?? "") ? config.startedAt.slice(0, 10) : "2026-06-10",
    samplePath: samplePathN(caseKey, treatment, n) ?? samplePath(caseKey, treatment),
    distance: perSample,
    fieldMarks,
    exactWords: armProse(caseKey, treatment),
  };
}

// ---------------------------------------------------------------------------
// Treatment sheet: every rendering of one treatment, to read consistency.
// The question is agreement — given the same input N times, how much did the
// results converge? Grounded direction tends to stabilize; adjectives wander.
// ---------------------------------------------------------------------------

/** Distance the control's own renderings sit at, so per-sample distances read
 *  on the same "from the default look" scale as the rest of the site. */
function cellBaseline(cell: any): number {
  if (cell.distanceFromControl == null || cell.excessDistanceFromControl == null) return 0;
  return cell.distanceFromControl - cell.excessDistanceFromControl;
}

export interface SampleMark {
  n: number;
  distance: number | null;
  samplePath: string | null;
}

export interface TreatmentSheet {
  caseKey: string;
  caseTitle: string;
  world: string;
  treatmentKey: string;
  treatmentName: string;
  blurb: string;
  tool: string;
  evalHash: string;
  date: string;
  isControl: boolean;
  distance: number | null; // treatment mean, excess from default look
  samples: SampleMark[];
  spread: number | null; // widest minus narrowest per-sample distance
  dispersion: number | null; // intra-arm dispersion (the eval's own consistency number)
  contrastName: string | null; // the adjective treatment, for a consistency contrast
  contrastSpread: number | null;
}

function cellSamples(cell: any, caseKey: string): SampleMark[] {
  const base = cellBaseline(cell);
  const sum = cell.sampleSummaries ?? [];
  const n = Math.max(sum.length, cell.samples ?? 0);
  const marks: SampleMark[] = [];
  for (let i = 0; i < n; i++) {
    const s = sum.find((x: any) => String(x.index) === String(i));
    // A rendering can't be "more default than default" — clamp noise below the
    // baseline to 0, where it reads honestly as "landed at the default look".
    const d = s && s.distToControl != null ? round2(Math.max(0, s.distToControl - base)) : null;
    marks.push({ n: i, distance: cell.cell === "no-design-md" ? 0 : d, samplePath: samplePathN(caseKey, cell.cell, i) });
  }
  return marks;
}

export function treatmentSheet(caseKey: string, treatment: string): TreatmentSheet | null {
  const found = caseCells(caseKey);
  if (!found) return null;
  const cell = found.c.cells.find((x: any) => x.cell === treatment);
  if (!cell) return null;
  const samples = cellSamples(cell, caseKey);
  const dists = samples.map((s) => s.distance).filter((d): d is number => d != null);
  const spread = dists.length > 1 ? round2(Math.max(...dists) - Math.min(...dists)) : dists.length ? 0 : null;
  // The adjective treatment, for the "same words, wider wandering" contrast.
  const desc = found.c.cells.find((x: any) => x.cell === "description");
  let contrastSpread: number | null = null;
  if (desc && desc.cell !== treatment) {
    const ds = cellSamples(desc, caseKey).map((s) => s.distance).filter((d): d is number => d != null);
    contrastSpread = ds.length > 1 ? round2(Math.max(...ds) - Math.min(...ds)) : null;
  }
  return {
    caseKey,
    caseTitle: CASE_TITLES[caseKey] ?? caseKey,
    world: CASE_WORLDS[caseKey] ?? "",
    treatmentKey: treatment,
    treatmentName: TREATMENTS[treatment]?.name ?? treatment,
    blurb: TREATMENTS[treatment]?.blurb ?? "",
    tool: toolLabel,
    evalHash: config.evalHash ?? "—",
    date: /^\d{4}-\d{2}-\d{2}/.test(config.startedAt ?? "") ? config.startedAt.slice(0, 10) : "2026-06-10",
    isControl: treatment === "no-design-md",
    distance: treatment === "no-design-md" ? 0 : round2(cell.excessDistanceFromControl),
    samples,
    spread,
    dispersion: cell.intraArmDispersion != null ? round2(cell.intraArmDispersion) : null,
    contrastName: desc && desc.cell !== treatment ? TREATMENTS["description"]?.name ?? "Adjectives" : null,
    contrastSpread,
  };
}

// ---------------------------------------------------------------------------
// The measurements ledger: every run/batch, from its real config + report.
// ---------------------------------------------------------------------------

function prettyModel(m: string): string {
  return ({ GEMINI_3_1_PRO: "Gemini 3.1 Pro", GEMINI_3_PRO: "Gemini 3 Pro", GEMINI_3_FLASH: "Gemini 3 Flash" } as Record<string, string>)[m] ?? m;
}
function expLabel(e: string): string {
  return e === "tool-comparison" ? "tool comparison" : "method grounding";
}
function metricLabel(m: string): string {
  return m === "fidelity-to-direction" ? "fidelity to direction" : "distance from default look";
}
function pickDate(startedAt: unknown, name: string): string {
  if (typeof startedAt === "string" && /^\d{4}-\d{2}-\d{2}/.test(startedAt)) return startedAt.slice(0, 10);
  const m = /(\d{4}-\d{2}-\d{2})/.exec(name);
  return m ? m[1] : "";
}
function readJson(p: string): any {
  return existsSync(p) ? JSON.parse(readFileSync(p, "utf8")) : null;
}

export interface RunRow {
  name: string;
  date: string;
  experiment: string;
  experimentLabel: string;
  toolLabel: string;
  metricLabel: string;
  evalHash: string;
  cases: string[];
  samples: number;
  measured: boolean;
  headline: string;
  stat: { value: string; caption: string };
}

function runHeadline(rep: any, experiment: string, samples: number, cases: string[]): string {
  if (!rep) return "Generated but never measured — no claims trace here.";
  const caseList = cases.map((c) => CASE_TITLES[c] ?? c).join(", ");
  try {
    if (experiment === "tool-comparison") {
      const cells = [...(rep.cases?.[0]?.cells ?? [])].sort((a, b) => (b.paletteAdherence ?? 0) - (a.paletteAdherence ?? 0));
      if (cells.length >= 2 && cells[0].paletteAdherence != null) {
        const pc = (n: number) => `${Math.round(n * 100)}%`;
        return `${cells[0].tool ?? cells[0].cell} reproduced ${pc(cells[0].paletteAdherence)} of its color on the handed palette; ${cells[cells.length - 1].tool ?? cells[cells.length - 1].cell} ${pc(cells[cells.length - 1].paletteAdherence)}.`;
      }
    } else {
      for (const c of rep.cases ?? []) {
        const obj = c.cells?.find((x: any) => x.cell === "object");
        const desc = c.cells?.find((x: any) => x.cell === "description");
        if (obj?.excessDistanceFromControl != null && desc?.excessDistanceFromControl != null) {
          return `On ${CASE_TITLES[c.case] ?? c.case}, one real object landed ${round2(obj.excessDistanceFromControl)} from the default look versus ${round2(desc.excessDistanceFromControl)} for adjectives.`;
        }
      }
    }
  } catch {
    /* fall through to the count line */
  }
  return `${samples} renderings measured across ${caseList}.`;
}

export function listRuns(): RunRow[] {
  const dir = RUNS;
  const rows = readdirSync(dir)
    .filter((d) => statSync(join(dir, d)).isDirectory())
    .map((name) => {
      const runPath = join(dir, name);
      const cfg = readJson(join(runPath, "config.json")) ?? {};
      const rep = readJson(join(runPath, "report.json"));
      const experiment = cfg.experiment ?? "method-grounding";
      const metric = rep?.metric ?? cfg.metric ?? (experiment === "tool-comparison" ? "fidelity-to-direction" : "escape-from-center");
      const cases = rep ? rep.cases.map((c: any) => c.case) : Object.keys(cfg.caseHashes ?? {});
      const samples = rep ? rep.cases.reduce((s: number, c: any) => s + c.cells.reduce((t: number, cell: any) => t + (cell.samples ?? 0), 0), 0) : 0;
      return {
        name,
        date: pickDate(cfg.startedAt, name),
        experiment,
        experimentLabel: expLabel(experiment),
        toolLabel: `${(cfg.tool ?? "stitch").replace(/^stitch$/, "Stitch")} · ${prettyModel(cfg.model ?? "—")}`,
        metricLabel: metricLabel(metric),
        evalHash: cfg.evalHash ?? "—",
        cases,
        samples,
        measured: !!rep,
        headline: runHeadline(rep, experiment, samples, cases),
        stat: runStat(rep, experiment),
        _mtime: statSync(runPath).mtimeMs,
      };
    });
  rows.sort((a: any, b: any) => b._mtime - a._mtime);
  return rows.map(({ _mtime, ...r }: any) => r);
}

// --- visual measurements page: a hero "what a measurement is", + a stat per run ---

export interface HeroPair {
  caseTitle: string;
  defaultSrc: string | null;
  groundedSrc: string | null;
  distance: number | null;
}

/** The canonical measurement, shown: one case's no-direction default look beside
 *  its grounded rendering, with the distance between them. */
export function heroPair(caseKey = "agent-slides"): HeroPair | null {
  const v = caseView(caseKey);
  if (!v) return null;
  const def = v.treatments.find((t) => t.isControl);
  const grounded = v.treatments.find((t) => t.key === "object");
  return {
    caseTitle: v.title,
    defaultSrc: def?.samplePath ?? null,
    groundedSrc: grounded?.samplePath ?? null,
    distance: grounded?.distance ?? null,
  };
}

// ---------------------------------------------------------------------------
// Tool comparison: the same brief handed to two tools, scored on how much of
// the handed palette each one actually reproduced (fidelity to direction).
// ---------------------------------------------------------------------------

const TOOL_NAMES: Record<string, string> = {
  gemini: "Gemini 3.1 Pro",
  stitch: "Stitch",
};

export interface CompareTool {
  tool: string;
  toolName: string;
  fidelity: number; // 0..1 — share of the handed palette that showed up
  fontMatch: number; // 0..1 — share of renderings that matched the handed type
  samplePath: string | null;
}

export interface CompareView {
  caseKey: string;
  caseTitle: string;
  world: string;
  evalHash: string;
  direction: string; // which arm both tools received (e.g. full-spec)
  samplesPerTool: number;
  tools: CompareTool[]; // sorted most-faithful first
}

/** The one tool-comparison run, as a view: both tools' renderings of the same
 *  brief, ranked by palette fidelity. Returns null if the run isn't present. */
export function compareView(runName = "tool-comp-smoke"): CompareView | null {
  const runPath = join(RUNS, runName);
  const rep = readJson(join(runPath, "report.json"));
  const cfg = readJson(join(runPath, "config.json")) ?? {};
  if (!rep?.cases?.length) return null;
  const c = rep.cases[0];
  const caseKey = c.case;
  const tools: CompareTool[] = (c.cells ?? [])
    .map((cell: any) => {
      const tool = cell.tool ?? cell.cell.split("+")[0];
      const p = join("public", "samples", "compare", caseKey, `${tool}.html`);
      return {
        tool,
        toolName: TOOL_NAMES[tool] ?? tool,
        fidelity: cell.paletteAdherence ?? 0,
        fontMatch: cell.fontMatchRate ?? 0,
        samplePath: existsSync(p) ? `/samples/compare/${caseKey}/${tool}.html` : null,
      };
    })
    .sort((a: CompareTool, b: CompareTool) => b.fidelity - a.fidelity);
  return {
    caseKey,
    caseTitle: CASE_TITLES[caseKey] ?? caseKey,
    world: CASE_WORLDS[caseKey] ?? "",
    evalHash: cfg.evalHash ?? "—",
    direction: c.cells?.[0]?.directionArm ?? "full-spec",
    samplesPerTool: c.cells?.[0]?.samples ?? 0,
    tools,
  };
}

function runStat(rep: any, experiment: string): { value: string; caption: string } {
  if (!rep) return { value: "—", caption: "not measured" };
  try {
    if (experiment === "tool-comparison") {
      const top = [...(rep.cases?.[0]?.cells ?? [])].sort((a, b) => (b.paletteAdherence ?? 0) - (a.paletteAdherence ?? 0))[0];
      if (top?.paletteAdherence != null) return { value: `${Math.round(top.paletteAdherence * 100)}%`, caption: "top tool fidelity to the handed palette" };
    } else {
      for (const c of rep.cases ?? []) {
        const obj = c.cells?.find((x: any) => x.cell === "object");
        if (obj?.excessDistanceFromControl != null) return { value: `${round2(obj.excessDistanceFromControl)}`, caption: "grounded distance from the default look" };
      }
    }
  } catch {
    /* fall through */
  }
  return { value: "—", caption: "measured" };
}
