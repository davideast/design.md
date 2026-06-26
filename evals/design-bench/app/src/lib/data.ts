/**
 * Unified data library for the Design Bench viewer.
 *
 * Single source of truth: reads from bench.db (SQLite). No hardcoded provider
 * lists, no hardcoded run constants. The CLI writes; this module reads.
 *
 * Uses better-sqlite3 (Node.js compatible) since Astro runs through Vite/Node,
 * not Bun. Same synchronous API as bun:sqlite.
 */
import Database from "better-sqlite3";
import { join, resolve } from "node:path";
import { existsSync, readFileSync } from "node:fs";
import { CASE_TITLES, CASE_WORLDS, TREATMENTS, ORDER } from "./vocab";

// Re-export for pages
export { CASE_TITLES, CASE_WORLDS, TREATMENTS, ORDER } from "./vocab";

// ---------------------------------------------------------------------------
// Database connection (read-only)
// ---------------------------------------------------------------------------

const DB_PATH = resolve(process.cwd(), "..", "bench.db");

type Db = InstanceType<typeof Database>;

function getDb(): Db {
  if (!existsSync(DB_PATH)) {
    // Graceful fallback: return an in-memory DB so Astro builds don't crash
    // before `bun bench seed` has been run.
    console.warn(`[data] bench.db not found at ${DB_PATH} — returning empty data`);
    const mem = new Database(":memory:");
    mem.exec(`
      CREATE TABLE providers (key TEXT PRIMARY KEY, label TEXT, sort_order INTEGER DEFAULT 0, featured INTEGER DEFAULT 0);
      CREATE TABLE runs (id TEXT PRIMARY KEY, provider_key TEXT, model TEXT, tool TEXT, eval_hash TEXT, experiment TEXT, metric TEXT, config TEXT, created_at TEXT, measured_at TEXT);
      CREATE TABLE cells (run_id TEXT, case_key TEXT, arm TEXT, channel TEXT DEFAULT 'prompt', samples INTEGER DEFAULT 0, palette_adherence REAL, mean_delta_e REAL, font_match_rate REAL, distance_from_control REAL, excess_distance REAL, intra_arm_dispersion REAL, violations TEXT, mean_violations REAL, raw TEXT, PRIMARY KEY (run_id, case_key, arm, channel));
    `);
    return mem;
  }
  return new Database(DB_PATH, { readonly: true });
}

// Module-level connection (cached for the build)
let _db: Db | null = null;
function db(): Db {
  if (!_db) _db = getDb();
  return _db;
}

// ---------------------------------------------------------------------------
// Providers
// ---------------------------------------------------------------------------

export interface Provider {
  key: string;
  label: string;
  featured: boolean;
  runs: string[];
}

function buildProviders(filter?: string): Provider[] {
  const where = filter ?? '1=1';
  const provRows = db()
    .prepare(`SELECT key, label, featured FROM providers WHERE ${where} ORDER BY sort_order, key`)
    .all() as { key: string; label: string; featured: number }[];

  const runRows = db()
    .prepare(`SELECT id, provider_key FROM runs ORDER BY created_at DESC`)
    .all() as { id: string; provider_key: string }[];

  return provRows.map((p) => ({
    key: p.key,
    label: p.label,
    featured: p.featured === 1,
    runs: runRows.filter((r) => r.provider_key === p.key).map((r) => r.id),
  }));
}

/** All providers (for /matrix page). */
export function providers(): Provider[] {
  return buildProviders();
}

/** Only featured providers (for home page grid). */
export function featuredProviders(): Provider[] {
  return buildProviders('featured = 1');
}

/** Total number of providers in the database. */
export function providerCount(): number {
  const row = db().prepare(`SELECT COUNT(*) as c FROM providers`).get() as { c: number };
  return row.c;
}

// ---------------------------------------------------------------------------
// Grid (home page) — breadth view
// ---------------------------------------------------------------------------

export interface GridTile {
  providerKey: string;
  providerLabel: string;
  caseKey: string;
  caseTitle: string;
  world: string;
  bestArm: string;
  bestScore: number | null;
  renderPath: string | null;
}

export function gridTiles(): GridTile[] {
  // All case keys that have cells, in a stable order
  const caseKeys = db()
    .prepare(`SELECT DISTINCT case_key FROM cells ORDER BY case_key`)
    .all() as { case_key: string }[];

  const provs = providers();
  const tiles: GridTile[] = [];

  for (const { case_key: caseKey } of caseKeys) {
    for (const p of provs) {
      if (!p.runs.length) continue;
      const best = db()
        .prepare(
          `SELECT c.arm, c.excess_distance, c.run_id, c.channel
           FROM cells c
           JOIN runs r ON c.run_id = r.id
           WHERE r.provider_key = ? AND c.case_key = ? AND c.arm != 'no-design-md'
           ORDER BY c.excess_distance DESC
           LIMIT 1`,
        )
        .get(p.key, caseKey) as {
          arm: string;
          excess_distance: number | null;
          run_id: string;
          channel: string;
        } | null;

      if (!best) continue;

      tiles.push({
        providerKey: p.key,
        providerLabel: p.label,
        caseKey,
        caseTitle: CASE_TITLES[caseKey] ?? caseKey,
        world: CASE_WORLDS[caseKey] ?? "",
        bestArm: best.arm,
        bestScore: best.excess_distance,
        renderPath: resolveRenderPath(best.run_id, caseKey, best.arm, best.channel),
      });
    }
  }

  return tiles;
}

// ---------------------------------------------------------------------------
// Depth view — all arms for one provider × case
// ---------------------------------------------------------------------------

export interface Arm {
  key: string;
  name: string;
  blurb: string;
  score: number | null;
  isControl: boolean;
  render: string | null;
  samples: number;
}

export function armsFor(providerKey: string, caseKey: string): Arm[] {
  const rows = db()
    .prepare(
      `SELECT c.arm, c.excess_distance, c.samples, c.run_id, c.channel
       FROM cells c
       JOIN runs r ON c.run_id = r.id
       WHERE r.provider_key = ? AND c.case_key = ?`,
    )
    .all(providerKey, caseKey) as {
      arm: string;
      excess_distance: number | null;
      samples: number;
      run_id: string;
      channel: string;
    }[];

  // Normalize: one entry per arm, preferring bare over +prompt
  const byArm = new Map<string, (typeof rows)[0]>();
  for (const row of rows) {
    const prev = byArm.get(row.arm);
    if (!prev || (row.channel !== "prompt" && prev.channel === "prompt")) {
      byArm.set(row.arm, row);
    }
  }

  const arms: Arm[] = [];
  for (const armKey of ORDER) {
    const row = byArm.get(armKey);
    if (!row) continue;
    arms.push({
      key: armKey,
      name: TREATMENTS[armKey]?.name ?? armKey,
      blurb: TREATMENTS[armKey]?.blurb ?? "",
      score: armKey === "no-design-md" ? 0 : round2(row.excess_distance),
      isControl: armKey === "no-design-md",
      render: resolveRenderPath(row.run_id, caseKey, armKey, row.channel),
      samples: row.samples,
    });
  }

  return arms;
}

export function bestArm(providerKey: string, caseKey: string): Arm | null {
  const candidates = armsFor(providerKey, caseKey).filter((a) => !a.isControl && a.render);
  if (!candidates.length) return null;
  return candidates.reduce((best, a) => ((a.score ?? -1) > (best.score ?? -1) ? a : best));
}

/** Get a specific arm for a provider×case. Returns null if that arm doesn't exist. */
export function armForProvider(providerKey: string, caseKey: string, armKey: string): Arm | null {
  return armsFor(providerKey, caseKey).find((a) => a.key === armKey && a.render) ?? null;
}

/** All arm keys that exist across any provider×case (excluding control). */
export function availableArms(): string[] {
  const rows = db()
    .prepare(`SELECT DISTINCT c.arm FROM cells c WHERE c.arm != 'no-design-md' ORDER BY c.arm`)
    .all() as { arm: string }[];
  // Return in canonical ORDER
  const keys = new Set(rows.map((r) => r.arm));
  return ORDER.filter((k) => keys.has(k));
}

// ---------------------------------------------------------------------------
// Depth view — for getStaticPaths
// ---------------------------------------------------------------------------

export interface DepthView {
  providerKey: string;
  providerLabel: string;
  caseKey: string;
  caseTitle: string;
  world: string;
  arms: Arm[];
}

export function depthView(providerKey: string, caseKey: string): DepthView | null {
  const provs = providers();
  const provider = provs.find((p) => p.key === providerKey);
  const arms = armsFor(providerKey, caseKey).filter((a) => a.render);
  if (!provider || !arms.length) return null;
  return {
    providerKey,
    providerLabel: provider.label,
    caseKey,
    caseTitle: CASE_TITLES[caseKey] ?? caseKey,
    world: CASE_WORLDS[caseKey] ?? "",
    arms,
  };
}

export function depthPaths(): { provider: string; case: string }[] {
  return gridTiles().map((t) => ({ provider: t.providerKey, case: t.caseKey }));
}

// ---------------------------------------------------------------------------
// Cross-provider view — one case, all providers
// ---------------------------------------------------------------------------

export interface ProviderResult {
  providerKey: string;
  providerLabel: string;
  featured: boolean;
  best: Arm | null;
  allArms: Arm[];
}

export interface CrossProviderView {
  caseKey: string;
  caseTitle: string;
  world: string;
  results: ProviderResult[];
}

export function crossProviderView(caseKey: string): CrossProviderView | null {
  const title = CASE_TITLES[caseKey];
  if (!title) return null;

  const allProvs = providers();
  const results: ProviderResult[] = allProvs.map((p) => ({
    providerKey: p.key,
    providerLabel: p.label,
    featured: p.featured,
    best: bestArm(p.key, caseKey),
    allArms: armsFor(p.key, caseKey),
  }));

  return {
    caseKey,
    caseTitle: title,
    world: CASE_WORLDS[caseKey] ?? "",
    results,
  };
}

// ---------------------------------------------------------------------------
// Measurements ledger
// ---------------------------------------------------------------------------

export interface RunInfo {
  name: string;
  providerKey: string;
  providerLabel: string;
  date: string;
  experiment: string;
  tool: string;
  model: string;
  metric: string;
  evalHash: string;
  cellCount: number;
  sampleCount: number;
  measured: boolean;
}

export function listRuns(): RunInfo[] {
  const provs = providers();
  const provMap = new Map(provs.map((p) => [p.key, p.label]));

  const runs = db()
    .prepare(`SELECT * FROM runs ORDER BY created_at DESC`)
    .all() as {
      id: string;
      provider_key: string;
      model: string | null;
      tool: string | null;
      eval_hash: string | null;
      experiment: string | null;
      metric: string | null;
      created_at: string | null;
      measured_at: string | null;
    }[];

  return runs.map((r) => {
    const stats = db()
      .prepare(
        `SELECT COUNT(*) as c, COALESCE(SUM(samples), 0) as s FROM cells WHERE run_id = ?`,
      )
      .get(r.id) as { c: number; s: number };

    return {
      name: r.id,
      providerKey: r.provider_key,
      providerLabel: provMap.get(r.provider_key) ?? r.provider_key,
      date: r.created_at?.slice(0, 10) ?? "",
      experiment: r.experiment ?? "method-grounding",
      tool: r.tool ?? "agent",
      model: r.model ?? "—",
      metric: r.metric ?? "escape-from-center",
      evalHash: r.eval_hash ?? "—",
      cellCount: stats.c,
      sampleCount: stats.s,
      measured: !!r.measured_at,
    };
  });
}

// ---------------------------------------------------------------------------
// Case views (case detail pages) — read from raw JSON in the cells table
// ---------------------------------------------------------------------------

/** The first provider that has measured data for a case. Used as the default
 *  when a page doesn't specify a provider (backward compat for old routes). */
function defaultProviderForCase(caseKey: string): string | null {
  const row = db()
    .prepare(
      `SELECT r.provider_key FROM cells c
       JOIN runs r ON c.run_id = r.id
       WHERE c.case_key = ?
       ORDER BY r.created_at ASC
       LIMIT 1`,
    )
    .get(caseKey) as { provider_key: string } | undefined;
  return row?.provider_key ?? null;
}

/** The run that backs a provider for case-detail pages. */
function defaultRunForProvider(providerKey: string): string | null {
  const row = db()
    .prepare(`SELECT id FROM runs WHERE provider_key = ? AND measured_at IS NOT NULL ORDER BY created_at ASC LIMIT 1`)
    .get(providerKey) as { id: string } | undefined;
  return row?.id ?? null;
}

function rawCell(runId: string, caseKey: string, arm: string): any | null {
  const row = db()
    .prepare(`SELECT raw FROM cells WHERE run_id = ? AND case_key = ? AND arm = ? LIMIT 1`)
    .get(runId, caseKey, arm) as { raw: string } | undefined;
  return row?.raw ? JSON.parse(row.raw) : null;
}

function allRawCells(runId: string, caseKey: string): any[] {
  const rows = db()
    .prepare(`SELECT arm, raw FROM cells WHERE run_id = ? AND case_key = ? ORDER BY arm`)
    .all(runId, caseKey) as { arm: string; raw: string }[];
  return rows.map((r) => ({ arm: r.arm, ...JSON.parse(r.raw) }));
}

export interface Treatment {
  key: string;
  name: string;
  blurb: string;
  distance: number | null;
  samplePath: string | null;
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

export function caseView(caseKey: string, providerKey?: string): CaseView | null {
  const pKey = providerKey ?? defaultProviderForCase(caseKey);
  if (!pKey) return null;
  const runId = defaultRunForProvider(pKey);
  if (!runId) return null;

  const run = db().prepare(`SELECT * FROM runs WHERE id = ?`).get(runId) as any;
  const config = run?.config ? JSON.parse(run.config) : {};
  const toolLabel = formatToolLabel(config.tool, config.model);

  const cells = allRawCells(runId, caseKey);
  if (!cells.length) return null;

  // Sort by ORDER
  cells.sort((a, b) => ORDER.indexOf(a.arm) - ORDER.indexOf(b.arm));

  const treatments: Treatment[] = cells.map((cell) => ({
    key: cell.arm,
    name: TREATMENTS[cell.arm]?.name ?? cell.arm,
    blurb: TREATMENTS[cell.arm]?.blurb ?? "",
    distance: cell.arm === "no-design-md" ? 0 : round2(cell.excessDistanceFromControl),
    samplePath: resolveRenderPath(runId, caseKey, cell.arm, cell.cell?.includes?.("+") ? "prompt" : "prompt"),
    samples: cell.samples ?? 0,
    isControl: cell.arm === "no-design-md",
  }));

  const obj = treatments.find((t) => t.key === "object");
  const desc = treatments.find((t) => t.key === "description");
  const headline =
    obj && desc && obj.distance != null && desc.distance != null
      ? `Naming one real object landed ${obj.distance} from the model's default look, versus ${desc.distance} for an adjective description.`
      : `Measured across ${cells.reduce((s, x) => s + (x.samples ?? 0), 0)} renderings.`;

  return {
    key: caseKey,
    title: CASE_TITLES[caseKey] ?? caseKey,
    world: CASE_WORLDS[caseKey] ?? "",
    tool: toolLabel,
    evalHash: config.evalHash ?? "—",
    measuredCount: cells.reduce((s, x) => s + (x.samples ?? 0), 0),
    headline,
    treatments,
  };
}

export function listCases(): { key: string; title: string; world: string; headline: string; thumb: string | null }[] {
  const caseKeys = db()
    .prepare(`SELECT DISTINCT case_key FROM cells ORDER BY case_key`)
    .all() as { case_key: string }[];

  return caseKeys
    .map(({ case_key }) => {
      const v = caseView(case_key);
      if (!v) return null;
      const best = v.treatments.find((t) => t.key === "object") ?? v.treatments.find((t) => t.samplePath);
      return {
        key: case_key,
        title: v.title,
        world: v.world,
        headline: v.headline,
        thumb: best?.samplePath ?? null,
      };
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);
}

// ---------------------------------------------------------------------------
// Treatment sheet — all renderings of one treatment
// ---------------------------------------------------------------------------

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
  distance: number | null;
  samples: SampleMark[];
  spread: number | null;
  dispersion: number | null;
  contrastName: string | null;
  contrastSpread: number | null;
}

function cellBaseline(cell: any): number {
  if (cell.distanceFromControl == null || cell.excessDistanceFromControl == null) return 0;
  return cell.distanceFromControl - cell.excessDistanceFromControl;
}

function buildSampleMarks(cell: any, runId: string, caseKey: string): SampleMark[] {
  const base = cellBaseline(cell);
  const sum = cell.sampleSummaries ?? [];
  const n = Math.max(sum.length, cell.samples ?? 0);
  const marks: SampleMark[] = [];
  for (let i = 0; i < n; i++) {
    const s = sum.find((x: any) => String(x.index) === String(i));
    const d = s && s.distToControl != null ? round2(Math.max(0, s.distToControl - base)) : null;
    marks.push({
      n: i,
      distance: cell.arm === "no-design-md" ? 0 : d,
      samplePath: resolveRenderPathN(runId, caseKey, cell.arm, i),
    });
  }
  return marks;
}

export function treatmentSheet(caseKey: string, treatment: string, providerKey?: string): TreatmentSheet | null {
  const pKey = providerKey ?? defaultProviderForCase(caseKey);
  if (!pKey) return null;
  const runId = defaultRunForProvider(pKey);
  if (!runId) return null;

  const run = db().prepare(`SELECT * FROM runs WHERE id = ?`).get(runId) as any;
  const config = run?.config ? JSON.parse(run.config) : {};

  const cell = rawCell(runId, caseKey, treatment);
  if (!cell) return null;
  cell.arm = treatment; // ensure arm is set for buildSampleMarks

  const samples = buildSampleMarks(cell, runId, caseKey);
  const dists = samples.map((s) => s.distance).filter((d): d is number => d != null);
  const spread = dists.length > 1 ? round2(Math.max(...dists) - Math.min(...dists)) : dists.length ? 0 : null;

  // Contrast against the adjective treatment
  const descCell = rawCell(runId, caseKey, "description");
  let contrastSpread: number | null = null;
  if (descCell && treatment !== "description") {
    descCell.arm = "description";
    const ds = buildSampleMarks(descCell, runId, caseKey)
      .map((s) => s.distance)
      .filter((d): d is number => d != null);
    contrastSpread = ds.length > 1 ? round2(Math.max(...ds) - Math.min(...ds)) : null;
  }

  const startedAt = config.startedAt ?? "";
  const date = /^\d{4}-\d{2}-\d{2}/.test(startedAt) ? startedAt.slice(0, 10) : "2026-06-10";

  return {
    caseKey,
    caseTitle: CASE_TITLES[caseKey] ?? caseKey,
    world: CASE_WORLDS[caseKey] ?? "",
    treatmentKey: treatment,
    treatmentName: TREATMENTS[treatment]?.name ?? treatment,
    blurb: TREATMENTS[treatment]?.blurb ?? "",
    tool: formatToolLabel(config.tool, config.model),
    evalHash: config.evalHash ?? "—",
    date,
    isControl: treatment === "no-design-md",
    distance: treatment === "no-design-md" ? 0 : round2(cell.excessDistanceFromControl),
    samples,
    spread,
    dispersion: cell.intraArmDispersion != null ? round2(cell.intraArmDispersion) : null,
    contrastName: descCell && treatment !== "description" ? TREATMENTS["description"]?.name ?? "Adjectives" : null,
    contrastSpread,
  };
}

// ---------------------------------------------------------------------------
// Rendering view — single rendering detail
// ---------------------------------------------------------------------------

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

export function renderingView(caseKey: string, treatment: string, n: number, providerKey?: string): RenderingView | null {
  const pKey = providerKey ?? defaultProviderForCase(caseKey);
  if (!pKey) return null;
  const runId = defaultRunForProvider(pKey);
  if (!runId) return null;

  const run = db().prepare(`SELECT * FROM runs WHERE id = ?`).get(runId) as any;
  const config = run?.config ? JSON.parse(run.config) : {};

  const cell = rawCell(runId, caseKey, treatment);
  if (!cell) return null;

  const mc = cell.meanCounts ?? {};
  const fieldMarks = [
    { label: "Gradients", value: mc.gradients > 0 ? `${mc.gradients.toFixed(1)} avg` : "none found" },
    { label: "Drop shadows", value: mc.shadows > 0 ? `${mc.shadows.toFixed(1)} avg` : "none found" },
    { label: "Rounded corners", value: mc.roundedCorners > 0 ? `${mc.roundedCorners.toFixed(1)} avg` : "none found" },
    { label: "Font families", value: `${(mc.fontFamilies ?? 0).toFixed(1)} avg` },
    { label: "Palette adherence", value: cell.paletteAdherence != null ? `${Math.round(cell.paletteAdherence * 100)}%` : "—" },
  ];

  const base = cellBaseline(cell);
  const ss = (cell.sampleSummaries ?? []).find((x: any) => String(x.index) === String(n));
  const perSample =
    treatment === "no-design-md"
      ? 0
      : ss && ss.distToControl != null
        ? round2(Math.max(0, ss.distToControl - base))
        : round2(cell.excessDistanceFromControl);

  const startedAt = config.startedAt ?? "";
  const date = /^\d{4}-\d{2}-\d{2}/.test(startedAt) ? startedAt.slice(0, 10) : "2026-06-10";

  return {
    caseTitle: CASE_TITLES[caseKey] ?? caseKey,
    caseKey,
    treatmentKey: treatment,
    treatmentName: TREATMENTS[treatment]?.name ?? treatment,
    n,
    total: cell.samples ?? 0,
    tool: formatToolLabel(config.tool, config.model),
    date,
    samplePath: resolveRenderPathN(runId, caseKey, treatment, n) ?? resolveRenderPath(runId, caseKey, treatment),
    distance: perSample,
    fieldMarks,
    exactWords: armProse(runId, caseKey, treatment),
  };
}

// ---------------------------------------------------------------------------
// Blind judgment
// ---------------------------------------------------------------------------

function strHash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export interface JudgeOption {
  letter: string;
  treatmentKey: string;
  treatmentName: string;
  distance: number | null;
  isControl: boolean;
  isWinner: boolean;
  samplePath: string | null;
}

export interface JudgeView {
  caseKey: string;
  caseTitle: string;
  tool: string;
  evalHash: string;
  options: JudgeOption[];
  winnerLetter: string;
  winnerName: string;
  winnerProse: string;
  index: number;
  total: number;
  prevKey: string | null;
  nextKey: string | null;
}

function judgeableCases(): string[] {
  return listCases()
    .filter((c) => {
      const v = caseView(c.key);
      return (v?.treatments.filter((t) => t.samplePath).length ?? 0) >= 2;
    })
    .map((c) => c.key);
}

export function listJudgeable(): string[] {
  return judgeableCases();
}

export function judgeView(caseKey: string, providerKey?: string): JudgeView | null {
  const v = caseView(caseKey, providerKey);
  if (!v) return null;
  const pool = v.treatments.filter((t) => t.samplePath);
  if (pool.length < 2) return null;

  const winnerKey = pool.reduce((best, t) => ((t.distance ?? 0) > (best.distance ?? 0) ? t : best), pool[0]).key;

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

  // Get the run ID for the arm prose lookup
  const pKey = providerKey ?? defaultProviderForCase(caseKey);
  const runId = pKey ? defaultRunForProvider(pKey) : null;

  return {
    caseKey,
    caseTitle: v.title,
    tool: v.tool,
    evalHash: v.evalHash,
    options,
    winnerLetter: winner.letter,
    winnerName: winner.treatmentName,
    winnerProse: firstParagraph(runId ? armProse(runId, caseKey, winnerKey) : ""),
    index,
    total: seq.length,
    prevKey: index > 0 ? seq[index - 1] : null,
    nextKey: index >= 0 && index + 1 < seq.length ? seq[index + 1] : null,
  };
}

// ---------------------------------------------------------------------------
// Hero pair (measurements page)
// ---------------------------------------------------------------------------

export interface HeroPair {
  caseTitle: string;
  defaultSrc: string | null;
  groundedSrc: string | null;
  distance: number | null;
}

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
// Tool comparison (compare page)
// ---------------------------------------------------------------------------

const TOOL_NAMES: Record<string, string> = {
  gemini: "Gemini 3.1 Pro",
  stitch: "Stitch",
};

export interface CompareTool {
  tool: string;
  toolName: string;
  fidelity: number;
  fontMatch: number;
  samplePath: string | null;
}

export interface CompareView {
  caseKey: string;
  caseTitle: string;
  world: string;
  evalHash: string;
  direction: string;
  samplesPerTool: number;
  tools: CompareTool[];
}

export function compareView(runName = "tool-comp-smoke"): CompareView | null {
  // Read from report.json on disk — the tool-comparison run has a different
  // metric shape that doesn't map cleanly to the cells table.
  const reportPath = resolve(process.cwd(), "..", "runs", runName, "report.json");
  const configPath = resolve(process.cwd(), "..", "runs", runName, "config.json");
  if (!existsSync(reportPath)) return null;

  const rep = JSON.parse(readFileSync(reportPath, "utf8"));
  const cfg = existsSync(configPath) ? JSON.parse(readFileSync(configPath, "utf8")) : {};
  if (!rep?.cases?.length) return null;

  const c = rep.cases[0];
  const caseKey = c.case;
  const tools: CompareTool[] = (c.cells ?? [])
    .map((cell: any) => {
      const tool = cell.tool ?? cell.cell.split("+")[0];
      return {
        tool,
        toolName: TOOL_NAMES[tool] ?? tool,
        fidelity: cell.paletteAdherence ?? 0,
        fontMatch: cell.fontMatchRate ?? 0,
        samplePath: resolveRenderPath(runName, caseKey, tool),
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

// ---------------------------------------------------------------------------
// Render path resolution — serves directly from runs/
// ---------------------------------------------------------------------------

function resolveRenderPath(
  runId: string,
  caseKey: string,
  arm: string,
  channel = "prompt",
): string | null {
  // Cell directory name: control is always bare; others include channel suffix
  const cell = arm === "no-design-md"
    ? "no-design-md"
    : channel === "prompt"
      ? `${arm}+prompt`
      : arm;

  // Check if the file exists on disk
  const absPath = resolve(process.cwd(), "..", "runs", runId, caseKey, cell, "0.html");
  if (!existsSync(absPath)) {
    // Also try the bare arm name (some runs don't use +prompt)
    const barePath = resolve(process.cwd(), "..", "runs", runId, caseKey, arm, "0.html");
    if (existsSync(barePath)) {
      return `/renders/${runId}/${caseKey}/${arm}/0.html`;
    }
    return null;
  }

  return `/renders/${runId}/${caseKey}/${cell}/0.html`;
}

/** Resolve path for the Nth sample rendering. */
function resolveRenderPathN(runId: string, caseKey: string, arm: string, n: number): string | null {
  // Try +prompt first, then bare arm
  for (const cell of [`${arm}+prompt`, arm, "no-design-md"]) {
    const dir = arm === "no-design-md" ? "no-design-md" : cell;
    const absPath = resolve(process.cwd(), "..", "runs", runId, caseKey, dir, `${n}.html`);
    if (existsSync(absPath)) {
      return `/renders/${runId}/${caseKey}/${dir}/${n}.html`;
    }
  }
  // Fall back to the 0.html file for the arm
  return resolveRenderPath(runId, caseKey, arm);
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function round2(n: number | null | undefined): number | null {
  return n == null ? null : Math.round(n * 100) / 100;
}

function formatToolLabel(tool?: string, model?: string): string {
  const t = (tool ?? "agent").replace(/^stitch$/, "Stitch");
  const m = (model ?? "unknown")
    .replace("GEMINI_3_1_PRO", "Gemini 3.1 Pro")
    .replace("GEMINI_3_PRO", "Gemini 3 Pro")
    .replace("GEMINI_3_FLASH", "Gemini 3 Flash");
  return `${t} · ${m}`;
}

/** Read the grounding prose from a run's eval snapshot. */
function armProse(runId: string, caseKey: string, treatment: string): string {
  const p = resolve(process.cwd(), "..", "runs", runId, "eval", caseKey, "arms", `${treatment}.DESIGN.md`);
  if (!existsSync(p)) return "";
  return readFileSync(p, "utf8")
    .replace(/^---\n[\s\S]*?\n---\n?/, "")
    .replace(/\s*\{[a-z][\w.-]*\}/gi, "")
    .trim();
}

/** First real paragraph of a grounding doc. */
function firstParagraph(md: string): string {
  for (const block of md.split(/\n\s*\n/)) {
    const t = block.trim();
    if (!t || t.startsWith("#") || t.startsWith("-") || t.startsWith("*")) continue;
    return t.replace(/\s+/g, " ");
  }
  return md.split(/\n\s*\n/)[0]?.trim() ?? "";
}

