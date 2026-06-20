/** Case discovery, validation, and eval-snapshot versioning shared by generate/measure/viewer. */
import { readFileSync, readdirSync, existsSync, statSync, mkdirSync, copyFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";

export const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

export const ARM_KEYS = ["tokens-only", "description", "object", "constraint", "metaphor", "full-spec"] as const;
/** Arms an agent drafts as prose (excludes the control and the prose-less tokens-only). */
export const DRAFTABLE_ARMS = ["description", "object", "constraint", "metaphor", "full-spec"];
export const CONTROL = "no-design-md";
export const CELL_ORDER = [CONTROL, ...ARM_KEYS];

export interface CaseConfig {
  title: string;
  deviceType: string;
  genericCenter: string;
  /** Basin features that count as inherited-prohibition violations for this case. */
  prohibitions: string[];
  /** Features the intended design REQUIRES — their absence counts as a violation. */
  requirements?: string[];
}

export interface DesignCase {
  key: string;
  dir: string;
  config: CaseConfig;
  brief: string;
  /** arm key -> absolute path of its DESIGN.md (control arm has no file). */
  armFiles: Map<string, string>;
}

/** Directory suffix for cases being authored — invisible to runs until promoted. */
export const DRAFT_SUFFIX = ".draft";

export function loadCases(filter?: string[], baseDir?: string): DesignCase[] {
  const casesDir = baseDir ?? join(ROOT, "cases");
  const keys = readdirSync(casesDir)
    .filter((d) => statSync(join(casesDir, d)).isDirectory())
    .filter((d) => !d.endsWith(DRAFT_SUFFIX))
    .filter((d) => !filter || filter.includes(d))
    .sort();
  return keys.map((key) => {
    const dir = join(casesDir, key);
    const config: CaseConfig = JSON.parse(readFileSync(join(dir, "case.json"), "utf8"));
    const brief = readFileSync(join(dir, "brief.md"), "utf8").trim();
    const armFiles = new Map<string, string>();
    for (const arm of ARM_KEYS) {
      const file = join(dir, "arms", `${arm}.DESIGN.md`);
      if (existsSync(file)) armFiles.set(arm, file);
    }
    return { key, dir, config, brief, armFiles };
  });
}

/** Within a case, all DESIGN.md arms must share byte-identical front matter. */
export function verifySharedTokens(designCase: DesignCase) {
  const frontMatters = new Map<string, string>();
  for (const [arm, file] of designCase.armFiles) {
    const content = readFileSync(file, "utf8");
    const match = /^---\n([\s\S]*?)\n---/.exec(content);
    if (!match) throw new Error(`${file}: no front matter found`);
    frontMatters.set(arm, match[1]);
  }
  if (new Set(frontMatters.values()).size > 1) {
    throw new Error(
      `case ${designCase.key}: front matter differs between arms (${[...frontMatters.keys()].join(", ")}) — tokens must be held constant within a case; only prose may vary`,
    );
  }
}

// ---------------------------------------------------------------------------
// Eval snapshots: a run is only interpretable against the exact definition it
// saw, so generate.ts copies the definition into runs/<id>/eval/ and stamps a
// content hash. Per-case hashes are the unit of comparability across runs.
// ---------------------------------------------------------------------------

/** Content hash of one case's definition (case.json + brief + every arm). */
export function caseHashOf(c: DesignCase): string {
  const h = createHash("sha256");
  for (const name of ["case.json", "brief.md"]) {
    h.update(`${name}\n${readFileSync(join(c.dir, name), "utf8")}\n`);
  }
  for (const [arm, file] of [...c.armFiles.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
    h.update(`arms/${arm}\n${readFileSync(file, "utf8")}\n`);
  }
  return h.digest("hex").slice(0, 12);
}

export function evalHashFromCaseHashes(caseHashes: Record<string, string>): string {
  const h = createHash("sha256");
  for (const key of Object.keys(caseHashes).sort()) h.update(`${key}:${caseHashes[key]}\n`);
  return h.digest("hex").slice(0, 12);
}

export function evalHashOf(cases: DesignCase[]): { evalHash: string; caseHashes: Record<string, string> } {
  const caseHashes: Record<string, string> = {};
  for (const c of cases) caseHashes[c.key] = caseHashOf(c);
  return { evalHash: evalHashFromCaseHashes(caseHashes), caseHashes };
}

/** Copy the given cases' definitions into <destDir>/<case>/{case.json,brief.md,arms/}. */
export function snapshotEval(cases: DesignCase[], destDir: string) {
  for (const c of cases) {
    const caseDest = join(destDir, c.key);
    mkdirSync(join(caseDest, "arms"), { recursive: true });
    copyFileSync(join(c.dir, "case.json"), join(caseDest, "case.json"));
    copyFileSync(join(c.dir, "brief.md"), join(caseDest, "brief.md"));
    for (const [arm, file] of c.armFiles) copyFileSync(file, join(caseDest, "arms", `${arm}.DESIGN.md`));
  }
}

/** Path of a run's eval snapshot, or null if the run predates snapshotting. */
export function evalDirFor(runDir: string): string | null {
  const dir = join(runDir, "eval");
  return existsSync(dir) ? dir : null;
}

/**
 * Load case definitions as a given run saw them: from the run's eval snapshot
 * when present, falling back to the current working-tree definition.
 */
export function loadRunCases(runDir: string, filter?: string[]): DesignCase[] {
  return loadCases(filter, evalDirFor(runDir) ?? undefined);
}

/** Directories under a run dir that are not case sample dirs. */
export const RUN_RESERVED_DIRS = new Set(["eval", "blind"]);

/** "object+prompt" -> base arm "object"; design-system cells keep the bare key. */
export function baseArm(cell: string): string {
  return cell.split("+")[0];
}

/** Cell directory name for an arm delivered through a channel. The design-system
 *  channel keeps the bare arm key; the prompt channel is suffixed. Inverse of baseArm. */
export function cellName(armKey: string, channel: string): string {
  return channel === "prompt" ? `${armKey}+prompt` : armKey;
}

export function cellOrder(cell: string): number {
  const base = CELL_ORDER.indexOf(baseArm(cell));
  return (base === -1 ? 99 : base) * 2 + (cell.includes("+prompt") ? 1 : 0);
}
