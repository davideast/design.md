/**
 * Design Bench MCP server (stdio). Exposes the brief → generation process as
 * tools any agent (Claude Code, Cursor, …) can drive — replacing the creation
 * UI. The connected agent becomes the author (it calls capture/write tools) and
 * can be a generator itself: `get_render_prompt` hands it the exact prompt and
 * `submit_render` stores its HTML as a measurable run — no metered API call.
 *
 * Run from the package root (so cases/ runs/ concepts/ resolve):
 *   bun src/mcp.ts
 * Then register as a stdio MCP server in the agent (.mcp.json / `claude mcp add`).
 */
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { ListToolsRequestSchema, CallToolRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { mkdirSync, writeFileSync, existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
import { spawn } from "node:child_process";
import type { ToolHandler, ToolContext } from "@inbrowser/agent";

import { createConcept, findConcept, listConcepts, conceptArtifacts, markCommitted } from "./agent/concepts.ts";
import { createIdeationTools } from "./agent/ideation-tools.ts";
import { createCaseTools } from "./agent/tools.ts";
import { findCase, loadCaseRef, listAllCases, scaffoldCase, promoteCase, deleteDraft, validateCase } from "./viewer/authoring.ts";
import { loadCases, evalHashOf, snapshotEval } from "./cases.ts";
import { GENERATION_INSTRUCTION, DIRECTION_PREAMBLE } from "./tools/gemini.ts";

const RUNS = resolve(process.cwd(), "runs");
const newCtx = (): ToolContext => ({ signal: new AbortController().signal });

interface McpTool {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
  run(args: Record<string, any>): Promise<{ ok: boolean; summary: string; data?: unknown }>;
}
const tools: McpTool[] = [];

// ── reuse the existing ToolHandlers, parameterized by target id ──────────────
function addBoundToolset(idField: string, idDesc: string, factory: (id: string) => ToolHandler[]) {
  for (const sample of factory("__probe__")) {
    const base = (sample.parameters as any) ?? { properties: {}, required: [] };
    tools.push({
      name: sample.name,
      description: sample.description,
      inputSchema: {
        type: "object",
        properties: { [idField]: { type: "string", description: idDesc }, ...(base.properties ?? {}) },
        required: [idField, ...((base.required as string[]) ?? [])],
      },
      async run(args) {
        const id = args[idField];
        const { [idField]: _drop, ...rest } = args;
        const handler = factory(id).find((t) => t.name === sample.name);
        if (!handler) return { ok: false, summary: `tool ${sample.name} unavailable` };
        const r = await handler.execute(rest, newCtx());
        return { ok: r.ok, summary: r.summary, data: r.data };
      },
    });
  }
}
addBoundToolset("conceptId", "ideation concept id", createIdeationTools); // read_concept, capture_brief, capture_direction
addBoundToolset("key", "draft case key", createCaseTools); // read/write brief·tokens·arm, validate_case, update_case_json, …

// ── discovery ────────────────────────────────────────────────────────────────
tools.push({
  name: "list_cases",
  description: "List all cases (promoted + draft) with title and status.",
  inputSchema: { type: "object", properties: {}, required: [] },
  async run() {
    const rows = listAllCases().map((r) => ({ key: r.key, draft: r.draft, title: loadCaseRef(r)?.config.title ?? r.key }));
    return { ok: true, summary: `${rows.length} cases`, data: rows };
  },
});
tools.push({
  name: "list_concepts",
  description: "List ideation concepts (spark + whether brief/direction are captured).",
  inputSchema: { type: "object", properties: {}, required: [] },
  async run() {
    const rows = listConcepts().map((ref) => {
      const a = conceptArtifacts(ref);
      return { id: ref.id, brief: a.brief != null, direction: a.direction != null };
    });
    return { ok: true, summary: `${rows.length} concepts`, data: rows };
  },
});
tools.push({
  name: "get_case",
  description: "Read a case: brief, config, validation gate, and the arms present.",
  inputSchema: { type: "object", properties: { key: { type: "string" } }, required: ["key"] },
  async run({ key }) {
    const ref = findCase(key);
    if (!ref) return { ok: false, summary: `case "${key}" not found` };
    const dc = loadCaseRef(ref);
    const v = validateCase(ref);
    return {
      ok: true,
      summary: `${dc?.config.title ?? key} — ${ref.draft ? "draft" : "promoted"}, ${v.errors === 0 ? "passes checks" : `${v.errors} check error(s)`}, arms: ${[...(dc?.armFiles.keys() ?? [])].join(", ")}`,
      data: { config: dc?.config, brief: dc?.brief, arms: [...(dc?.armFiles.keys() ?? [])], validation: v },
    };
  },
});

// ── ideation / case lifecycle ────────────────────────────────────────────────
tools.push({
  name: "create_concept",
  description: "Start a new ideation concept from a one-line spark. Returns the concept id to author against.",
  inputSchema: { type: "object", properties: { spark: { type: "string" } }, required: ["spark"] },
  async run({ spark }) {
    const ref = createConcept(String(spark));
    return { ok: true, summary: `concept ${ref.id} created`, data: { conceptId: ref.id } };
  },
});
tools.push({
  name: "commit_concept",
  description: "Scaffold a draft case from a concept's captured brief + direction. Requires both captured.",
  inputSchema: {
    type: "object",
    properties: {
      conceptId: { type: "string" },
      key: { type: "string", description: "short case key, e.g. tide-chart" },
      title: { type: "string" },
      deviceType: { type: "string", description: "DESKTOP | MOBILE | TABLET", default: "DESKTOP" },
      genericCenter: { type: "string", description: "the obvious default look this case escapes" },
      prohibitions: { type: "array", items: { type: "string" } },
      requirements: { type: "array", items: { type: "string" } },
    },
    required: ["conceptId", "key", "title"],
  },
  async run(args) {
    const ref = findConcept(args.conceptId);
    if (!ref) return { ok: false, summary: `concept "${args.conceptId}" not found` };
    const a = conceptArtifacts(ref);
    if (!a.brief || !a.direction) return { ok: false, summary: "concept needs both brief and direction captured before commit" };
    const { dir } = scaffoldCase({
      key: args.key,
      title: args.title,
      deviceType: args.deviceType ?? "DESKTOP",
      genericCenter: args.genericCenter ?? "",
      prohibitions: args.prohibitions ?? [],
      requirements: args.requirements ?? [],
      brief: a.brief,
      tokensOrDesignMd: a.direction,
    });
    markCommitted(ref.id, args.key);
    return { ok: true, summary: `committed concept → draft case "${args.key}" at ${dir}`, data: { key: args.key } };
  },
});
tools.push({
  name: "promote_case",
  description: "Promote a draft case into the gallery (only if validation passes).",
  inputSchema: { type: "object", properties: { key: { type: "string" } }, required: ["key"] },
  async run({ key }) {
    const ref = findCase(key);
    if (!ref) return { ok: false, summary: `case "${key}" not found` };
    const v = validateCase(ref);
    if (v.errors > 0) return { ok: false, summary: `cannot promote — ${v.errors} check error(s); call validate_case for details` };
    promoteCase(key);
    return { ok: true, summary: `promoted "${key}" to the gallery` };
  },
});
tools.push({
  name: "delete_draft",
  description: "Delete a draft case.",
  inputSchema: { type: "object", properties: { key: { type: "string" } }, required: ["key"] },
  async run({ key }) {
    deleteDraft(key);
    return { ok: true, summary: `deleted draft "${key}"` };
  },
});

// ── generation: agent-as-generator only. MCP hands over the prompt and stores
//    the result; the connected agent does the rendering. The server never calls a model.
function cellFor(arm: string): string {
  return arm === "no-design-md" ? "no-design-md" : `${arm}+prompt`;
}
tools.push({
  name: "get_render_prompt",
  description: "Get the exact generation prompt for a case × arm (brief + the arm's DESIGN.md + the neutral instruction). The agent renders this itself, then calls submit_render — no paid API.",
  inputSchema: {
    type: "object",
    properties: { case: { type: "string" }, arm: { type: "string", description: "no-design-md | tokens-only | description | object | constraint | metaphor | full-spec" } },
    required: ["case", "arm"],
  },
  async run({ case: caseKey, arm }) {
    const ref = findCase(caseKey);
    const dc = ref && loadCaseRef(ref);
    if (!dc) return { ok: false, summary: `case "${caseKey}" not found` };
    const armFile = arm === "no-design-md" ? null : dc.armFiles.get(arm);
    if (arm !== "no-design-md" && !armFile) return { ok: false, summary: `arm "${arm}" not found in case "${caseKey}"` };
    const designMd = armFile ? readFileSync(armFile, "utf8") : "";
    const directionBlock = designMd ? `\n\n${DIRECTION_PREAMBLE}\n\n${designMd}` : "";
    const prompt = `${GENERATION_INSTRUCTION}\n\n## Brief\n\n${dc.brief}${directionBlock}`;
    return { ok: true, summary: `prompt for ${caseKey}/${arm} (${prompt.length} chars) — render it, then submit_render`, data: { prompt } };
  },
});
tools.push({
  name: "submit_render",
  description: "Store an HTML rendering you generated as a measurable sample, under a provider run (e.g. provider='claude-sub'). No API call — this is the agent-as-generator path. Run measure(run) + snapshot() after.",
  inputSchema: {
    type: "object",
    properties: {
      provider: { type: "string", description: "provider/run id, e.g. claude-sub" },
      case: { type: "string" },
      arm: { type: "string" },
      html: { type: "string", description: "the full standalone HTML document" },
      sampleIndex: { type: "number", default: 0 },
    },
    required: ["provider", "case", "arm", "html"],
  },
  async run({ provider, case: caseKey, arm, html, sampleIndex }) {
    const run = `${provider}`;
    const runDir = join(RUNS, run);
    const cases = loadCases([caseKey]);
    if (cases.length === 0) return { ok: false, summary: `case "${caseKey}" not found / not promoted` };
    // Initialize the run (config + eval snapshot) once, mirroring generate.ts.
    mkdirSync(runDir, { recursive: true });
    const evalDir = join(runDir, "eval");
    if (!existsSync(join(evalDir, caseKey))) snapshotEval(cases, evalDir);
    const configPath = join(runDir, "config.json");
    const prior = existsSync(configPath) ? JSON.parse(readFileSync(configPath, "utf8")) : null;
    const allCaseKeys = [...new Set([...(prior?.cases ?? []), caseKey])];
    const allCases = loadCases(allCaseKeys);
    const { evalHash, caseHashes } = evalHashOf(allCases);
    writeFileSync(
      configPath,
      JSON.stringify(
        {
          cases: allCaseKeys, samples: 1, controlSamples: 1, arms: "all", channels: ["prompt"],
          experiment: "method-grounding", metric: "escape-from-center", tool: "agent", model: provider,
          evalHash, caseHashes, startedAt: prior?.startedAt ?? new Date().toISOString(),
        },
        null,
        2,
      ),
    );
    const cellDir = join(runDir, caseKey, cellFor(arm));
    mkdirSync(cellDir, { recursive: true });
    const n = Number.isFinite(sampleIndex) ? Number(sampleIndex) : 0;
    writeFileSync(join(cellDir, `${n}.html`), String(html));
    return { ok: true, summary: `stored ${caseKey}/${cellFor(arm)} sample ${n} under run "${run}" — run measure("${run}") then snapshot()` };
  },
});

// ── measure / publish — purely mechanical (no LLM). All LLM work is the agent's:
//    it renders get_render_prompt and stores the result via submit_render. These
//    shell the deterministic CLIs (scoring math, file copy) — never a model call.
function sh(cmd: string, args: string[]): Promise<{ ok: boolean; out: string }> {
  return new Promise((res) => {
    const p = spawn(cmd, args, { cwd: process.cwd() });
    let out = "";
    p.stdout.on("data", (d) => (out += d));
    p.stderr.on("data", (d) => (out += d));
    p.on("close", (code) => res({ ok: code === 0, out }));
  });
}
tools.push({
  name: "measure",
  description: "Score a run (palette/type fidelity, prohibitions, distance from the default look). Writes report.json.",
  inputSchema: { type: "object", properties: { run: { type: "string" } }, required: ["run"] },
  async run({ run }) {
    const r = await sh("bun", ["src/measure.ts", join("runs", run)]);
    return { ok: r.ok, summary: r.ok ? `measured run "${run}"` : "measure failed", data: { log: r.out.slice(-2000) } };
  },
});
tools.push({
  name: "snapshot",
  description: "Refresh the viewer's committed inputs (app/data + public/samples) so the matrix shows new results.",
  inputSchema: { type: "object", properties: {}, required: [] },
  async run() {
    const a = await sh("bun", ["app/scripts/copy-samples.ts"]);
    const b = await sh("bun", ["app/scripts/snapshot.ts"]);
    return { ok: a.ok && b.ok, summary: a.ok && b.ok ? "snapshot refreshed (app/data + public/samples)" : "snapshot had errors", data: { samples: a.out.slice(-300), data: b.out.slice(-300) } };
  },
});

// ── server ───────────────────────────────────────────────────────────────────
const server = new Server({ name: "design-bench", version: "0.1.0" }, { capabilities: { tools: {} } });
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: tools.map((t) => ({ name: t.name, description: t.description, inputSchema: t.inputSchema })),
}));
server.setRequestHandler(CallToolRequestSchema, async (req) => {
  const tool = tools.find((t) => t.name === req.params.name);
  if (!tool) return { content: [{ type: "text", text: `unknown tool: ${req.params.name}` }], isError: true };
  try {
    const r = await tool.run((req.params.arguments ?? {}) as Record<string, any>);
    const text = r.summary + (r.data !== undefined ? `\n\n${JSON.stringify(r.data, null, 2)}` : "");
    return { content: [{ type: "text", text }], isError: !r.ok };
  } catch (e) {
    return { content: [{ type: "text", text: `error: ${e instanceof Error ? e.message : String(e)}` }], isError: true };
  }
});
await server.connect(new StdioServerTransport());
