/**
 * SQLite database layer for Design Bench.
 *
 * Three tables: providers → runs → cells. The CLI writes through this module;
 * the Astro viewer opens in read-only mode.
 *
 * Uses bun:sqlite — zero npm dependencies. The database file lives at the
 * project root (evals/design-bench/bench.db).
 *
 * Set BENCH_BRANCH=<name> to operate on bench.<name>.db instead of the
 * primary. Branch databases are gitignored via the bench.*.db pattern.
 */
import { Database } from "bun:sqlite";
import { join } from "node:path";
import { ROOT } from "./cases.ts";

const BRANCH = process.env.BENCH_BRANCH?.trim() || null;
const DB_FILE = BRANCH ? `bench.${BRANCH}.db` : "bench.db";
export const DB_PATH = join(ROOT, DB_FILE);

/** Returns the active branch name, or null if using the primary. */
export function activeBranch(): string | null {
  return BRANCH;
}

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------

const SCHEMA = `
CREATE TABLE IF NOT EXISTS providers (
  key         TEXT PRIMARY KEY,
  label       TEXT NOT NULL,
  sort_order  INTEGER DEFAULT 0,
  featured    INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS runs (
  id            TEXT PRIMARY KEY,
  provider_key  TEXT NOT NULL REFERENCES providers(key),
  model         TEXT,
  tool          TEXT DEFAULT 'agent',
  eval_hash     TEXT,
  experiment    TEXT DEFAULT 'method-grounding',
  metric        TEXT DEFAULT 'escape-from-center',
  config        TEXT,
  created_at    TEXT DEFAULT (datetime('now')),
  measured_at   TEXT
);

CREATE TABLE IF NOT EXISTS cells (
  run_id                TEXT NOT NULL REFERENCES runs(id),
  case_key              TEXT NOT NULL,
  arm                   TEXT NOT NULL,
  channel               TEXT DEFAULT 'prompt',
  samples               INTEGER DEFAULT 0,
  palette_adherence     REAL,
  mean_delta_e          REAL,
  font_match_rate       REAL,
  distance_from_control REAL,
  excess_distance       REAL,
  intra_arm_dispersion  REAL,
  violations            TEXT,
  mean_violations       REAL,
  raw                   TEXT,
  PRIMARY KEY (run_id, case_key, arm, channel)
);

CREATE INDEX IF NOT EXISTS idx_cells_lookup
  ON cells(run_id, case_key, arm);
`;

// ---------------------------------------------------------------------------
// Connection
// ---------------------------------------------------------------------------

export function openDb(readonly = false): Database {
  const db = readonly
    ? new Database(DB_PATH, { readonly: true })
    : new Database(DB_PATH, { create: true });
  db.exec("PRAGMA journal_mode = WAL");
  if (!readonly) {
    db.exec(SCHEMA);
  }
  return db;
}

// ---------------------------------------------------------------------------
// Write helpers (used by CLI + measure)
// ---------------------------------------------------------------------------

export function upsertProvider(db: Database, key: string, label: string, sortOrder = 0, featured = 0) {
  db.query(
    `INSERT INTO providers (key, label, sort_order, featured)
     VALUES (?1, ?2, ?3, ?4)
     ON CONFLICT(key) DO UPDATE SET label = ?2, sort_order = ?3, featured = ?4`,
  ).run(key, label, sortOrder, featured);
}

export function setFeatured(db: Database, key: string, featured: boolean) {
  db.query(`UPDATE providers SET featured = ? WHERE key = ?`).run(featured ? 1 : 0, key);
}

export interface RunInsert {
  id: string;
  providerKey: string;
  model: string;
  tool?: string;
  evalHash?: string;
  experiment?: string;
  metric?: string;
  config?: Record<string, unknown>;
}

export function upsertRun(db: Database, run: RunInsert) {
  db.query(
    `INSERT INTO runs (id, provider_key, model, tool, eval_hash, experiment, metric, config)
     VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)
     ON CONFLICT(id) DO UPDATE SET
       provider_key = ?2, model = ?3, tool = ?4, eval_hash = ?5,
       experiment = ?6, metric = ?7, config = ?8`,
  ).run(
    run.id,
    run.providerKey,
    run.model,
    run.tool ?? "agent",
    run.evalHash ?? null,
    run.experiment ?? "method-grounding",
    run.metric ?? "escape-from-center",
    run.config ? JSON.stringify(run.config) : null,
  );
}

export interface CellInsert {
  runId: string;
  caseKey: string;
  arm: string;
  channel?: string;
  samples?: number;
  paletteAdherence?: number | null;
  meanDeltaE?: number | null;
  fontMatchRate?: number | null;
  distanceFromControl?: number | null;
  excessDistance?: number | null;
  intraArmDispersion?: number | null;
  violations?: Record<string, boolean> | null;
  meanViolations?: number | null;
  raw?: unknown;
}

export function upsertCell(db: Database, cell: CellInsert) {
  db.query(
    `INSERT INTO cells (
       run_id, case_key, arm, channel, samples,
       palette_adherence, mean_delta_e, font_match_rate,
       distance_from_control, excess_distance, intra_arm_dispersion,
       violations, mean_violations, raw
     ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14)
     ON CONFLICT(run_id, case_key, arm, channel) DO UPDATE SET
       samples = ?5,
       palette_adherence = ?6, mean_delta_e = ?7, font_match_rate = ?8,
       distance_from_control = ?9, excess_distance = ?10, intra_arm_dispersion = ?11,
       violations = ?12, mean_violations = ?13, raw = ?14`,
  ).run(
    cell.runId,
    cell.caseKey,
    cell.arm,
    cell.channel ?? "prompt",
    cell.samples ?? 0,
    cell.paletteAdherence ?? null,
    cell.meanDeltaE ?? null,
    cell.fontMatchRate ?? null,
    cell.distanceFromControl ?? null,
    cell.excessDistance ?? null,
    cell.intraArmDispersion ?? null,
    cell.violations ? JSON.stringify(cell.violations) : null,
    cell.meanViolations ?? null,
    cell.raw ? JSON.stringify(cell.raw) : null,
  );
}

export function markMeasured(db: Database, runId: string) {
  db.query(`UPDATE runs SET measured_at = datetime('now') WHERE id = ?`).run(runId);
}

// ---------------------------------------------------------------------------
// Read helpers (used by viewer and status)
// ---------------------------------------------------------------------------

export interface ProviderRow {
  key: string;
  label: string;
  sort_order: number;
}

export function allProviders(db: Database): ProviderRow[] {
  return db.query(`SELECT * FROM providers ORDER BY sort_order, key`).all() as ProviderRow[];
}

export interface RunRow {
  id: string;
  provider_key: string;
  model: string | null;
  tool: string | null;
  eval_hash: string | null;
  experiment: string | null;
  metric: string | null;
  config: string | null;
  created_at: string | null;
  measured_at: string | null;
}

export function allRuns(db: Database): RunRow[] {
  return db.query(`SELECT * FROM runs ORDER BY created_at DESC`).all() as RunRow[];
}

export function runsForProvider(db: Database, providerKey: string): RunRow[] {
  return db.query(`SELECT * FROM runs WHERE provider_key = ? ORDER BY created_at DESC`).all(providerKey) as RunRow[];
}

export interface CellRow {
  run_id: string;
  case_key: string;
  arm: string;
  channel: string;
  samples: number;
  palette_adherence: number | null;
  mean_delta_e: number | null;
  font_match_rate: number | null;
  distance_from_control: number | null;
  excess_distance: number | null;
  intra_arm_dispersion: number | null;
  violations: string | null;
  mean_violations: number | null;
  raw: string | null;
}

export function cellsForRun(db: Database, runId: string): CellRow[] {
  return db.query(`SELECT * FROM cells WHERE run_id = ?`).all(runId) as CellRow[];
}

export function cellsForProviderCase(db: Database, providerKey: string, caseKey: string): CellRow[] {
  return db.query(
    `SELECT c.* FROM cells c
     JOIN runs r ON c.run_id = r.id
     WHERE r.provider_key = ? AND c.case_key = ?
     ORDER BY c.arm`,
  ).all(providerKey, caseKey) as CellRow[];
}

export function bestCellForProviderCase(db: Database, providerKey: string, caseKey: string): CellRow | null {
  return db.query(
    `SELECT c.* FROM cells c
     JOIN runs r ON c.run_id = r.id
     WHERE r.provider_key = ? AND c.case_key = ? AND c.arm != 'no-design-md'
     ORDER BY c.excess_distance DESC
     LIMIT 1`,
  ).get(providerKey, caseKey) as CellRow | null;
}

/** All distinct case keys that have measured cells. */
export function measuredCaseKeys(db: Database): string[] {
  const rows = db.query(
    `SELECT DISTINCT case_key FROM cells ORDER BY case_key`,
  ).all() as { case_key: string }[];
  return rows.map((r) => r.case_key);
}

/** Count of cells and total samples for a run. */
export function runStats(db: Database, runId: string): { cellCount: number; sampleCount: number } {
  const row = db.query(
    `SELECT COUNT(*) as cell_count, COALESCE(SUM(samples), 0) as sample_count
     FROM cells WHERE run_id = ?`,
  ).get(runId) as { cell_count: number; sample_count: number };
  return { cellCount: row.cell_count, sampleCount: row.sample_count };
}
