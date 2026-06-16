/**
 * Authoring agent (Phase B): spawns `claude -p` through the jobs system to
 * propose groundings and draft arm documents for a draft case.
 *
 * Configuration: authoring/claude-settings.json is Claude Code's native
 * settings format (model, fallbackModel, effortLevel, …) passed verbatim via
 * --settings — anything Claude supports is configurable there. Harness-owned
 * flags are fixed: --tools "" (pure text drafting, no tool use),
 * --output-format json (result + cost), prompt via stdin, and
 * ANTHROPIC_API_KEY stripped from the child env so a present key can't
 * silently switch billing from the subscription to the API.
 *
 * The agent never touches disk: it emits ===FILE…===/===END=== blocks, and
 * this module writes them — re-attaching the canonical front matter so
 * token-identity holds by construction.
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { ROOT, ARM_KEYS, loadCases, type DesignCase } from "../cases.ts";
import { startSteps } from "./jobs.ts";
import type { CaseRef } from "./authoring.ts";

const AUTHORING_DIR = join(ROOT, "authoring");
const SETTINGS_PATH = join(AUTHORING_DIR, "claude-settings.json");
const EXEMPLAR_CASE = "agent-slides";
/** Arms the agent may draft (tokens-only is pure front matter; control has no doc). */
export const DRAFTABLE_ARMS = ["description", "object", "constraint", "metaphor", "full-spec"];

export interface AgentConfig {
  available: boolean;
  model: string;
  settingsPath: string | null;
}

export function agentConfig(): AgentConfig {
  const available = !!Bun.which("claude");
  let model = "(claude default)";
  let settingsPath: string | null = null;
  if (existsSync(SETTINGS_PATH)) {
    settingsPath = SETTINGS_PATH;
    try {
      model = JSON.parse(readFileSync(SETTINGS_PATH, "utf8")).model ?? model;
    } catch {
      model = "(invalid claude-settings.json)";
    }
  }
  return { available, model, settingsPath };
}

// ---------------------------------------------------------------------------
// Prompt assembly
// ---------------------------------------------------------------------------

function fill(template: string, vars: Record<string, string>): string {
  return template.replace(/\{\{([A-Z_]+)\}\}/g, (_, key) => vars[key] ?? `(missing ${key})`);
}

function frontMatterOf(designCase: DesignCase): string {
  const file = designCase.armFiles.get("tokens-only");
  if (!file) throw new Error("draft has no tokens-only arm — scaffold it first");
  const match = /^---\n([\s\S]*?)\n---/.exec(readFileSync(file, "utf8"));
  if (!match) throw new Error("tokens-only arm has no front matter");
  return match[1];
}

function stripFrontMatter(content: string): string {
  return content.replace(/^---\n[\s\S]*?\n---\n?/, "").trim();
}

/** The canon: one hand-built case's treatment arms, bodies only. */
function exemplar(): string {
  const canon = loadCases([EXEMPLAR_CASE])[0];
  if (!canon) return "(exemplar case unavailable)";
  const parts: string[] = [];
  for (const arm of ["description", "object", "constraint", "metaphor"]) {
    const file = canon.armFiles.get(arm);
    if (file) parts.push(`### exemplar arm: ${arm}\n\n${stripFrontMatter(readFileSync(file, "utf8"))}`);
  }
  return parts.join("\n\n");
}

function caseVars(designCase: DesignCase): Record<string, string> {
  const cfg = designCase.config;
  return {
    TITLE: cfg.title,
    DEVICE: cfg.deviceType,
    BRIEF: designCase.brief,
    GENERIC_CENTER: cfg.genericCenter ?? "(not yet described)",
    FLAGS: `forbid [${(cfg.prohibitions ?? []).join(", ") || "—"}]${cfg.requirements?.length ? ` · require [${cfg.requirements.join(", ")}]` : ""}`,
  };
}

export interface Seeds {
  object?: string;
  constraint?: string;
  metaphor?: string;
}

export function buildProposePrompt(designCase: DesignCase): string {
  const template = readFileSync(join(AUTHORING_DIR, "propose.md"), "utf8");
  return fill(template, caseVars(designCase));
}

export function buildDraftPrompt(designCase: DesignCase, seeds: Seeds, arms: string[]): string {
  const template = readFileSync(join(AUTHORING_DIR, "draft.md"), "utf8");
  const seedLines = (["object", "constraint", "metaphor"] as const)
    .map((slot) => `- ${slot}: ${seeds[slot]?.trim() || "(none — invent one)"}`)
    .join("\n");
  return fill(template, {
    ...caseVars(designCase),
    TOKENS: frontMatterOf(designCase),
    SEEDS: seedLines,
    ARMS: arms.join(", "),
    EXEMPLAR: exemplar(),
  });
}

// ---------------------------------------------------------------------------
// Spawn + finalize
// ---------------------------------------------------------------------------

function claudeCmd(): string[] {
  const cmd = [
    "claude",
    "-p",
    "Execute the task provided via the piped input exactly. Your reply must be only the requested output.",
    "--output-format",
    "json",
    "--tools",
    "",
  ];
  if (existsSync(SETTINGS_PATH)) cmd.push("--settings", SETTINGS_PATH);
  return cmd;
}

/** claude -p --output-format json → { result, total_cost_usd, … } */
function parseClaudeJson(stdout: string): { result: string; cost: number | null } {
  const parsed = JSON.parse(stdout.trim());
  if (typeof parsed.result !== "string") throw new Error("claude output had no .result field");
  return { result: parsed.result, cost: typeof parsed.total_cost_usd === "number" ? parsed.total_cost_usd : null };
}

function authoringStep(phase: string, prompt: string) {
  return {
    phase,
    cmd: claudeCmd(),
    stdin: prompt,
    // A present ANTHROPIC_API_KEY is ALWAYS used in -p mode → per-token API
    // billing despite an active subscription. Strip it.
    dropEnv: ["ANTHROPIC_API_KEY"],
  };
}

export function startPropose(ref: CaseRef, designCase: DesignCase): string | null {
  if (!Bun.which("claude")) return "claude CLI not found on PATH";
  const outDir = join(ref.dir, ".authoring");
  mkdirSync(outDir, { recursive: true });
  const prompt = buildProposePrompt(designCase);
  return startSteps("authoring", ref.key, join(outDir, "propose.log"), [authoringStep("propose", prompt)], (outputs, log) => {
    const { result, cost } = parseClaudeJson(outputs[0] ?? "");
    writeFileSync(join(outDir, "proposals.md"), result.trim() + "\n");
    log(`\nwrote .authoring/proposals.md (${result.trim().split(/\s+/).length} words)${cost != null ? ` · cost $${cost.toFixed(4)}` : ""}\n`);
  });
}

const FILE_BLOCK = /^===FILE arms\/([a-z-]+)\.DESIGN\.md===\n([\s\S]*?)\n===END===/gm;
const FIELD_BLOCK = /^===FIELD genericCenter===\n([\s\S]*?)\n===END===/m;

export function startDraft(ref: CaseRef, designCase: DesignCase, seeds: Seeds, arms: string[]): string | null {
  if (!Bun.which("claude")) return "claude CLI not found on PATH";
  const requested = arms.filter((a) => DRAFTABLE_ARMS.includes(a));
  if (requested.length === 0) return "pick at least one draftable arm";
  const frontMatter = frontMatterOf(designCase); // resolved now, used at finalize
  const outDir = join(ref.dir, ".authoring");
  mkdirSync(outDir, { recursive: true });
  const prompt = buildDraftPrompt(designCase, seeds, requested);
  writeFileSync(join(outDir, "draft-prompt.md"), prompt);

  return startSteps("authoring", ref.key, join(outDir, "draft.log"), [authoringStep("draft", prompt)], (outputs, log) => {
    const { result, cost } = parseClaudeJson(outputs[0] ?? "");
    writeFileSync(join(outDir, "draft-output.md"), result);
    const written: string[] = [];
    for (const match of result.matchAll(FILE_BLOCK)) {
      const arm = match[1];
      if (!requested.includes(arm)) continue; // never write an arm that wasn't asked for
      // Re-attach the canonical front matter — token identity by construction.
      const body = stripFrontMatter(match[2].trim());
      writeFileSync(join(ref.dir, "arms", `${arm}.DESIGN.md`), `---\n${frontMatter}\n---\n\n${body}\n`);
      written.push(arm);
    }
    if (written.length === 0) {
      throw new Error("no ===FILE arms/…=== blocks found in agent output (see .authoring/draft-output.md)");
    }
    const field = FIELD_BLOCK.exec(result);
    if (field) {
      const configPath = join(ref.dir, "case.json");
      const config = JSON.parse(readFileSync(configPath, "utf8"));
      if (/TODO/.test(config.genericCenter ?? "")) {
        config.genericCenter = field[1].trim();
        writeFileSync(configPath, JSON.stringify(config, null, 2) + "\n");
        written.push("case.json:genericCenter");
      }
    }
    log(`\nstaged: ${written.join(", ")}${cost != null ? ` · cost $${cost.toFixed(4)}` : ""}\nvalidation runs on next page load.\n`);
  });
}
