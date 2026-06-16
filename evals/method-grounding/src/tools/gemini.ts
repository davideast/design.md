/**
 * The Gemini generation tool: a raw model adapter, and the second tool that
 * makes the tool axis plural. Where Stitch is a design product with projects,
 * design-system assets, and hosted screens, Gemini is a blank model that takes
 * a prompt and returns HTML text. So this adapter is simpler than Stitch's —
 * no project lifecycle, no polling, inline HTML instead of a download URL — and
 * it supports only the prompt channel (a raw model has no design-system
 * pipeline). It reuses @inbrowser/relay's geminiProvider, already the repo's one
 * Gemini integration (auth, streaming, wire format), driven single-shot here.
 *
 * The generation instruction is the adapter's own voice added on top of the
 * brief and direction, so it is deliberately minimal and design-neutral — it
 * transmits the brief + DESIGN.md and forbids the model from inventing design
 * choices, because any aesthetic opinion here would contaminate a tool
 * comparison (the same construct-validity care as the prompt channel itself).
 */
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { geminiProvider, type NormalizedRequest, type InferenceEvent } from "@inbrowser/relay";
import { ROOT } from "../cases.ts";
import type { GenerationTool, GenerationSession, GenerateRequest, Rendering, Logger, DirectionChannel } from "./types.ts";

/** Used when the bench's --model is a Stitch-style id we can't pass to Gemini.
 *  Overridable with GEMINI_MODEL; this default tracks the model the editing
 *  agent uses, which is known-good against the configured key. */
const DEFAULT_GEMINI_MODEL = "gemini-3-flash-preview";
/** Samples must vary or intra-arm dispersion is trivially zero; raw models are
 *  deterministic at temperature 0. Not directly comparable to Stitch's internal
 *  sampling — a known limitation, recorded in provenance, not hidden. */
const DEFAULT_TEMPERATURE = 0.9;
/** Generation can run long; abort a single sample rather than hang the cell. */
const GENERATION_TIMEOUT_MS = 180_000;

/** The neutral wrapper. No aesthetic opinion — only "emit one complete document,
 *  implement the brief, follow the design system, invent nothing extra." */
const GENERATION_INSTRUCTION = `You are generating one web page. Output a single complete, standalone HTML document and nothing else — no explanation, no commentary, no markdown code fences. Put all CSS in an inline <style> tag and load any web fonts the design system names. Implement every piece of content described in the brief below. If a design system (DESIGN.md) is provided, follow its colors, typography, spacing, and rules exactly. Do not add content, sections, or visual choices that the brief and design system do not call for.`;

const DIRECTION_PREAMBLE = "## Design system (DESIGN.md) — follow exactly";

/** Pull a complete HTML document out of a model response: drop a markdown fence
 *  if present, then slice from the document start to </html>. Throws if no
 *  document is found, so the sample (not the cell) fails. */
export function extractHtml(text: string): string {
  let t = text.trim();
  const fence = /^```[a-zA-Z]*\s*\n([\s\S]*?)\n```\s*$/.exec(t);
  if (fence) t = fence[1].trim();
  const lower = t.toLowerCase();
  const doctype = lower.indexOf("<!doctype");
  const htmlTag = lower.indexOf("<html");
  const start = doctype >= 0 ? doctype : htmlTag;
  if (start < 0) throw new Error("model output contained no HTML document");
  const end = lower.lastIndexOf("</html>");
  return end >= 0 ? t.slice(start, end + "</html>".length) : t.slice(start);
}

/** Resolve the Gemini key: env first, then the editing agent's provider config. */
function resolveKey(): string {
  if (process.env.GEMINI_API_KEY) return process.env.GEMINI_API_KEY;
  const cfgPath = join(ROOT, ".agent-provider.json");
  if (existsSync(cfgPath)) {
    try {
      const cfg = JSON.parse(readFileSync(cfgPath, "utf8"));
      if (cfg.provider === "gemini" && cfg.apiKey) return cfg.apiKey as string;
    } catch {
      // fall through to the clear error
    }
  }
  throw new Error("no GEMINI_API_KEY (set the env var, or configure provider gemini with an apiKey in .agent-provider.json)");
}

/** Accept a real Gemini model id; ignore Stitch-style ids like GEMINI_3_1_PRO.
 *  (The bench's single --model is shared across tools; per-tool model is the
 *  next seam — until then a Gemini-shaped id passes through, anything else
 *  falls back to the default or GEMINI_MODEL.) */
function resolveModel(requested?: string): string {
  if (requested && /^gemini-/i.test(requested)) return requested;
  return process.env.GEMINI_MODEL || DEFAULT_GEMINI_MODEL;
}

class GeminiSession implements GenerationSession {
  readonly provenance: Record<string, unknown>;

  constructor(
    private readonly prompt: string,
    private readonly model: string,
    private readonly apiKey: string,
    private readonly temperature: number,
  ) {
    this.provenance = { tool: "gemini", model, temperature };
  }

  async generate(log: Logger): Promise<Rendering> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), GENERATION_TIMEOUT_MS);
    const req: NormalizedRequest = {
      provider: "gemini",
      model: this.model,
      messages: [{ role: "user", text: this.prompt }],
      tools: [],
      apiKey: this.apiKey,
      temperature: this.temperature,
      signal: controller.signal,
    };
    let text = "";
    let usage: InferenceEvent | undefined;
    let error: string | undefined;
    try {
      for await (const ev of geminiProvider(req)) {
        if (ev.kind === "text") text += ev.chunk;
        else if (ev.kind === "usage") usage = ev;
        else if (ev.kind === "error") error = ev.message;
      }
    } finally {
      clearTimeout(timer);
    }
    if (error) throw new Error(`gemini: ${error}`);
    if (!text.trim()) throw new Error("gemini returned no text");
    log(`generated ${text.length} chars`);
    const html = extractHtml(text);
    return { id: undefined, html, raw: { text, usage } };
  }

  async close(): Promise<void> {
    // No persistent resource — a raw model call holds nothing open.
  }
}

export class GeminiTool implements GenerationTool {
  readonly name = "gemini";
  // A raw model has no design-system pipeline; it can only receive the direction in the prompt.
  readonly channels: DirectionChannel[] = ["prompt"];

  async openSession(request: GenerateRequest, _log: Logger): Promise<GenerationSession> {
    const apiKey = resolveKey();
    const model = resolveModel(request.model);
    const directionBlock = request.designMd ? `\n\n${DIRECTION_PREAMBLE}\n\n${request.designMd}` : "";
    const prompt = `${GENERATION_INSTRUCTION}\n\n## Brief\n\n${request.brief}${directionBlock}`;
    return new GeminiSession(prompt, model, apiKey, DEFAULT_TEMPERATURE);
  }
}
