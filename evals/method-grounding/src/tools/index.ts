/**
 * The generation-tool registry. The bench selects a tool by name; experiments
 * declare which tool they target. Adding a model adapter (Gemini, Claude) is a
 * one-line registration here once it implements GenerationTool — nothing in the
 * bench changes.
 */
import type { GenerationTool } from "./types.ts";
import { StitchTool } from "./stitch.ts";
import { GeminiTool } from "./gemini.ts";
import { OpenRouterTool } from "./openrouter.ts";

export type { GenerationTool, GenerationSession, GenerateRequest, Rendering, Logger, DirectionChannel } from "./types.ts";

const TOOLS: Record<string, () => GenerationTool> = {
  stitch: () => new StitchTool(),
  gemini: () => new GeminiTool(),
  openrouter: () => new OpenRouterTool(),
};

export const TOOL_NAMES = Object.keys(TOOLS);
export const DEFAULT_TOOL = "stitch";

export function getTool(name: string): GenerationTool {
  const make = TOOLS[name];
  if (!make) throw new Error(`unknown generation tool "${name}" (known: ${TOOL_NAMES.join(", ")})`);
  return make();
}
