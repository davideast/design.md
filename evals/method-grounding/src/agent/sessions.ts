/**
 * Interactive editing sessions: one AgentSession per draft case, living in
 * the server process where the tools touch cases/<key>.draft/ directly.
 * Turns run as jobs on a resumable in-memory engine, so the browser tails a
 * durable per-turn event log over SSE and a refreshed tab resumes from its
 * last offset. Sessions are independent of the generation-job slot.
 *
 * Provider configuration lives in .agent-provider.json (gitignored — it may
 * hold keys): { "provider": "ollama"|"anthropic"|"gemini"|"openrouter",
 * "model": "...", "apiKey": "...", "reasoningEffort": "low|medium|high" }.
 * Default is local Ollama — free iteration; switch to a frontier provider
 * for the final pass.
 */
import { readFileSync, existsSync, appendFileSync, mkdirSync, rmSync } from "node:fs";
import { join, dirname } from "node:path";
import {
  createAgentSession,
  createReactLoopStrategy,
  createToolRegistry,
  createDispatch,
  createMetricsCollector,
  type AgentSession,
  type SessionEvent,
  type ChatMessage,
} from "@inbrowser/agent";
import { anthropicProvider, geminiProvider, openrouterProvider, ollamaProvider, type InferenceProvider } from "@inbrowser/relay";
import { createJobEngine, type JobEngine } from "@inbrowser/resumable";
import { createMemoryJobStore } from "@inbrowser/resumable/memory";
import { ROOT } from "../cases.ts";
import { findCase } from "../viewer/authoring.ts";
import { relayProviderAsLlmClient } from "./llm-bridge.ts";
import { createCaseTools } from "./tools.ts";
import { createIdeationTools } from "./ideation-tools.ts";
import { findConcept } from "./concepts.ts";
import { snapshotDraft, snapshotConcept, diffSnapshots, type FileChange } from "./diff.ts";

// ---------------------------------------------------------------------------
// Provider configuration
// ---------------------------------------------------------------------------

const PROVIDER_FILE = join(ROOT, ".agent-provider.json");

const PROVIDERS: Record<string, InferenceProvider> = {
  ollama: ollamaProvider,
  anthropic: anthropicProvider,
  gemini: geminiProvider,
  openrouter: openrouterProvider,
};

export interface ProviderConfig {
  provider: string;
  model: string;
  apiKey?: string;
  reasoningEffort?: "off" | "low" | "medium" | "high";
}

export function providerConfig(): ProviderConfig {
  if (existsSync(PROVIDER_FILE)) {
    try {
      const parsed = JSON.parse(readFileSync(PROVIDER_FILE, "utf8"));
      if (parsed.provider && parsed.model) return parsed;
    } catch {
      // fall through to default
    }
  }
  return { provider: "ollama", model: "qwen3:4b" };
}

export function providerStatus(): { config: ProviderConfig; ok: boolean; problem: string | null } {
  const config = providerConfig();
  if (!PROVIDERS[config.provider]) {
    return { config, ok: false, problem: `unknown provider "${config.provider}" (known: ${Object.keys(PROVIDERS).join(", ")})` };
  }
  if (config.provider !== "ollama" && !config.apiKey) {
    return { config, ok: false, problem: `provider "${config.provider}" needs an apiKey in .agent-provider.json` };
  }
  return { config, ok: true, problem: null };
}

// ---------------------------------------------------------------------------
// The editing session
// ---------------------------------------------------------------------------

const SYSTEM_PROMPT = `You are a design-method author working on one draft case of an evaluation harness that tests whether grounded design direction beats adjective description.

You have tools. Start any task by reading the brief (read_brief) and tokens (read_tokens); read an arm before rewriting it. After every write, run validate_case and fix what it reports — your work is done only when validation is clean.

The invariants (mechanically enforced, so violations just bounce back from validate_case):
- Only prose varies between arms; tokens are shared and attached automatically by write_arm. Reference tokens in prose as {colors.x} / {typography.y}, names that exist in the tokens.
- No Do's and Don'ts section in any arm except full-spec — the treatments must let the grounding carry its prohibitions implicitly; describe the world positively, never name the forbidden defaults.
- Length parity: description, object, constraint, metaphor bodies roughly equal (~280–380 words). full-spec is exempt.
- The description arm is a good-faith adjectives-only control — the strongest version of that method, never a strawman.
- Arm structure: ## Overview (1–2 sentences) · ## Method (the grounding — the heart) · ## Colors · ## Typography · ## Layout. full-spec may add sections including Do's and Don'ts.
- The brief carries all content; arms carry only aesthetics.

The methods: description = adjectives only; object = one real fully-resolved artifact from another medium, named precisely, prose spent where this design departs from its default image; constraint = one hard limitation with the system deduced from living inside it; metaphor = one governing idea with each page element mapped onto it; full-spec = the complete designer-grade specification, the ceiling anchor.

Be concise in chat — the work happens through tools. Report what you changed and what validation says.`;

interface TurnRecord {
  jobId: string;
  prompt: string;
  status: "running" | "done" | "failed";
  text: string;
  thinking: number; // chars, not retained
  tools: { name: string; summary: string; ok: boolean }[];
  /** What the turn actually changed on disk — may exceed the literal ask. */
  changes: FileChange[];
  error?: string;
  startedAt: string;
}

/** Two modes over one infrastructure: produce (case tools, write access, the
 *  gate in the loop) and ideate (concept captures only — a thinking partner
 *  with system knowledge but no production access). */
export type SessionKind = "case" | "concept";

interface EditSession {
  kind: SessionKind;
  targetId: string;
  session: AgentSession;
  turns: TurnRecord[];
  busy: boolean;
  provider: ProviderConfig;
}

const sessions = new Map<string, EditSession>();
const sessionKey = (kind: SessionKind, id: string) => `${kind}:${id}`;
const engine: JobEngine<SessionEvent> = createJobEngine({ store: createMemoryJobStore<SessionEvent>() });

// ---------------------------------------------------------------------------
// Transcript persistence: completed turns append to a JSONL file next to the
// artifacts they produced, so the conversation that shaped a concept or draft
// survives restarts, provider switches, and (for concepts) commit. The file is
// the durable record; in-memory sessions seed from it on rebuild.
// ---------------------------------------------------------------------------

function transcriptPath(kind: SessionKind, targetId: string): string | null {
  if (kind === "concept") {
    const ref = findConcept(targetId);
    return ref ? join(ref.dir, "transcript.jsonl") : null;
  }
  const ref = findCase(targetId);
  // .authoring/ is the draft's scratch space — cleaned on promote, which is
  // the right lifetime for an authoring conversation.
  return ref?.draft ? join(ref.dir, ".authoring", "transcript.jsonl") : null;
}

function persistTurn(kind: SessionKind, targetId: string, turn: TurnRecord) {
  const path = transcriptPath(kind, targetId);
  if (!path) return;
  try {
    mkdirSync(dirname(path), { recursive: true });
    appendFileSync(path, JSON.stringify(turn) + "\n");
  } catch {
    // target removed mid-turn — nothing durable to write to
  }
}

function loadPersistedTurns(kind: SessionKind, targetId: string): TurnRecord[] {
  const path = transcriptPath(kind, targetId);
  if (!path || !existsSync(path)) return [];
  const turns: TurnRecord[] = [];
  for (const line of readFileSync(path, "utf8").split("\n")) {
    if (!line.trim()) continue;
    try {
      const turn = JSON.parse(line);
      if (turn && typeof turn.prompt === "string") turns.push(turn);
    } catch {
      // skip a torn line (e.g. crash mid-append)
    }
  }
  return turns;
}

/** Replay persisted turns into LLM history as plain user/assistant pairs.
 *  Tool calls aren't replayed verbatim (signatures don't survive provider
 *  switches); a bracketed note keeps the agent aware of what it already did. */
function seedHistory(turns: TurnRecord[]): ChatMessage[] {
  const history: ChatMessage[] = [];
  let seq = 0;
  for (const turn of turns) {
    if (turn.status !== "done") continue;
    const toolNote = turn.tools.length
      ? `${turn.text ? "\n\n" : ""}[tools used: ${turn.tools.map((t) => (t.ok ? t.name : `${t.name} (failed)`)).join(", ")}]`
      : "";
    if (!turn.text && !toolNote) continue;
    history.push({ id: `seed-${seq++}`, role: "user", text: turn.prompt });
    history.push({ id: `seed-${seq++}`, role: "assistant", text: turn.text + toolNote });
  }
  return history;
}

export function editEngine(): JobEngine<SessionEvent> {
  return engine;
}

function ideatePrompt(): string {
  return readFileSync(join(ROOT, "authoring", "ideate.md"), "utf8");
}

function buildSession(kind: SessionKind, targetId: string, config: ProviderConfig): EditSession {
  const tools = kind === "case" ? createCaseTools(targetId) : createIdeationTools(targetId);
  const prompt = kind === "case" ? SYSTEM_PROMPT : ideatePrompt();
  const registry = createToolRegistry();
  for (const tool of tools) registry.register(tool);
  const turns = loadPersistedTurns(kind, targetId);
  const session = createAgentSession({
    id: `${kind}:${targetId}`,
    strategy: createReactLoopStrategy(),
    llm: relayProviderAsLlmClient(PROVIDERS[config.provider], {
      provider: config.provider,
      model: config.model,
      apiKey: config.apiKey,
      reasoningEffort: config.reasoningEffort === "off" ? undefined : config.reasoningEffort,
    }),
    tools: createDispatch(registry),
    toolList: tools,
    toolContext: () => ({ signal: new AbortController().signal }),
    metrics: createMetricsCollector(),
    history: seedHistory(turns),
    systemPromptBuilder: () => prompt,
  });
  return { kind, targetId, session, turns, busy: false, provider: config };
}

/** Drop a session. Lifecycle callers (promote/delete/commit) keep the
 *  persisted transcript — a committed concept's ideation record is part of its
 *  provenance. The user-facing reset clears it for a genuinely blank slate. */
export function resetEditSession(kind: SessionKind, targetId: string, opts?: { clearTranscript?: boolean }) {
  if (opts?.clearTranscript) {
    const path = transcriptPath(kind, targetId);
    if (path) rmSync(path, { force: true });
  }
  sessions.delete(sessionKey(kind, targetId));
}

export interface SubmitResult {
  jobId?: string;
  error?: string;
}

export async function submitTurn(kind: SessionKind, targetId: string, prompt: string): Promise<SubmitResult> {
  let targetDir: string;
  if (kind === "case") {
    const ref = findCase(targetId);
    if (!ref || !ref.draft) return { error: "editing sessions work on drafts only" };
    targetDir = ref.dir;
  } else {
    const ref = findConcept(targetId);
    if (!ref) return { error: `concept "${targetId}" not found` };
    targetDir = ref.dir;
  }
  const status = providerStatus();
  if (!status.ok) return { error: status.problem! };

  const key = sessionKey(kind, targetId);
  let edit = sessions.get(key);
  // A provider change invalidates the live session (history is preserved in
  // the transcript, not replayed into the new provider).
  if (edit && JSON.stringify(edit.provider) !== JSON.stringify(status.config)) {
    edit = undefined;
  }
  if (!edit) {
    edit = buildSession(kind, targetId, status.config);
    sessions.set(key, edit);
  }
  if (edit.busy) return { error: "a turn is already in flight here" };
  edit.busy = true;

  const turn: TurnRecord = {
    jobId: "",
    prompt,
    status: "running",
    text: "",
    thinking: 0,
    tools: [],
    changes: [],
    startedAt: new Date().toISOString(),
  };
  edit.turns.push(turn);
  const snapshot = kind === "case" ? snapshotDraft : snapshotConcept;
  const before = snapshot(targetDir);

  const { jobId } = await engine.start(async function* (ctx) {
    try {
      for await (const event of edit!.session.submit(prompt, ctx.signal)) {
        fold(turn, event);
        yield event;
      }
      turn.status = turn.error ? "failed" : "done";
    } catch (err) {
      turn.status = "failed";
      turn.error = err instanceof Error ? err.message : String(err);
      yield { kind: "error", message: turn.error } satisfies SessionEvent;
    } finally {
      try {
        turn.changes = diffSnapshots(before, snapshot(targetDir));
      } catch {
        // target may have been deleted mid-turn
      }
      persistTurn(kind, targetId, turn);
      edit!.busy = false;
    }
  });
  turn.jobId = jobId;
  return { jobId };
}

function fold(turn: TurnRecord, event: SessionEvent) {
  switch (event.kind) {
    case "text":
      turn.text += event.chunk;
      break;
    case "thinking":
      turn.thinking += event.chunk.length;
      break;
    case "tool_started":
      turn.tools.push({ name: event.name, summary: "…", ok: true });
      break;
    case "tool_finished": {
      const last = [...turn.tools].reverse().find((t) => t.summary === "…");
      if (last) {
        last.summary = event.result.summary;
        last.ok = event.result.ok;
      }
      break;
    }
    case "error":
      turn.error = event.message;
      break;
  }
}

export interface TranscriptTurn {
  jobId: string;
  prompt: string;
  status: string;
  text: string;
  tools: { name: string; summary: string; ok: boolean }[];
  changes: FileChange[];
  error?: string;
  startedAt: string;
}

export function transcript(kind: SessionKind, targetId: string): { provider: ProviderConfig; turns: TranscriptTurn[] } {
  const edit = sessions.get(sessionKey(kind, targetId));
  // No live session (fresh start, post-commit, post-restart): the JSONL file
  // is the record. A live session's turns array already begins with it.
  const turns = edit?.turns ?? loadPersistedTurns(kind, targetId);
  return {
    provider: edit?.provider ?? providerConfig(),
    turns: turns.map(({ thinking: _t, ...turn }) => ({ ...turn })),
  };
}
