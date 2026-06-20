/**
 * Authoring tools, bound to one draft case. The contract that keeps agent
 * edits safe is the same one the claude -p path uses: write_arm strips
 * whatever front matter the model emitted and re-attaches the canonical
 * tokens, so front-matter identity holds by construction — and the
 * validation gate is itself a tool, so the loop is draft → validate →
 * fix → clean, inside one session.
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import type { ToolHandler, ToolResult } from "@inbrowser/agent";
import { ARM_KEYS, DRAFTABLE_ARMS } from "../cases.ts";
import { findCase, loadCaseRef, validateCase, KNOWN_FLAGS, type CaseRef } from "../viewer/authoring.ts";

function fail(summary: string): ToolResult {
  return { ok: false, summary };
}

/** Re-resolve per call — the human may edit files between turns. */
function freshRef(key: string): CaseRef | null {
  const ref = findCase(key);
  return ref && ref.draft ? ref : null;
}

function canonicalFrontMatter(ref: CaseRef): string {
  const file = join(ref.dir, "arms", "tokens-only.DESIGN.md");
  const match = /^---\n([\s\S]*?)\n---/.exec(readFileSync(file, "utf8"));
  if (!match) throw new Error("tokens-only arm has no front matter");
  return match[1];
}

function stripFrontMatter(content: string): string {
  return content.replace(/^---\n[\s\S]*?\n---\n?/, "").trim();
}

export function createCaseTools(caseKey: string): ToolHandler[] {
  const need = (): CaseRef => {
    const ref = freshRef(caseKey);
    if (!ref) throw new Error(`draft "${caseKey}" not found (was it promoted or deleted mid-session?)`);
    return ref;
  };

  const readBrief: ToolHandler = {
    name: "read_brief",
    description:
      "Read the case brief (the content world, held constant across arms) and the case configuration (title, device, generic center, prohibition/requirement flags).",
    parameters: { type: "object", properties: {}, required: [] },
    pure: true,
    async execute(): Promise<ToolResult> {
      const ref = need();
      const dc = loadCaseRef(ref);
      if (!dc) return fail("case.json is malformed");
      return {
        ok: true,
        summary: `brief is ${dc.brief.split(/\s+/).length} words; flags: forbid [${dc.config.prohibitions.join(", ") || "—"}]${dc.config.requirements?.length ? `, require [${dc.config.requirements.join(", ")}]` : ""}`,
        data: { brief: dc.brief, config: dc.config },
      };
    },
  };

  const readTokens: ToolHandler = {
    name: "read_tokens",
    description:
      "Read the shared YAML front matter (design tokens) that every arm carries. Prose must reference these token names, e.g. {colors.primary}.",
    parameters: { type: "object", properties: {}, required: [] },
    pure: true,
    async execute(): Promise<ToolResult> {
      const ref = need();
      const yaml = canonicalFrontMatter(ref);
      return { ok: true, summary: `tokens are ${yaml.split("\n").length} lines of YAML`, data: { yaml } };
    },
  };

  const writeTokens: ToolHandler = {
    name: "write_tokens",
    description:
      "Replace the shared design tokens (YAML front matter). Synchronizes the new front matter into EVERY arm file, preserving each arm's prose — token identity across arms is maintained automatically.",
    parameters: {
      type: "object",
      properties: { yaml: { type: "string", description: "The full front matter YAML body (without --- fences)." } },
      required: ["yaml"],
    },
    async execute(args: { yaml: string }): Promise<ToolResult> {
      const ref = need();
      const yaml = args.yaml.trim().replace(/^---\n?/, "").replace(/\n?---$/, "");
      if (!/colors:/.test(yaml)) return fail("front matter must define colors:");
      let synced = 0;
      for (const arm of ARM_KEYS) {
        const file = join(ref.dir, "arms", `${arm}.DESIGN.md`);
        if (!existsSync(file)) continue;
        const body = stripFrontMatter(readFileSync(file, "utf8"));
        writeFileSync(file, `---\n${yaml}\n---\n${body ? `\n${body}\n` : ""}`);
        synced++;
      }
      return { ok: true, summary: `tokens written and synchronized across ${synced} arms` };
    },
  };

  const readArm: ToolHandler = {
    name: "read_arm",
    description: `Read one arm document's prose body (front matter omitted — it is shared). Arms: ${ARM_KEYS.join(", ")}.`,
    parameters: {
      type: "object",
      properties: { arm: { type: "string", enum: [...ARM_KEYS] } },
      required: ["arm"],
    },
    pure: true,
    async execute(args: { arm: string }): Promise<ToolResult> {
      const ref = need();
      const file = join(ref.dir, "arms", `${args.arm}.DESIGN.md`);
      if (!existsSync(file)) return fail(`arm "${args.arm}" does not exist`);
      const body = stripFrontMatter(readFileSync(file, "utf8"));
      return { ok: true, summary: `${args.arm} body is ${body ? body.split(/\s+/).length : 0} words`, data: { body } };
    },
  };

  const writeArm: ToolHandler = {
    name: "write_arm",
    description: `Write one arm document's prose body. Provide markdown body only — the shared front matter is attached automatically. Writable arms: ${DRAFTABLE_ARMS.join(", ")}. Remember the invariants: no Do's and Don'ts outside full-spec; description/object/constraint/metaphor at rough length parity (~280–380 words); reference tokens as {colors.x}/{typography.y}.`,
    parameters: {
      type: "object",
      properties: {
        arm: { type: "string", enum: [...DRAFTABLE_ARMS] },
        body: { type: "string", description: "Markdown body, starting at ## Overview. No front matter." },
      },
      required: ["arm", "body"],
    },
    async execute(args: { arm: string; body: string }): Promise<ToolResult> {
      const ref = need();
      if (!DRAFTABLE_ARMS.includes(args.arm)) return fail(`"${args.arm}" is not writable`);
      const body = stripFrontMatter(args.body); // tolerate a model that includes it anyway
      if (!body) return fail("empty body");
      writeFileSync(join(ref.dir, "arms", `${args.arm}.DESIGN.md`), `---\n${canonicalFrontMatter(ref)}\n---\n\n${body}\n`);
      return { ok: true, summary: `${args.arm} written (${body.split(/\s+/).length} words); run validate_case to check it` };
    },
  };

  const validate: ToolHandler = {
    name: "validate_case",
    description:
      "Run the mechanical validation gate: linter per arm, token identity, length parity, TODO markers, Do's-and-Don'ts placement, brief completeness. Returns every finding. Promotion requires zero errors.",
    parameters: { type: "object", properties: {}, required: [] },
    async execute(): Promise<ToolResult> {
      const ref = need();
      const v = validateCase(ref);
      const findings = v.checks.filter((c) => c.status !== "ok").map((c) => `${c.status}: ${c.label} — ${c.detail}`);
      const armLint = v.arms.filter((a) => a.lintMessages.length).map((a) => `${a.arm}: ${a.lintMessages.join("; ")}`);
      return {
        ok: v.errors === 0,
        summary:
          v.errors === 0
            ? `clean — 0 errors, ${v.warnings} warning(s); promotable`
            : `${v.errors} error(s), ${v.warnings} warning(s) — fix and re-validate`,
        data: { findings, armLint, arms: v.arms.map(({ lintMessages: _m, ...a }) => a) },
      };
    },
  };

  const updateCaseJson: ToolHandler = {
    name: "update_case_json",
    description: `Patch case configuration fields. Flags must be from: ${KNOWN_FLAGS.join(", ")}. Prohibitions are basin features the grounding forbids; requirements are features the intended design depends on.`,
    parameters: {
      type: "object",
      properties: {
        title: { type: "string" },
        deviceType: { type: "string", enum: ["DESKTOP", "MOBILE", "TABLET", "AGNOSTIC"] },
        genericCenter: { type: "string", description: "The template-default this case must escape." },
        prohibitions: { type: "array", items: { type: "string", enum: KNOWN_FLAGS } },
        requirements: { type: "array", items: { type: "string", enum: KNOWN_FLAGS } },
      },
      required: [],
    },
    async execute(args: Record<string, unknown>): Promise<ToolResult> {
      const ref = need();
      const path = join(ref.dir, "case.json");
      const config = JSON.parse(readFileSync(path, "utf8"));
      const applied: string[] = [];
      for (const field of ["title", "genericCenter", "deviceType"] as const) {
        if (typeof args[field] === "string" && (args[field] as string).trim()) {
          config[field] = (args[field] as string).trim();
          applied.push(field);
        }
      }
      for (const field of ["prohibitions", "requirements"] as const) {
        if (Array.isArray(args[field])) {
          const bad = (args[field] as string[]).filter((f) => !KNOWN_FLAGS.includes(f));
          if (bad.length) return fail(`unknown flags: ${bad.join(", ")}`);
          config[field] = args[field];
          applied.push(field);
        }
      }
      if (applied.length === 0) return fail("no recognized fields provided");
      writeFileSync(path, JSON.stringify(config, null, 2) + "\n");
      return { ok: true, summary: `updated ${applied.join(", ")}` };
    },
  };

  const writeBrief: ToolHandler = {
    name: "write_brief",
    description:
      "Rewrite the case brief. The brief is the content world — everything the deliverable must contain, with real copy, and NO aesthetic direction (aesthetics belong in the arms). Use this to tighten or complete a thin brief; the human reviews the change as a diff.",
    parameters: {
      type: "object",
      properties: { brief: { type: "string", description: "The full replacement brief, markdown." } },
      required: ["brief"],
    },
    async execute(args: { brief: string }): Promise<ToolResult> {
      const ref = need();
      const brief = args.brief.trim();
      if (brief.split(/\s+/).length < 40) return fail("brief too thin (<40 words) — a content-complete brief names every section and its real copy");
      writeFileSync(join(ref.dir, "brief.md"), brief + "\n");
      return { ok: true, summary: `brief written (${brief.split(/\s+/).length} words)` };
    },
  };

  const listProposals: ToolHandler = {
    name: "read_proposals",
    description: "Read previously proposed grounding candidates for this case, if a propose pass was run.",
    parameters: { type: "object", properties: {}, required: [] },
    pure: true,
    async execute(): Promise<ToolResult> {
      const ref = need();
      const file = join(ref.dir, ".authoring", "proposals.md");
      if (!existsSync(file)) return fail("no proposals exist — groundings must come from the user or your own invention");
      const text = readFileSync(file, "utf8");
      return { ok: true, summary: `proposals are ${text.split(/\s+/).length} words`, data: { proposals: text } };
    },
  };

  return [readBrief, readTokens, writeTokens, readArm, writeArm, validate, updateCaseJson, writeBrief, listProposals];
}
