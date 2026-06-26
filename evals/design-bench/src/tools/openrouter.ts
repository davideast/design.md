/**
 * The OpenRouter generation tool: one raw-model adapter that reaches many
 * frontier models (GPT, Claude/Opus, Kimi, GLM, …) through a single key, by
 * passing the OpenRouter model slug as --model. Like the Gemini tool it is a
 * blank model — prompt in, HTML out — so it supports only the prompt channel
 * and reuses @inbrowser/relay's openrouterProvider for auth/streaming/wire.
 *
 * It shares the Gemini tool's neutral generation wrapper (the instruction +
 * the DESIGN.md preamble) on purpose: every raw-model column must receive the
 * identical framing, or a tool comparison measures the wrapper, not the tool.
 */
import { openrouterModelClient, type ModelRequest, type ModelEvent } from "@inbrowser/model";
import { GENERATION_INSTRUCTION, DIRECTION_PREAMBLE, extractHtml } from "./gemini.ts";
import type { GenerationTool, GenerationSession, GenerateRequest, Rendering, Logger, DirectionChannel } from "./types.ts";

const DEFAULT_TEMPERATURE = 0.9;
/** OpenRouter routing adds hops and some models are slow — give more headroom. */
const GENERATION_TIMEOUT_MS = 240_000;

/** BYOK: relay treats apiKey as opaque, so the tool resolves it from .env. */
function resolveKey(): string {
  const key = process.env.OPEN_ROUTER_API_KEY || process.env.OPENROUTER_API_KEY;
  if (key) return key;
  throw new Error("no OPEN_ROUTER_API_KEY (set it in .env)");
}

/** OpenRouter model ids are `vendor/model` slugs — require one explicitly; a
 *  raw model has no sensible house default the way Stitch/Gemini do. */
function resolveModel(requested?: string): string {
  if (requested && requested.includes("/")) return requested;
  throw new Error(`openrouter needs a model slug like "anthropic/claude-opus-4.8" (got "${requested ?? ""}")`);
}

class OpenRouterSession implements GenerationSession {
  readonly provenance: Record<string, unknown>;

  constructor(
    private readonly prompt: string,
    private readonly model: string,
    private readonly apiKey: string,
    private readonly temperature: number,
  ) {
    this.provenance = { tool: "openrouter", model, temperature };
  }

  async generate(log: Logger): Promise<Rendering> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), GENERATION_TIMEOUT_MS);
    const client = openrouterModelClient({ apiKey: this.apiKey, model: this.model });
    const req: ModelRequest = {
      messages: [{ role: "user", text: this.prompt }],
      tools: [],
      toolUseEnabled: false,
      temperature: this.temperature,
    };
    let text = "";
    let usage: ModelEvent | undefined;
    let error: string | undefined;
    try {
      for await (const ev of client.chat(req, controller.signal)) {
        if (ev.kind === "text") text += ev.text;
        else if (ev.kind === "usage") usage = ev;
        else if (ev.kind === "error") error = ev.message;
      }
    } finally {
      clearTimeout(timer);
    }
    if (error) throw new Error(`openrouter (${this.model}): ${error}`);
    if (!text.trim()) throw new Error(`openrouter (${this.model}) returned no text`);
    log(`generated ${text.length} chars`);
    return { id: undefined, html: extractHtml(text), raw: { text, usage } };
  }

  async close(): Promise<void> {
    // A raw model call holds nothing open.
  }
}

export class OpenRouterTool implements GenerationTool {
  readonly name = "openrouter";
  // A raw model has no design-system pipeline; it can only receive the direction in the prompt.
  readonly channels: DirectionChannel[] = ["prompt"];

  async openSession(request: GenerateRequest, _log: Logger): Promise<GenerationSession> {
    const apiKey = resolveKey();
    const model = resolveModel(request.model);
    const directionBlock = request.designMd ? `\n\n${DIRECTION_PREAMBLE}\n\n${request.designMd}` : "";
    const prompt = `${GENERATION_INSTRUCTION}\n\n## Brief\n\n${request.brief}${directionBlock}`;
    return new OpenRouterSession(prompt, model, apiKey, DEFAULT_TEMPERATURE);
  }
}
