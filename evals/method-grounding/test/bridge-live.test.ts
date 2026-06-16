/**
 * Live smoke of the relay→agent seam against a real provider: Ollama on
 * localhost with a tool-capable small model. Auto-skips when Ollama isn't
 * running or the model isn't pulled — the scripted proof in bridge.test.ts
 * remains the deterministic gate.
 */
import { test, expect } from "bun:test";
import {
  createAgentSession,
  createReactLoopStrategy,
  createToolRegistry,
  createDispatch,
  createMetricsCollector,
  type SessionEvent,
  type ToolResult,
} from "@inbrowser/agent";
import { ollamaProvider } from "@inbrowser/relay";
import { relayProviderAsLlmClient } from "../src/agent/llm-bridge.ts";

const MODEL = "qwen3:4b";

async function ollamaHasModel(): Promise<boolean> {
  try {
    const res = await fetch("http://localhost:11434/api/tags", { signal: AbortSignal.timeout(1500) });
    const tags = (await res.json()) as { models: { name: string }[] };
    return tags.models.some((m) => m.name === MODEL);
  } catch {
    return false;
  }
}

test.skipIf(!(await ollamaHasModel()))(
  `live: ollama ${MODEL} drives a tool round-trip through the bridge`,
  async () => {
    const secret = `mg-${Math.floor(Math.random() * 100000)}`;
    const registry = createToolRegistry();
    let executed = 0;
    const lookupTool = {
      name: "lookup_secret",
      description: "Returns the secret code word. Call this when asked for the secret.",
      parameters: { type: "object", properties: {}, required: [] },
      async execute(): Promise<ToolResult<{ secret: string }>> {
        executed++;
        return { ok: true, summary: `the secret is ${secret}`, data: { secret } };
      },
    };
    registry.register(lookupTool);

    const session = createAgentSession({
      id: "bridge-live",
      strategy: createReactLoopStrategy(),
      llm: relayProviderAsLlmClient(ollamaProvider, { provider: "ollama", model: MODEL }),
      tools: createDispatch(registry),
      toolList: [lookupTool],
      toolContext: () => ({ signal: new AbortController().signal }),
      metrics: createMetricsCollector(),
      history: [],
      systemPromptBuilder: () => "You are a terse assistant. Use tools when they are relevant.",
    });

    const events: SessionEvent[] = [];
    for await (const event of session.submit(
      "Call the lookup_secret tool, then reply with exactly the secret code word it returns.",
      AbortSignal.timeout(120_000),
    )) {
      events.push(event);
    }

    expect(executed).toBeGreaterThanOrEqual(1);
    const text = events.filter((e) => e.kind === "text").map((e: any) => e.chunk).join("");
    expect(text).toContain(secret);
    expect(events.map((e) => e.kind)).toContain("completed");
  },
  150_000,
);
