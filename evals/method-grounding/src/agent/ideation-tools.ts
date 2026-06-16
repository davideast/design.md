/**
 * Ideation tools: deliberately tiny. The ideation agent is a thinking partner
 * with system knowledge but no production access — it can read the concept and
 * capture the two artifacts the human converges on (brief, direction), and
 * nothing else. Capture happens when the human agrees, never speculatively.
 */
import { writeFileSync, readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import type { ToolHandler, ToolResult } from "@inbrowser/agent";
import { findConcept, conceptArtifacts, type ConceptRef } from "./concepts.ts";

function fail(summary: string): ToolResult {
  return { ok: false, summary };
}

export function createIdeationTools(conceptId: string): ToolHandler[] {
  const need = (): ConceptRef => {
    const ref = findConcept(conceptId);
    if (!ref) throw new Error(`concept "${conceptId}" not found`);
    return ref;
  };

  const readConcept: ToolHandler = {
    name: "read_concept",
    description: "Read the spark and the current state of the two captures (brief, direction document).",
    parameters: { type: "object", properties: {}, required: [] },
    pure: true,
    async execute(): Promise<ToolResult> {
      const ref = need();
      const { brief, direction } = conceptArtifacts(ref);
      return {
        ok: true,
        summary: `spark: "${ref.meta.spark.slice(0, 60)}" · brief ${brief ? `${brief.split(/\s+/).length}w` : "not captured"} · direction ${direction ? "captured" : "not captured"}`,
        data: { spark: ref.meta.spark, brief, direction },
      };
    },
  };

  const writeBrief: ToolHandler = {
    name: "capture_brief",
    description:
      "Capture the brief the human has agreed to: the content world — every section the deliverable contains, with real copy, and ZERO aesthetic direction. Only call this when the human has signed off on the content.",
    parameters: {
      type: "object",
      properties: { brief: { type: "string", description: "Full brief, markdown." } },
      required: ["brief"],
    },
    async execute(args: { brief: string }): Promise<ToolResult> {
      const ref = need();
      const brief = args.brief.trim();
      if (!brief) return fail("empty brief");
      const path = join(ref.dir, "brief.md");
      if (existsSync(path) && readFileSync(path, "utf8") === brief + "\n") {
        return { ok: true, summary: "brief unchanged — already captured exactly as agreed" };
      }
      writeFileSync(path, brief + "\n");
      const words = brief.split(/\s+/).length;
      return { ok: true, summary: `brief captured (${words} words${words < 40 ? " — thin; a content-complete brief usually needs more" : ""})` };
    },
  };

  const writeDirection: ToolHandler = {
    name: "capture_direction",
    description:
      "Capture the converged direction document: a complete DESIGN.md — YAML front matter (the token system drawn from the world's materials: four colors with one accent, two or three type roles, rounded, spacing) between --- fences, followed by the world stated fully in prose (its register, materials, what it is, where it departs from the obvious image of itself). This document seeds the case's tokens and full-spec arm; the ladder arms are projected from it after commit. Only call this when the human has chosen the direction.",
    parameters: {
      type: "object",
      properties: { content: { type: "string", description: "Full DESIGN.md: ---\\n<yaml>\\n---\\n<prose>" } },
      required: ["content"],
    },
    async execute(args: { content: string }): Promise<ToolResult> {
      const ref = need();
      const content = args.content.trim();
      const fm = /^---\n([\s\S]*?)\n---\n?([\s\S]*)$/.exec(content);
      if (!fm) return fail("direction must start with YAML front matter between --- fences");
      if (!/colors:/.test(fm[1])) return fail("front matter must define colors:");
      if (!fm[2].trim()) return fail("direction needs prose after the front matter — the world stated fully");
      const path = join(ref.dir, "direction.md");
      if (existsSync(path) && readFileSync(path, "utf8") === content + "\n") {
        return { ok: true, summary: "direction unchanged — already captured exactly as agreed" };
      }
      writeFileSync(path, content + "\n");
      return {
        ok: true,
        summary: `direction captured (${fm[1].split("\n").length} token lines, ${fm[2].trim().split(/\s+/).length} words of world) — the human can now commit`,
      };
    },
  };

  return [readConcept, writeBrief, writeDirection];
}
