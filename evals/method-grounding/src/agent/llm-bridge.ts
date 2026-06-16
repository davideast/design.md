/**
 * The seam between @inbrowser/relay and @inbrowser/agent:
 * adapts an InferenceProvider (async generator of InferenceEvents) into the
 * agent runtime's LlmClient (chat(req, signal) → AsyncIterable<ChatEvent>).
 *
 * The shapes are near-isomorphic — message vocabulary is shared, event kinds
 * map 1:1 (callId→id), and relay's terminal `usage` event becomes the agent's
 * `turn_complete`. One semantic addition: the agent loop requires a
 * turn_complete even when the provider stream ends without reporting usage,
 * so the bridge always emits one unless the turn errored.
 */
import type { LlmClient, ChatRequest, ChatEvent, RawUsage } from "@inbrowser/agent";
import type { InferenceProvider, NormalizedRequest, ReasoningEffort } from "@inbrowser/relay";

export interface BridgeConfig {
  /** Relay provider name, recorded in the NormalizedRequest (e.g. "anthropic", "ollama"). */
  provider: string;
  model: string;
  apiKey?: string;
  reasoningEffort?: ReasoningEffort;
  /** Optional request decorator for provider-specific fields (temperature, …). */
  decorate?: (req: NormalizedRequest) => NormalizedRequest;
}

export function relayProviderAsLlmClient(infer: InferenceProvider, config: BridgeConfig): LlmClient {
  return {
    id: `${config.provider}:${config.model}`,
    supportsTools: true,
    chat(req: ChatRequest, signal: AbortSignal): AsyncIterable<ChatEvent> {
      return run(infer, config, req, signal);
    },
  };
}

async function* run(
  infer: InferenceProvider,
  config: BridgeConfig,
  req: ChatRequest,
  signal: AbortSignal,
): AsyncIterable<ChatEvent> {
  let request: NormalizedRequest = {
    provider: config.provider,
    model: config.model,
    // Agent NormalizedMessage and relay LegacyChatMessage share their shape
    // (role/text/toolCalls/callId/name/resultJson) — pass through.
    messages: req.messages,
    tools: req.toolUseEnabled ? req.tools : [],
    apiKey: config.apiKey ?? "",
    reasoningEffort: config.reasoningEffort,
    signal,
  };
  if (config.decorate) request = config.decorate(request);

  let usage: RawUsage | null = null;
  let errored = false;
  for await (const event of infer(request)) {
    if (signal.aborted) return;
    switch (event.kind) {
      case "text":
        yield { kind: "text", chunk: event.chunk };
        break;
      case "thinking":
        yield { kind: "thinking", chunk: event.chunk };
        break;
      case "tool_call":
        yield { kind: "tool_call", id: event.callId, name: event.name, args: event.args, signature: event.signature };
        break;
      case "usage":
        usage = {
          promptTokens: event.promptTokens,
          completionTokens: event.outputTokens,
          cachedTokens: event.cachedTokens,
          costUsd: event.costUsd,
        };
        break;
      case "error":
        errored = true;
        yield { kind: "error", message: event.message };
        break;
    }
  }
  if (!errored) {
    yield {
      kind: "turn_complete",
      usage: usage ?? { promptTokens: 0, completionTokens: 0 },
      details: { requestedModel: config.model },
    };
  }
}
