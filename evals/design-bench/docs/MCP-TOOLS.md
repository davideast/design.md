# Design Bench MCP tools

The Design Bench MCP server (`src/mcp.ts`) lets any MCP agent (Claude Code, Cursor, …)
drive the whole brief → generation → measurement process as tools — no creation UI.
It exposes **23 tools** in five groups.

## Connect
The server resolves `cases/`, `runs/`, `concepts/` from its **working directory**, so it
must run with cwd = the `design-bench` package root. The committed `.mcp.json` does this:

```jsonc
{ "mcpServers": { "design-bench": { "command": "bun", "args": ["src/mcp.ts"] } } }
```
Launch your agent from `evals/design-bench/` so it picks up the project-scoped `.mcp.json`.
`*` below marks a required parameter.

---

## The server is purely mechanical (read this first)
**No MCP tool ever calls an LLM.** The server only reads, writes, validates, scores, and
publishes files. *All* LLM work — ideation, authoring prose, and rendering screens — is done
by the **connected agent**, which then persists the result through a tool:

- **Authoring:** the agent writes the brief/arms; `capture_*` / `write_*` just persist them.
- **Generation:** `get_render_prompt` hands the agent the exact prompt; the agent renders the
  HTML itself; `submit_render` stores it as a measurable sample. **No model call in the server.**

Generating a column with a *paid provider* (Stitch / Gemini / OpenRouter) is deliberately
**not** an MCP tool — it's an operator-run CLI (`bun src/generate.ts …`), kept off the
mechanical surface so an agent driving MCP can never trigger metered spend.

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
Paid-provider columns are **not** made through MCP — that's an operator action on the CLI,
intentionally outside the mechanical surface:
`bun src/generate.ts --tool gemini --cases garden-cal --arms no-design-md,object --run gemini`
→ `measure("gemini")` → `snapshot()`.
