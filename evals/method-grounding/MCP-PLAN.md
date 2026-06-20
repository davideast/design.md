# Design Bench — MCP-driven authoring & generation

## The pivot
Drop **all creation UI** and the planned SSR (Phase 2 is cancelled). Authoring and
generation are driven through **MCP tools** that any agent (Claude Code, Cursor, …)
can call. The Astro viewer stays **read-only** (browse/compare matrix, static deploy).

Two wins:
1. **The external agent becomes the author.** Today the bench runs its *own* in-app
   agent (sessions.ts → llm-bridge → relay → a metered model) for ideation/authoring.
   With MCP, the connected agent *is* that agent — it diverges on worlds and calls the
   capture/write tools directly. We can drop the in-app agent runtime entirely.
2. **The external agent can be a generator** — so not every generation is a paid API
   call. The agent (e.g. Claude Code on a Max subscription) renders a brief itself and
   submits it, instead of the bench paying Stitch/Gemini/OpenRouter for every cell.

## What's already there (so this is exposure, not a rebuild)
- The process verbs already exist as `@inbrowser/agent` **ToolHandlers**:
  - ideation (`src/agent/ideation-tools.ts`): `read_concept`, `capture_brief`, `capture_direction`
  - authoring (`src/agent/tools.ts`): `read_brief`/`write_brief`, `read_tokens`/`write_tokens`, `read_arm`/`write_arm`, `update_case_json`, `validate_case`
  - plus exported fns: `createConcept`, `scaffoldCase`, `promoteCase`, `deleteDraft`, `validateCase`, `loadCases`, and the `generate`/`measure` pipeline.
- A **ToolHandler** is `{ name, description, parameters: JsonSchema, execute(args) → { ok, summary, data } }` — already MCP-tool-shaped.
- `@modelcontextprotocol/sdk` is installed in the bench.
- Reuse pattern available: `@inbrowser/mcp` (firebase-agent-sdk `packages/mcp`: `server.ts`, `compose-registry.ts`, `json-schema-to-zod.ts`) composes a ToolHandler registry into an MCP server; pyric's `mcp-proxy`/bridge is the stdio-relay precedent. We can build directly on the MCP SDK and optionally lift the compose helper.

## ToolHandler → MCP mapping (mechanical)
`name` → tool name · `description` → description · `parameters` (JsonSchema) → `inputSchema` · `execute(args)` → call it, return `summary` as text content + `data` as structured content. One adapter wraps every existing ToolHandler.

## Proposed MCP tool surface
**Discovery (read)**
- `list_cases`, `get_case` (brief, tokens, arms, status), `list_drafts`, `list_concepts`, `list_runs`, `get_matrix` (the case × provider grid the viewer shows)

**Case creation / ideation** — the host agent does the thinking; tools persist
- `create_concept(spark)` → concept id
- `capture_brief(conceptId, markdown)`, `capture_direction(conceptId, frontMatter, prose)`
- `commit_concept(conceptId, name)` → scaffolds the draft case from the captured artifacts

**Authoring** — the host agent writes; tools enforce structure
- `read_brief`/`write_brief`, `read_arm`/`write_arm`, `read_tokens`/`write_tokens`, `update_case_json`
- `validate_case(key)` (the gate: shared tokens, length spread, markers, do's/don'ts), `promote_case(key)`, `delete_draft(key)`

**Generation** — two paths, choose per run
- `get_render_prompt(case, arm, channel)` → the exact assembled prompt (brief + DESIGN.md + neutral instruction). *The agent-as-generator path.*
- `submit_render(case, arm, html, provider="agent")` → stores the agent's own HTML as a sample under a provider/run (no metered API).
- `run_generation(tool, cases, arms, samples, channels, model, run)` → wraps `generate.ts` for the paid tools (Stitch/Gemini/OpenRouter) when you *do* want them.

**Measurement / publish**
- `measure(run)` → wraps `measure.ts`
- `snapshot()` → refresh `app/data` + `public/samples` so the read-only viewer shows new results

## End-to-end flow, agent-driven, no UI
1. `create_concept("a tide chart for surfers")`
2. *(agent diverges on worlds itself)* → `capture_brief(...)`, `capture_direction(...)`
3. `commit_concept(id, "tide-chart")` → draft scaffolded
4. *(agent writes each treatment)* → `write_arm(...)` ×N, `validate_case`, `promote_case`
5. Generate: either `get_render_prompt` → *(agent renders)* → `submit_render` (free), or `run_generation(tool: "gemini", …)` (paid) — your choice per cell/column
6. `measure(run)` → `snapshot()` → the deployed matrix updates

## What to build / drop
**Build**
- `src/mcp.ts` — a stdio MCP server (declared in `.mcp.json` / `claude mcp add`) registering all tools via one ToolHandler→MCP adapter.
- New tools not yet present: `create_concept`/`commit_concept` wrappers, `get_render_prompt`, `submit_render`, `run_generation`, `measure`, `snapshot`, `get_matrix`, `list_*`.
- A `provider="agent"` generation lane (submit_render writes a run the matrix reads as a column).

**Drop**
- The Astro maker screens (`concepts`, `drafts`, `settings`, `new`) — remove or demote to read-only.
- The in-app agent runtime (`src/agent/sessions.ts`, `llm-bridge.ts`, relay agent loop) — the MCP host replaces it. *(Keep the relay providers for the paid `run_generation` path.)*
- The old `src/viewer` (already slated for retirement).

**Keep**
- The read-only Astro viewer (matrix, case/treatment/rendering pages), built from `app/data` (Phase 1), deployed static.

## Open questions to confirm
1. **Naming of the agent column** — `submit_render(provider="agent")` stored under a run like `agent-<model>`? How should it label in the matrix (e.g., "Claude (subscription)")?
2. **Server transport** — plain stdio server (agent spawns `bun src/mcp.ts`) vs pyric-style bridge+proxy (runtime discovery). Stdio is simpler; recommend it.
3. **Reuse `@inbrowser/mcp`** (your monorepo's compose helper) vs build directly on `@modelcontextprotocol/sdk` (already installed here). 
4. **Keep paid `run_generation` tools** at all, or go fully agent-as-generator?
