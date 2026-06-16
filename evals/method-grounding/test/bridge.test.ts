/**
 * Proof of the relay→agent seam: a scripted InferenceProvider drives a full
 * AgentSession turn cycle through relayProviderAsLlmClient — model requests a
 * tool, the session executes it, the model reads the result and answers.
 * If this passes, any relay provider (anthropic/gemini/openrouter/ollama)
 * can drive the authoring loop.
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
import type { InferenceProvider } from "@inbrowser/relay";
import { relayProviderAsLlmClient } from "../src/agent/llm-bridge.ts";

/** Turn 1: call the echo tool. Turn 2 (tool result present): answer with it. */
const scriptedProvider: InferenceProvider = async function* (req) {
  const toolResult = req.messages.find((m) => m.role === "tool");
  if (!toolResult) {
    yield { kind: "thinking", chunk: "I should echo." };
    yield { kind: "tool_call", callId: "call-1", name: "echo", args: { text: "ping" } };
    yield { kind: "usage", promptTokens: 10, outputTokens: 5 };
  } else {
    yield { kind: "text", chunk: `the tool said: ${toolResult.resultJson}` };
    yield { kind: "usage", promptTokens: 20, outputTokens: 8, costUsd: 0.0001 };
  }
};

test("relay provider drives a full agent session turn cycle via the bridge", async () => {
  const registry = createToolRegistry();
  const executed: unknown[] = [];
  const echoTool = {
    name: "echo",
    description: "Echo the given text back.",
    parameters: { type: "object", properties: { text: { type: "string" } }, required: ["text"] },
    async execute(args: { text: string }): Promise<ToolResult<{ echoed: string }>> {
      executed.push(args);
      return { ok: true, summary: `echoed ${args.text}`, data: { echoed: args.text } };
    },
  };
  registry.register(echoTool);

  const session = createAgentSession({
    id: "bridge-proof",
    strategy: createReactLoopStrategy(),
    llm: relayProviderAsLlmClient(scriptedProvider, { provider: "scripted", model: "test-model" }),
    tools: createDispatch(registry),
    toolList: [echoTool],
    toolContext: () => ({ signal: new AbortController().signal }),
    metrics: createMetricsCollector(),
    history: [],
    systemPromptBuilder: () => "You are a test agent.",
  });

  const events: SessionEvent[] = [];
  for await (const event of session.submit("go", new AbortController().signal)) {
    events.push(event);
  }

  const kinds = events.map((e) => e.kind);
  expect(kinds).toContain("tool_started");
  expect(kinds).toContain("tool_finished");
  expect(kinds).toContain("text");
  expect(kinds).toContain("completed");
  expect(kinds).not.toContain("error");

  // The tool actually executed with the model's args.
  expect(executed).toEqual([{ text: "ping" }]);

  // The second turn's text incorporated the tool result.
  const text = events.filter((e) => e.kind === "text").map((e: any) => e.chunk).join("");
  expect(text).toContain("the tool said:");
  expect(text).toContain("echoed");

  // Usage flowed through to turn metrics (two turns completed).
  const turns = events.filter((e) => e.kind === "turn_completed");
  expect(turns.length).toBeGreaterThanOrEqual(2);
});
