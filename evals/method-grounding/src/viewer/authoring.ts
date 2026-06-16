/**
 * Case authoring (Phase A): scaffold drafts, validate them against the case
 * invariants, and promote them into cases/ once clean.
 *
 * Drafts live at cases/<key>.draft/ — loadCases ignores them, so a draft can
 * never leak into a run. Promotion is a rename gated on validation.
 */
import { readFileSync, writeFileSync, readdirSync, existsSync, statSync, mkdirSync, renameSync, rmSync } from "node:fs";
import { join } from "node:path";
import { createHash } from "node:crypto";
import { lint } from "@google/design.md/linter";
import { ROOT, ARM_KEYS, DRAFT_SUFFIX, type CaseConfig, type DesignCase, verifySharedTokens } from "../cases.ts";

const CASES_DIR = join(ROOT, "cases");

export const KNOWN_FLAGS = ["gradients", "shadows", "roundedCorners", "boldUses", "iconFonts", "extraFonts", "darkBackground"];
export const DEVICE_TYPES = ["DESKTOP", "MOBILE", "TABLET", "AGNOSTIC"];
/** Arms whose prose length must roughly match (full-spec is the unmatched ceiling). */
const PARITY_ARMS = ["description", "object", "constraint", "metaphor"];
const PARITY_TOLERANCE = 0.35;

export function draftDir(key: string): string {
  return join(CASES_DIR, key + DRAFT_SUFFIX);
}
export function caseDir(key: string): string {
  return join(CASES_DIR, key);
}

export interface CaseRef {
  key: string;
  dir: string;
  draft: boolean;
}

/** Every case, promoted and draft, for the library page. */
export function listAllCases(): CaseRef[] {
  if (!existsSync(CASES_DIR)) return [];
  return readdirSync(CASES_DIR)
    .filter((d) => statSync(join(CASES_DIR, d)).isDirectory())
    .map((d) =>
      d.endsWith(DRAFT_SUFFIX)
        ? { key: d.slice(0, -DRAFT_SUFFIX.length), dir: join(CASES_DIR, d), draft: true }
        : { key: d, dir: join(CASES_DIR, d), draft: false },
    )
    .sort((a, b) => a.key.localeCompare(b.key));
}

/** Resolve a key to its directory — drafts shadow promoted cases of the same key. */
export function findCase(key: string): CaseRef | null {
  if (existsSync(draftDir(key))) return { key, dir: draftDir(key), draft: true };
  if (existsSync(caseDir(key))) return { key, dir: caseDir(key), draft: false };
  return null;
}

/** Mirror of loadCases' shape for any case dir (drafts included). Null if malformed. */
export function loadCaseRef(ref: CaseRef): DesignCase | null {
  try {
    const config: CaseConfig = JSON.parse(readFileSync(join(ref.dir, "case.json"), "utf8"));
    const brief = existsSync(join(ref.dir, "brief.md")) ? readFileSync(join(ref.dir, "brief.md"), "utf8").trim() : "";
    const armFiles = new Map<string, string>();
    for (const arm of ARM_KEYS) {
      const file = join(ref.dir, "arms", `${arm}.DESIGN.md`);
      if (existsSync(file)) armFiles.set(arm, file);
    }
    return { key: ref.key, dir: ref.dir, config, brief, armFiles };
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Scaffolding
// ---------------------------------------------------------------------------

export interface ScaffoldInput {
  key: string;
  title: string;
  deviceType: string;
  genericCenter: string;
  prohibitions: string[];
  requirements: string[];
  brief: string;
  /** Bare YAML tokens, or a full DESIGN.md (front matter → tokens, body → full-spec arm). */
  tokensOrDesignMd: string;
}

const DEFAULT_FRONT_MATTER = `version: alpha
name: TODO Case Name
colors:
  primary: '#1A1C1E'   # TODO: the case's ink
  secondary: '#6C7278' # TODO: supporting tone
  tertiary: '#B8422E'  # TODO: the single accent
  neutral: '#F7F5F2'   # TODO: the canvas
typography:
  headline-lg:
    fontFamily: TODO
    fontSize: 48px
    fontWeight: 400
    lineHeight: 1.1
  body-md:
    fontFamily: TODO
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.6
  label-sm:
    fontFamily: TODO
    fontSize: 12px
    fontWeight: 400
    lineHeight: 1.4
    letterSpacing: 0.08em
rounded:
  none: 0px
spacing:
  sm: 8px
  md: 16px
  lg: 32px
  xl: 64px`;

const ARM_GUIDANCE: Record<string, string> = {
  "tokens-only": "", // front matter only, by definition
  description:
    "TODO: the adjective-prose control (C2). State desired qualities as adjectives only — no references, no objects, no constraints. Make it good-faith and roughly the same length as the treatment arms; it is the baseline they must beat.",
  object:
    "TODO: ground every decision in one real, fully-resolved artifact that solved a similar problem in another medium. Name it precisely enough that two people imagine the same thing, then spend prose only where this design departs from the default image of that object.",
  constraint:
    "TODO: impose one hard limitation and deduce everything else from living inside it. The constraint is the generative engine, not a restriction — show the deductions.",
  metaphor:
    "TODO: one governing idea; map each visual element onto an aspect of it. Say what the metaphor forbids as a consequence of the mapping, never as a list.",
  "full-spec":
    "TODO: the complete designer-grade specification — typography roles, compositional rules, and an explicit Do's and Don'ts section. This is the only arm allowed a don't-list; it is the ceiling anchor and need not be length-matched.",
};

function armTemplate(arm: string, frontMatter: string, body?: string): string {
  const fm = `---\n${frontMatter.trim()}\n---\n`;
  if (arm === "tokens-only") return fm;
  if (body) return `${fm}\n${body.trim()}\n`;
  return `${fm}
## Overview

TODO: one or two sentences orienting the reader.

## Method

${ARM_GUIDANCE[arm] ?? "TODO"}

## Colors

TODO: the palette's reasoning, citing tokens like {colors.primary}.

## Typography

TODO: each level's role, citing tokens like {typography.body-md}.

## Layout

TODO: the structural grammar.
`;
}

/** Split a pasted blob: full DESIGN.md → {frontMatter, body}; bare YAML → {frontMatter}. */
export function parseTokensInput(input: string): { frontMatter: string; fullSpecBody: string | null } {
  const trimmed = input.trim();
  if (!trimmed) return { frontMatter: DEFAULT_FRONT_MATTER, fullSpecBody: null };
  const match = /^---\n([\s\S]*?)\n---\n?([\s\S]*)$/.exec(trimmed);
  if (match) {
    const body = match[2].trim();
    return { frontMatter: match[1], fullSpecBody: body || null };
  }
  return { frontMatter: trimmed, fullSpecBody: null };
}

export function scaffoldCase(input: ScaffoldInput): { dir: string } {
  if (!/^[a-z0-9][a-z0-9-]*$/.test(input.key)) throw new Error("case key must be lowercase [a-z0-9-]");
  if (findCase(input.key)) throw new Error(`case "${input.key}" already exists (draft or promoted)`);
  const dir = draftDir(input.key);
  mkdirSync(join(dir, "arms"), { recursive: true });

  const config: CaseConfig = {
    title: input.title || input.key,
    deviceType: DEVICE_TYPES.includes(input.deviceType) ? input.deviceType : "DESKTOP",
    genericCenter: input.genericCenter || "TODO: describe the template-default this case must escape (or measure it with a control-only probe run).",
    prohibitions: input.prohibitions.filter((f) => KNOWN_FLAGS.includes(f)),
    requirements: input.requirements.filter((f) => KNOWN_FLAGS.includes(f)),
  };
  writeFileSync(join(dir, "case.json"), JSON.stringify(config, null, 2) + "\n");
  writeFileSync(join(dir, "brief.md"), (input.brief.trim() || "TODO: the content-complete brief — everything the page must contain, no aesthetics.") + "\n");

  const { frontMatter, fullSpecBody } = parseTokensInput(input.tokensOrDesignMd);
  for (const arm of ARM_KEYS) {
    const body = arm === "full-spec" && fullSpecBody ? fullSpecBody : undefined;
    writeFileSync(join(dir, "arms", `${arm}.DESIGN.md`), armTemplate(arm, frontMatter, body));
  }
  return { dir };
}

export function deleteDraft(key: string) {
  const dir = draftDir(key);
  if (!existsSync(dir)) throw new Error("no draft to delete");
  rmSync(dir, { recursive: true });
}

export function promoteCase(key: string) {
  const ref = findCase(key);
  if (!ref || !ref.draft) throw new Error("no draft to promote");
  if (existsSync(caseDir(key))) throw new Error(`a promoted case "${key}" already exists`);
  const validation = validateCase(ref);
  if (validation.errors > 0) throw new Error(`draft has ${validation.errors} validation error(s) — fix them first`);
  // Agent working files stay behind — a promoted case is just the definition.
  const aux = join(ref.dir, ".authoring");
  if (existsSync(aux)) rmSync(aux, { recursive: true });
  renameSync(ref.dir, caseDir(key));
}

// ---------------------------------------------------------------------------
// Validation — the mechanical gate
// ---------------------------------------------------------------------------

export interface Check {
  id: string;
  label: string;
  status: "ok" | "warn" | "error";
  detail: string;
}

export interface ArmStatus {
  arm: string;
  exists: boolean;
  words: number;
  todo: boolean;
  lintErrors: number;
  lintWarnings: number;
  lintMessages: string[];
}

export interface CaseValidation {
  checks: Check[];
  arms: ArmStatus[];
  errors: number;
  warnings: number;
}

const validationCache = new Map<string, CaseValidation>();

function dirContentHash(dir: string): string {
  const h = createHash("sha256");
  const files = ["case.json", "brief.md", ...ARM_KEYS.map((a) => join("arms", `${a}.DESIGN.md`))];
  for (const f of files) {
    const p = join(dir, f);
    h.update(f + "\n");
    if (existsSync(p)) h.update(readFileSync(p, "utf8"));
  }
  return h.digest("hex");
}

function lintArm(file: string): { errors: number; warnings: number; messages: string[] } {
  try {
    const report = lint(readFileSync(file, "utf8"));
    return {
      errors: report.summary.errors,
      warnings: report.summary.warnings,
      messages: report.findings
        .filter((f) => f.severity !== "info")
        .map((f) => `${f.severity}: ${f.message}`),
    };
  } catch (err) {
    // lint() throws only when the document is unparseable — that is an error
    // in the arm, not a tooling hiccup.
    return { errors: 1, warnings: 0, messages: [`unparseable: ${err instanceof Error ? err.message : String(err)}`] };
  }
}

function bodyWords(file: string): { words: number; todo: boolean; hasDontsHeading: boolean } {
  const content = readFileSync(file, "utf8");
  const body = content.replace(/^---\n[\s\S]*?\n---\n?/, "");
  return {
    words: body.trim() ? body.trim().split(/\s+/).length : 0,
    todo: /\bTODO\b/.test(content),
    hasDontsHeading: /^##\s+Do/im.test(body),
  };
}

export function validateCase(ref: CaseRef): CaseValidation {
  const hash = dirContentHash(ref.dir);
  const cached = validationCache.get(ref.dir + ":" + hash);
  if (cached) return cached;

  const checks: Check[] = [];
  const push = (id: string, label: string, status: Check["status"], detail: string) => checks.push({ id, label, status, detail });

  const designCase = loadCaseRef(ref);
  if (!designCase) {
    const failed: CaseValidation = {
      checks: [{ id: "load", label: "case.json", status: "error", detail: "missing or invalid case.json" }],
      arms: [],
      errors: 1,
      warnings: 0,
    };
    validationCache.set(ref.dir + ":" + hash, failed);
    return failed;
  }

  // case.json schema
  const cfg = designCase.config;
  const badFlags = [...(cfg.prohibitions ?? []), ...(cfg.requirements ?? [])].filter((f) => !KNOWN_FLAGS.includes(f));
  push(
    "config",
    "case.json",
    badFlags.length ? "error" : /TODO/.test(cfg.genericCenter ?? "") ? "warn" : "ok",
    badFlags.length
      ? `unknown flags: ${badFlags.join(", ")} (known: ${KNOWN_FLAGS.join(", ")})`
      : /TODO/.test(cfg.genericCenter ?? "")
        ? "genericCenter is a TODO — describe or probe the basin"
        : `forbid [${(cfg.prohibitions ?? []).join(", ") || "—"}]${cfg.requirements?.length ? ` · require [${cfg.requirements.join(", ")}]` : ""}`,
  );

  // brief
  const briefWords = designCase.brief ? designCase.brief.split(/\s+/).length : 0;
  push(
    "brief",
    "brief.md",
    !designCase.brief ? "error" : /\bTODO\b/.test(designCase.brief) ? "error" : briefWords < 40 ? "warn" : "ok",
    !designCase.brief
      ? "missing"
      : /\bTODO\b/.test(designCase.brief)
        ? "contains TODO"
        : `${briefWords} words${briefWords < 40 ? " — thin for a content-complete brief" : ""}`,
  );

  // arms: existence, lint, words, TODOs, don'ts placement
  const arms: ArmStatus[] = ARM_KEYS.map((arm) => {
    const file = designCase.armFiles.get(arm);
    if (!file) return { arm, exists: false, words: 0, todo: false, lintErrors: 0, lintWarnings: 0, lintMessages: [] };
    const { words, todo, hasDontsHeading } = bodyWords(file);
    const lint = lintArm(file);
    if (hasDontsHeading && arm !== "full-spec") {
      lint.errors += 1;
      lint.messages.push("error: Do's and Don'ts section outside full-spec — prohibitions must be inherited, not stated");
    }
    return { arm, exists: true, words, todo, lintErrors: lint.errors, lintWarnings: lint.warnings, lintMessages: lint.messages };
  });

  const missing = arms.filter((a) => !a.exists).map((a) => a.arm);
  push("arms", "arm files", missing.length ? "error" : "ok", missing.length ? `missing: ${missing.join(", ")}` : `all ${ARM_KEYS.length} present`);

  const todos = arms.filter((a) => a.todo).map((a) => a.arm);
  if (todos.length) push("todos", "placeholders", "error", `TODO markers in: ${todos.join(", ")}`);

  const lintBad = arms.filter((a) => a.lintErrors > 0);
  push(
    "lint",
    "linter",
    lintBad.length ? "error" : arms.some((a) => a.lintWarnings > 0) ? "warn" : "ok",
    lintBad.length
      ? lintBad.map((a) => `${a.arm}: ${a.lintMessages.join("; ")}`).join(" · ")
      : arms.some((a) => a.lintWarnings > 0)
        ? arms.filter((a) => a.lintWarnings > 0).map((a) => `${a.arm}: ${a.lintMessages.join("; ")}`).join(" · ")
        : "0 errors, 0 warnings across arms",
  );

  // front matter identity
  if (missing.length === 0) {
    try {
      verifySharedTokens(designCase);
      push("tokens", "front matter identity", "ok", "byte-identical across all arms");
    } catch (err) {
      push("tokens", "front matter identity", "error", String(err instanceof Error ? err.message : err));
    }
  }

  // length parity (description vs treatments)
  const parity = arms.filter((a) => PARITY_ARMS.includes(a.arm) && a.exists && a.words > 0);
  if (parity.length >= 2) {
    const mean = parity.reduce((s, a) => s + a.words, 0) / parity.length;
    const outliers = parity.filter((a) => Math.abs(a.words - mean) / mean > PARITY_TOLERANCE);
    push(
      "parity",
      "length parity (C2 vs T1–T3)",
      outliers.length ? "warn" : "ok",
      outliers.length
        ? `${outliers.map((a) => `${a.arm} ${a.words}w`).join(", ")} outside ±${PARITY_TOLERANCE * 100}% of mean ${Math.round(mean)}w`
        : parity.map((a) => `${a.arm} ${a.words}w`).join(" · "),
    );
  }

  const errors = checks.filter((c) => c.status === "error").length;
  const warnings = checks.filter((c) => c.status === "warn").length;
  const validation: CaseValidation = { checks, arms, errors, warnings };
  validationCache.set(ref.dir + ":" + hash, validation);
  return validation;
}
