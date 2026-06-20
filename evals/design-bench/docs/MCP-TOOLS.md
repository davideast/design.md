# Design Bench MCP tools

The Design Bench MCP server (`src/mcp.ts`) lets any MCP agent (Claude Code, Cursor, …)
drive the whole brief → generation → measurement process as tools — no creation UI.
It exposes **24 tools** in five groups.

## Connect
The server resolves `cases/`, `runs/`, `concepts/` from its **working directory**, so it
must run with cwd = the `design-bench` package root. The committed `.mcp.json` does this:

```jsonc
{ "mcpServers": { "design-bench": { "command": "bun", "args": ["src/mcp.ts"] } } }
```
Launch your agent from `evals/design-bench/` so it picks up the project-scoped `.mcp.json`.
`*` below marks a required parameter.

---

## The two generation paths (read this first)
A "render" is one tool's HTML for one case × arm. There are **two ways** to produce one,
and this is the thing most worth understanding:

| Path | Tools | Who generates | Cost |
|---|---|---|---|
| **Agent-as-generator** | `get_render_prompt` → `submit_render` | **the connected agent itself** (e.g. Claude on your subscription) | **no API call** |
| **Paid tool** | `run_generation` | a metered provider (Stitch / Gemini-direct / an OpenRouter model) | **billed per token** |

So `run_generation` *does* perform LLM generation — but only because you're explicitly
asking a **paid provider** to render, e.g. to add an "Opus 4.8" or "Stitch" column to the
matrix. For *your own* column, you (the agent) render the prompt yourself and `submit_render`
it — free. Pick per cell/column.

---

## Discovery (read-only)
| Tool | Params | What it returns |
|---|---|---|
| `list_cases` | — | All cases (promoted + draft) with key, draft flag, title. |
| `list_concepts` | — | Ideation concepts: id + whether brief/direction are captured. |
| `get_case` | `key*` | A case's brief, config, validation gate, and arms present. |
| `read_concept` | `conceptId*` | A concept's spark + capture state (brief, direction). |
| `read_brief` | `key*` | The case brief (content world) + config (title, device, generic center, flags). |
| `read_tokens` | `key*` | The shared YAML token front matter every arm carries. |
| `read_arm` | `key*, arm*` | One arm's prose body (front matter omitted — it's shared). |
| `read_proposals` | `key*` | Previously proposed grounding candidates, if a propose pass ran. |

## Ideation → case creation
| Tool | Params | What it does |
|---|---|---|
| `create_concept` | `spark*` | Start a concept from a one-line spark. Returns the concept id. |
| `capture_brief` | `conceptId*, brief*` | Persist the agreed brief (content world, real copy, **zero aesthetics**). |
| `capture_direction` | `conceptId*, content*` | Persist the agreed direction: a full DESIGN.md (YAML tokens between `---` fences + the world in prose). |
| `commit_concept` | `conceptId*, key*, title*`, `deviceType`, `genericCenter`, `prohibitions[]`, `requirements[]` | Scaffold a draft case from the concept's captured brief + direction. Requires both captured. |

## Authoring (edit drafts)
| Tool | Params | What it does |
|---|---|---|
| `write_brief` | `key*, brief*` | Rewrite the brief (content only; aesthetics live in arms). |
| `write_tokens` | `key*, yaml*` | Replace the shared tokens; synchronized into **every** arm (identity preserved). |
| `write_arm` | `key*, arm*, body*` | Write one arm's prose body (shared front matter attached automatically). Writable arms: description, object, constraint, metaphor, full-spec. Invariants: no Do's/Don'ts outside full-spec; ~280–380-word parity; reference tokens as `{colors.x}`. |
| `update_case_json` | `key*`, `title`, `deviceType`, `genericCenter`, `prohibitions[]`, `requirements[]` | Patch case config. Flags: gradients, shadows, roundedCorners, boldUses, iconFonts, extraFonts, darkBackground. |
| `validate_case` | `key*` | Run the gate: linter, token identity, length parity, TODO markers, Do's/Don'ts placement, brief completeness. Promotion needs zero errors. |
| `promote_case` | `key*` | Promote a draft into the gallery (only if validation passes). |
| `delete_draft` | `key*` | Delete a draft case. |

## Generation
| Tool | Params | What it does |
|---|---|---|
| `get_render_prompt` | `case*, arm*` | Returns the exact prompt (brief + the arm's DESIGN.md + the neutral instruction). **You render it, then `submit_render`. No API.** |
| `submit_render` | `provider*, case*, arm*, html*`, `sampleIndex` | Store HTML you generated as a measurable sample under a provider run (e.g. `provider="claude-sub"`). Mirrors `generate.ts` run-init so it's measurable. **No API.** |
| `run_generation` | `tool*, cases*, arms*, run*`, `model`, `samples`, `channels` | **Paid.** Generate via `stitch` \| `gemini` \| `openrouter` (a metered API call). Use only when you want that provider as a column; else prefer the two tools above. |

## Measurement / publish
| Tool | Params | What it does |
|---|---|---|
| `measure` | `run*` | Score a run — palette/type fidelity, prohibition violations, distance from the default look. Writes `report.json`. |
| `snapshot` | — | Refresh the viewer's committed inputs (`app/data` + `public/samples`) so the read-only matrix shows new results. |

---

## End-to-end flow (agent-driven, no UI, no paid API)
```
create_concept("a wall calendar for a community garden")   → conceptId
  (agent proposes worlds, converges with the human)
capture_brief(conceptId, "<content world, real copy>")
capture_direction(conceptId, "---\n<tokens>\n---\n<world prose>")
commit_concept(conceptId, key="garden-cal", title="Community Garden Calendar")
  (agent writes each treatment)
write_arm("garden-cal", "object", "<prose>")   ×N
validate_case("garden-cal")                     → fix until zero errors
promote_case("garden-cal")
  (agent renders each arm itself — no API)
get_render_prompt("garden-cal", "object")       → prompt
submit_render("claude-sub", "garden-cal", "object", "<html>")
measure("claude-sub")
snapshot()                                       → matrix updates
```
To add a *paid* column instead of rendering yourself:
`run_generation(tool="gemini", cases="garden-cal", arms="no-design-md,object", run="gemini")` → `measure("gemini")` → `snapshot()`.

---

## Note on naming
`run_generation` is the vaguest name in the set — it reads like "generate" in general, but it
specifically means "generate via a **paid** provider." A clearer name (`run_paid_generation`
or `generate_with_model`) would remove the ambiguity. Left as-is for now; easy to rename.
