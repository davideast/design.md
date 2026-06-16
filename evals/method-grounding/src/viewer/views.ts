/** Server-rendered pages. All view state lives in the URL; client JS is minimal. */
import { html, raw, qs, type Html } from "./html.ts";
import {
  type RunSummary,
  type Matrix,
  type MatrixCase,
  type ViewState,
  type FlatSample,
  type ArmDoc,
  visibleCells,
  flatSamples,
  cellMetrics,
  sampleMetrics,
  caseComparison,
  fingerprintFor,
  cellPalette,
  nearestToken,
  sampleMetaFor,
  rawFilesFor,
  readJudgments,
  judgmentKey,
  cellVerdictCounts,
  ADHERENCE_THRESHOLD,
  VIEWPORT,
} from "./data.ts";
import { renderDesignDoc } from "./markdown.ts";
import type { JobInfo } from "./jobs.ts";
import type { KeyStatus } from "./settings.ts";
import type { CaseRef, CaseValidation } from "./authoring.ts";
import { KNOWN_FLAGS, DEVICE_TYPES } from "./authoring.ts";
import { DRAFTABLE_ARMS, type AgentConfig } from "./agent.ts";
import type { ConceptRef, ConceptArtifacts } from "../agent/concepts.ts";
import type { DesignCase } from "../cases.ts";

const CSS = `
  :root { --bg:#16171a; --panel:#1f2024; --line:#2e3036; --text:#e8e8e4; --dim:#9a9b9f; --accent:#e8590c; }
  * { box-sizing: border-box; }
  body { margin:0; background:var(--bg); color:var(--text); font:14px/1.45 ui-monospace, "SF Mono", Menlo, monospace; }
  a { color:inherit; text-decoration:none; }
  header { position:sticky; top:0; z-index:20; background:var(--bg); border-bottom:1px solid var(--line); padding:10px 16px; display:flex; flex-wrap:wrap; gap:8px 16px; align-items:center; }
  header .brand { font-weight:600; }
  header .brand:hover { color:var(--accent); }
  header .meta { color:var(--dim); font-size:12px; }
  .tabs { display:flex; gap:6px; flex-wrap:wrap; }
  .tab { padding:4px 10px; border:1px solid var(--line); background:var(--panel); color:var(--dim); display:inline-block; }
  .tab.active { color:var(--text); border-color:var(--accent); }
  .tab:hover { color:var(--text); }
  .ctl { display:flex; gap:5px; align-items:center; color:var(--dim); font-size:12px; }
  .ctl a { padding:3px 7px; border:1px solid var(--line); background:var(--panel); color:var(--dim); }
  .ctl a.on { border-color:var(--accent); color:var(--accent); }
  #center { padding:8px 16px; color:var(--dim); font-size:12px; border-bottom:1px solid var(--line); }
  #center.drift { color:#e0a13c; }
  #grid { display:flex; gap:14px; padding:16px; overflow-x:auto; align-items:flex-start; }
  .col { flex:0 0 auto; }
  .colhead { padding:6px 8px; border:1px solid var(--line); background:var(--panel); margin-bottom:8px; display:block; }
  .colhead .name { font-weight:600; }
  .colhead:hover .name { color:var(--accent); }
  .badges { display:flex; flex-wrap:wrap; gap:4px; margin-top:5px; }
  .badge { font-size:11px; color:var(--dim); border:1px solid var(--line); padding:1px 5px; }
  .badge b { color:var(--text); font-weight:600; }
  .badge.warn b { color:#e0a13c; }
  .badge.good b { color:#76c893; }
  .thumbs { display:flex; flex-direction:column; gap:10px; }
  .wrap { display:flex; flex-wrap:wrap; gap:10px; padding:16px; }
  .thumb { position:relative; border:1px solid var(--line); background:#fff; overflow:hidden; display:block; }
  .thumb:hover { border-color:var(--accent); }
  .thumb img { display:block; width:100%; height:100%; object-fit:cover; object-position:top; }
  .thumb iframe { position:absolute; top:0; left:0; transform-origin:0 0; pointer-events:none; border:0; background:#fff; }
  .thumb .tag { position:absolute; left:0; bottom:8px; background:rgba(0,0,0,.65); color:#fff; font-size:10px; padding:1px 5px; z-index:2; }
  .thumb .vio { position:absolute; right:0; top:0; background:rgba(0,0,0,.65); font-size:10px; padding:1px 5px; z-index:2; }
  .thumb .strip { position:absolute; left:0; right:0; bottom:0; height:8px; display:flex; z-index:1; }
  .thumb .strip i { flex:1; }
  /* index */
  #index { padding:20px 16px; max-width:1200px; }
  #index h2 { font-size:13px; color:var(--dim); font-weight:400; margin:0 0 14px; }
  table.runs { border-collapse:collapse; width:100%; }
  table.runs th { text-align:left; color:var(--dim); font-size:11px; font-weight:400; padding:6px 10px; border-bottom:1px solid var(--line); }
  table.runs td { padding:9px 10px; border-bottom:1px solid var(--line); vertical-align:top; font-size:12.5px; }
  table.runs tr:hover td { background:var(--panel); }
  .runid { font-weight:600; }
  .chip { display:inline-block; font-size:11px; border:1px solid var(--line); padding:1px 6px; margin:1px 3px 1px 0; color:var(--dim); white-space:nowrap; }
  .chip.hash { color:var(--text); }
  .casechip { display:inline-block; font-size:11px; border:1px solid var(--line); padding:2px 6px; margin:1px 4px 2px 0; color:var(--dim); }
  .casechip b { color:var(--text); font-weight:600; }
  .dim { color:var(--dim); } .ok { color:#76c893; } .warn { color:#e0a13c; } .bad { color:#e07070; } .sig { color:#76c893; }
  /* sample & compare pages */
  .pageframe { background:#fff; margin:0 16px 16px; overflow:auto; }
  .pageframe iframe { border:0; display:block; background:#fff; transform-origin:0 0; }
  .panes { display:flex; gap:12px; padding:0 16px 16px; align-items:flex-start; }
  .pane { flex:1 1 0; min-width:0; }
  .pane .panelabel { font-size:12px; color:var(--dim); padding:4px 0; }
  .pane .holder { background:#fff; overflow:auto; }
  .pane iframe { border:0; display:block; background:#fff; transform-origin:0 0; }
  #tray { position:fixed; bottom:0; left:0; right:0; background:var(--panel); border-top:1px solid var(--line); padding:8px 16px; display:none; gap:12px; align-items:center; z-index:30; font-size:12px; }
  #tray a, #tray button { font:inherit; background:var(--bg); color:var(--text); border:1px solid var(--line); padding:4px 8px; cursor:pointer; }
  /* cell inspector */
  .cellwrap { display:flex; gap:24px; padding:16px; align-items:flex-start; }
  .doc { flex:0 0 480px; max-width:480px; border:1px solid var(--line); background:var(--panel); padding:16px 20px; }
  .doc .docmeta { font-size:11px; color:var(--dim); margin-bottom:10px; display:flex; gap:10px; flex-wrap:wrap; }
  .doc h2 { font-size:13px; margin:18px 0 6px; border-bottom:1px solid var(--line); padding-bottom:4px; }
  .doc h3 { font-size:12.5px; margin:14px 0 4px; }
  .doc p, .doc ul { color:#c6c7c2; margin:8px 0; font-size:12.5px; line-height:1.65; }
  .doc ul { padding-left:18px; }
  .doc b { color:var(--text); }
  .doc code, .doc .token { color:var(--accent); font-size:12px; }
  .doc .fm { background:var(--bg); border:1px solid var(--line); padding:10px; font-size:11px; line-height:1.55; overflow-x:auto; color:var(--dim); margin:0 0 6px; }
  .swatch { display:inline-block; width:10px; height:10px; border:1px solid rgba(255,255,255,.3); margin-right:4px; }
  .cellmain { flex:1; min-width:0; }
  .cellmain .sect { font-size:11px; color:var(--dim); text-transform:uppercase; letter-spacing:.06em; margin:18px 0 6px; }
  table.metrics { border-collapse:collapse; }
  table.metrics th { text-align:left; color:var(--dim); font-size:11px; font-weight:400; padding:4px 14px 4px 0; border-bottom:1px solid var(--line); }
  table.metrics td { padding:5px 14px 5px 0; border-bottom:1px solid var(--line); font-size:12.5px; }
  table.metrics td a:hover { color:var(--accent); }
  /* sample inspector */
  .samplewrap { display:flex; gap:16px; padding:0 16px 16px; align-items:flex-start; }
  .samplewrap .pageframe { flex:1; min-width:0; margin:0; }
  .inspector { flex:0 0 380px; overflow:auto; border:1px solid var(--line); background:var(--panel); padding:12px 16px; font-size:12.5px; }
  .inspector .sect { font-size:11px; color:var(--dim); text-transform:uppercase; letter-spacing:.06em; margin:14px 0 6px; }
  .inspector .sect:first-child { margin-top:0; }
  .inspector table.metrics { width:100%; }
  .inspector .kv { color:var(--dim); }
  .inspector .kv b { color:var(--text); font-weight:600; }
  .inspector a { text-decoration:underline; color:var(--dim); }
  .inspector a:hover { color:var(--accent); }
  /* judgment capture */
  .judge input[type=text] { width:100%; font:inherit; background:var(--bg); color:var(--text); border:1px solid var(--line); padding:5px 8px; margin-bottom:6px; }
  .judge .verdicts { display:flex; gap:6px; }
  .judge button { flex:1; font:inherit; background:var(--bg); color:var(--text); border:1px solid var(--line); padding:5px 0; cursor:pointer; }
  .judge button.v-good:hover { border-color:#76c893; color:#76c893; }
  .judge button.v-mixed:hover { border-color:#e0a13c; color:#e0a13c; }
  .judge button.v-poor:hover { border-color:#e07070; color:#e07070; }
  .verdict-good { color:#76c893; } .verdict-mixed { color:#e0a13c; } .verdict-poor { color:#e07070; }
  /* new-run form & job banner */
  .formwrap { padding:20px 16px; max-width:780px; }
  .formrow { margin-bottom:16px; }
  .formrow .lab { font-size:11px; color:var(--dim); text-transform:uppercase; letter-spacing:.06em; margin-bottom:6px; }
  .formrow label.opt { display:inline-flex; gap:6px; align-items:center; margin:2px 14px 4px 0; }
  .formrow label.opt .dim { font-size:11px; }
  .formrow input[type=number], .formrow input[type=text], .formrow select { font:inherit; background:var(--panel); color:var(--text); border:1px solid var(--line); padding:5px 8px; }
  .formrow input[type=number] { width:70px; }
  button.go { background:var(--accent); color:#fff; border:none; padding:8px 20px; font:inherit; cursor:pointer; }
  button.go:hover { opacity:.9; }
  .inlineform { display:inline; }
  .inlineform button { font:inherit; background:var(--panel); color:var(--dim); border:1px solid var(--line); padding:4px 10px; cursor:pointer; }
  .inlineform button:hover { color:var(--text); }
  .jobbanner { border:1px solid #e0a13c; margin:16px; padding:10px 14px; font-size:12.5px; }
  .jobbanner.done { border-color:#76c893; }
  .jobbanner.failed { border-color:#e07070; }
  .jobbanner pre { background:var(--bg); border:1px solid var(--line); padding:8px 10px; max-height:180px; overflow:auto; font-size:11px; line-height:1.5; color:var(--dim); white-space:pre-wrap; }
  /* case library & detail */
  .formrow textarea { width:100%; min-height:120px; font:12.5px/1.5 ui-monospace, Menlo, monospace; background:var(--panel); color:var(--text); border:1px solid var(--line); padding:8px 10px; }
  details.armdoc { border:1px solid var(--line); margin-bottom:8px; }
  details.armdoc summary { cursor:pointer; padding:7px 10px; background:var(--panel); font-size:12.5px; }
  details.armdoc summary:hover { color:var(--accent); }
  details.armdoc .doc { border:none; max-width:none; flex:none; }
  .vstatus { font-size:11px; padding:1px 6px; border:1px solid var(--line); }
  /* case page: content left, agent rail right */
  .casewrap { display:flex; gap:18px; padding:16px; align-items:flex-start; }
  .casemain { flex:1; min-width:0; max-width:880px; }
  .caserail { flex:0 0 460px; position:sticky; top:54px; display:flex; flex-direction:column; gap:10px; max-height:calc(100vh - 66px); }
  @media (max-width: 1180px) {
    .casewrap { flex-direction:column-reverse; }
    .caserail { position:static; flex:none; width:100%; max-height:560px; }
  }
  /* the editing island — a real chat panel: header / scrolling turns / composer */
  #edit-island { display:flex; flex-direction:column; flex:1; min-height:420px; border:1px solid var(--line); background:var(--panel); overflow:hidden; }
  #ei-head { display:flex; align-items:center; gap:8px; padding:8px 12px; border-bottom:1px solid var(--line); font-size:11px; color:var(--dim); }
  #ei-head b { color:var(--text); font-weight:600; }
  #ei-head button { font:inherit; background:none; border:none; color:var(--dim); cursor:pointer; text-decoration:underline; padding:0; }
  #ei-head button:hover { color:var(--accent); }
  #ei-turns { flex:1; overflow-y:auto; padding:10px 12px; }
  .ei-turn { border-top:1px solid var(--line); padding:10px 0; }
  .ei-turn:first-child { border-top:none; padding-top:2px; }
  .ei-user { color: var(--accent); font-size:12.5px; white-space:pre-wrap; }
  .ei-tools { margin:6px 0 2px; display:flex; flex-wrap:wrap; gap:4px; }
  .ei-tool { font-size:10.5px; border:1px solid var(--line); padding:1px 6px; color:var(--dim); }
  .ei-tool.fail { border-color:#e07070; color:#e07070; }
  .ei-tool.pending { border-color:#e0a13c; color:#e0a13c; }
  .ei-text { font-size:12.5px; line-height:1.6; white-space:pre-wrap; color:var(--text); margin-top:6px; }
  .ei-text.streaming::after { content:"▌"; color:var(--accent); animation: eiblink 1s step-end infinite; }
  @keyframes eiblink { 50% { opacity: 0; } }
  .ei-thinking { color:var(--dim); font-size:12px; margin-top:6px; }
  .ei-thinking::after { content:"…"; animation: eiblink 1.2s step-end infinite; }
  .ei-error { color:#e07070; font-size:12px; margin-top:6px; }
  .ei-empty { color:var(--dim); font-size:12px; line-height:1.7; }
  .ei-diff summary { cursor:pointer; font-size:11px; color:var(--dim); padding:2px 0; }
  .ei-diff summary:hover { color:var(--accent); }
  .ei-diff pre { background:var(--bg); border:1px solid var(--line); padding:8px 10px; font-size:11px; line-height:1.5; overflow-x:auto; margin:4px 0; }
  .ei-diff .da { color:#76c893; } .ei-diff .dd { color:#e07070; } .ei-diff .dh { color:var(--dim); }
  #ei-status { border-top:1px solid var(--line); padding:8px 12px; font-size:11.5px; color:var(--text); display:flex; align-items:center; gap:8px; flex-wrap:wrap; background:var(--panel); }
  #ei-status .ok { color:#76c893; }
  #ei-status .dim { color:var(--dim); }
  #ei-status a { color:var(--accent); }
  .ei-commit { display:inline-flex; gap:6px; align-items:center; margin:0; }
  .ei-commit input { font:11.5px ui-monospace, Menlo, monospace; background:var(--bg); color:var(--text); border:1px solid var(--line); padding:3px 8px; }
  .ei-commit button { font-size:11px; padding:3px 10px; }
  #ei-composer { border-top:1px solid var(--line); padding:10px 12px; background:var(--panel); }
  #ei-quick { display:flex; flex-wrap:wrap; gap:5px; margin-bottom:8px; }
  #ei-quick button { font-size:11px; border:1px solid var(--line); background:var(--bg); color:var(--dim); padding:3px 9px; cursor:pointer; }
  #ei-quick button:hover:not(:disabled) { color:var(--accent); border-color:var(--accent); }
  #ei-quick button:disabled { opacity:.4; cursor:default; }
  #ei-form textarea { width:100%; min-height:48px; max-height:140px; font:12.5px/1.5 ui-monospace, Menlo, monospace; background:var(--bg); color:var(--text); border:1px solid var(--line); padding:8px 10px; margin:0 0 8px; resize:vertical; }
  #ei-form textarea:disabled { opacity:.5; }
  #ei-bar { display:flex; gap:10px; align-items:center; }
  #ei-bar .working { color:#e0a13c; font-size:11.5px; }
`;

export function page(title: string, header: Html, body: Html, opts: { clientJs?: boolean; inline?: string; refresh?: number } = {}): string {
  return (
    "<!doctype html>" +
    html`<html lang="en"><head><meta charset="utf-8" /><title>${title}</title>${opts.refresh ? raw(`<meta http-equiv="refresh" content="${opts.refresh}">`) : ""}<style>${raw(CSS)}</style></head>
<body>
<header><a class="brand" href="/">method-grounding</a>${header}</header>
${body}
<div id="tray"></div>
${opts.clientJs !== false ? raw(`<script src="/client.js"></script>`) : ""}
${opts.inline ? raw(`<script>${opts.inline}</script>`) : ""}
</body></html>`.text
  );
}

function hashColor(h?: string): string {
  if (!h) return "var(--line)";
  const hue = parseInt(h.slice(0, 4), 16) % 360;
  return `hsl(${hue} 55% 55%)`;
}

const fmt = (v: number | null | undefined, d = 2) => (v == null ? "—" : v.toFixed(d));
const pct = (v: number | null | undefined) => (v == null ? "—" : Math.round(v * 100) + "%");

// ---------------------------------------------------------------------------
// Runs index
// ---------------------------------------------------------------------------

export function indexPage(root: string, runs: RunSummary[], job: JobInfo | null = null): string {
  const header = html`<span class="meta">${runs.length} runs · ${root}</span>
    <div class="tabs"><a class="tab" href="/new-run">+ new run</a><a class="tab" href="/cases">cases</a><a class="tab" href="/settings">settings</a></div>
    ${job ? html`<a class="tab active" href="${job.kind === "run" ? `/run/${job.id}` : `/cases/${job.id}`}">⏳ ${job.phase} ${job.id}</a>` : ""}`;
  if (runs.length === 0) {
    return page(
      "runs · method-grounding",
      header,
      html`<div id="index"><h2>no runs yet — <a href="/new-run" style="text-decoration:underline">start one</a>, or try the UI on fixtures: <code>bun src/demo.ts</code></h2></div>`,
    );
  }
  const rows = runs.map((r) => {
    const date = r.startedAt && r.startedAt !== "demo" ? r.startedAt.slice(0, 16).replace("T", " ") : r.demo ? "synthetic" : "—";
    const cases = r.cases.map((c) => {
      const head = c.headline
        ? html` <span class="dim">·</span> ${c.headline.cell} +${c.headline.excess.toFixed(2)}${c.headline.significant ? html`<span class="sig"> ✱</span>` : ""}`
        : html``;
      const fail = c.failed ? html` <span class="bad">${c.failed}✗</span>` : html``;
      return html`<a class="casechip" style="border-color:${hashColor(c.caseHash)}" href="/run/${r.id}${raw(qs({ case: c.key }))}"><b>${c.key}</b> ${c.samples}${fail}${head}</a>`;
    });
    return html`<tr>
      <td><a href="/run/${r.id}"><span class="runid">${r.id}</span></a>${r.demo ? html` <span class="chip">demo</span>` : ""}<div class="dim" style="font-size:11px">${date}${r.resumedAt?.length ? ` · resumed ×${r.resumedAt.length}` : ""}</div></td>
      <td>${r.model ?? "—"}<div style="margin-top:2px">${r.evalHash ? html`<span class="chip hash" style="border-color:${hashColor(r.evalHash)}">${r.evalHash}</span>` : html`<span class="chip">no snapshot</span>`}</div></td>
      <td>${cases}</td>
      <td>${r.totalSamples}${r.totalFailed ? html` <span class="bad">${r.totalFailed}✗</span>` : ""}<div style="font-size:11px">${r.measured ? html`<span class="ok">measured</span>` : html`<span class="warn">unmeasured</span>`}${r.judged ? html` · judged ${r.judged}` : ""}</div></td>
    </tr>`;
  });
  const body = html`<div id="index">
    <h2>runs — newest first · eval chips sharing a color saw identical definitions and are directly comparable · ✱ = significant vs description (p&lt;0.05)</h2>
    <table class="runs">
      <thead><tr><th>run</th><th>model · eval</th><th>cases · samples · headline (max excess distance)</th><th>total</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
  </div>`;
  return page("runs · method-grounding", header, body);
}

// ---------------------------------------------------------------------------
// New-run form — cases load dynamically from cases/; POST /jobs spawns
// generate.ts with the chosen flags.
// ---------------------------------------------------------------------------

export const ARM_OPTIONS = ["no-design-md", "tokens-only", "description", "object", "constraint", "metaphor", "full-spec"];
export const MODEL_OPTIONS = ["GEMINI_3_1_PRO", "GEMINI_3_FLASH"];

export function keyBadge(key: KeyStatus): Html {
  return key.present
    ? html`<a class="badge good" href="/settings">STITCH key <b>${key.source}</b></a>`
    : html`<a class="badge warn" href="/settings">STITCH key <b>missing</b> — set it in settings before generating</a>`;
}

export function newRunPage(
  cases: { key: string; title: string; hash: string; arms: number }[],
  key: KeyStatus,
  defaultRun: string,
  error: string | null = null,
): string {
  const header = html`<span class="meta">new run</span>
    <div class="tabs"><a class="tab" href="/">← runs</a></div>
    ${keyBadge(key)}`;

  const body = html`<div class="formwrap">
    ${error ? html`<div class="jobbanner failed">${error}</div>` : ""}
    <form method="post" action="/jobs">
      <div class="formrow">
        <div class="lab">cases (from cases/ · hash = current definition version)</div>
        ${cases.map(
          (c) => html`<label class="opt"><input type="checkbox" name="cases" value="${c.key}" checked />
            <b>${c.key}</b> <span class="dim">${c.title} · ${c.arms} arms · </span><span class="chip hash" style="border-color:${hashColor(c.hash)}">${c.hash}</span></label><br />`,
        )}
      </div>
      <div class="formrow">
        <div class="lab">arms</div>
        ${ARM_OPTIONS.map((a) => html`<label class="opt"><input type="checkbox" name="arms" value="${a}" checked /> ${a}</label>`)}
      </div>
      <div class="formrow">
        <div class="lab">channels</div>
        <label class="opt"><input type="checkbox" name="channels" value="design-system" checked /> design-system <span class="dim">(the product path)</span></label>
        <label class="opt"><input type="checkbox" name="channels" value="prompt" /> prompt <span class="dim">(DESIGN.md embedded in the prompt — pipeline diagnostic)</span></label>
      </div>
      <div class="formrow">
        <div class="lab">sampling · model · name</div>
        <label class="opt">samples <input type="number" name="samples" value="3" min="1" max="20" /></label>
        <label class="opt">control samples <input type="number" name="controlSamples" value="6" min="1" max="40" /></label>
        <label class="opt">concurrency <input type="number" name="concurrency" value="3" min="1" max="8" /> <span class="dim">parallel cells</span></label>
        <label class="opt">model
          <select name="model">${MODEL_OPTIONS.map((m) => html`<option value="${m}">${m}</option>`)}</select>
        </label>
        <label class="opt">run name <input type="text" name="run" value="${defaultRun}" pattern="[A-Za-z0-9._-]+" size="22" /></label>
      </div>
      <div class="formrow">
        <button class="go" type="submit">start run</button>
        <span class="dim" style="margin-left:10px">spawns generate.ts → auto-measures on completion · one job at a time · existing samples in the run are kept (resume semantics)</span>
      </div>
    </form>
  </div>`;
  return page("new run · method-grounding", header, body);
}

// ---------------------------------------------------------------------------
// Case library, detail, and authoring (Phase A: scaffold + validate + promote)
// ---------------------------------------------------------------------------

const statusChip = (s: "ok" | "warn" | "error") =>
  html`<span class="vstatus ${s === "ok" ? "ok" : s === "warn" ? "warn" : "bad"}">${s === "ok" ? "✓" : s === "warn" ? "~" : "✗"} ${s}</span>`;

export interface CaseListItem {
  ref: CaseRef;
  title: string;
  hash: string | null;
  validation: CaseValidation;
  arms: number;
  runsCurrent: number;
  runsStale: number;
}

export function casesPage(items: CaseListItem[], concepts: ConceptRef[] = []): string {
  const header = html`<span class="meta">${items.length} cases · cases/</span>
    <div class="tabs"><a class="tab" href="/">← runs</a><a class="tab" href="/cases/new">+ new case</a></div>`;
  const conceptRows = concepts
    .filter((c) => !c.meta.committedTo)
    .map(
      (c) => html`<a class="casechip" href="/concepts/${c.id}" style="border-color:#e0a13c">💡 <b>${c.meta.spark.length > 70 ? c.meta.spark.slice(0, 70) + "…" : c.meta.spark}</b> <span class="dim">· ${c.meta.createdAt.slice(0, 10)}</span></a>`,
    );
  const conceptSection = conceptRows.length
    ? html`<h2 style="margin-top:0">ideating — uncommitted concepts</h2><div style="margin-bottom:18px">${conceptRows}</div>`
    : html``;
  const rows = items.map((c) => {
    const v = c.validation;
    const status = v.errors > 0 ? statusChip("error") : v.warnings > 0 ? statusChip("warn") : statusChip("ok");
    return html`<tr>
      <td><a href="/cases/${c.ref.key}"><span class="runid">${c.ref.key}</span></a>${c.ref.draft ? html` <span class="chip warn">draft</span>` : ""}
        <div class="dim" style="font-size:11px">${c.title}</div></td>
      <td>${c.hash ? html`<span class="chip hash" style="border-color:${hashColor(c.hash)}">${c.hash}</span>` : html`<span class="chip">—</span>`}</td>
      <td>${c.arms}/6 arms · ${status}${v.errors > 0 ? html` <span class="bad">${v.errors}E</span>` : ""}${v.warnings > 0 ? html` <span class="warn">${v.warnings}W</span>` : ""}</td>
      <td>${c.runsCurrent ? html`<span class="ok">${c.runsCurrent} at this hash</span>` : html`<span class="dim">—</span>`}${c.runsStale ? html` <span class="dim">· ${c.runsStale} older</span>` : ""}</td>
    </tr>`;
  });
  const body = html`<div id="index">
    ${conceptSection}
    <h2>case library — drafts are invisible to runs until promoted · hash chips match the runs index</h2>
    <table class="runs">
      <thead><tr><th>case</th><th>definition hash</th><th>arms · validation</th><th>runs using it</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
  </div>`;
  return page("cases · method-grounding", header, body);
}

export function caseDetailPage(
  ref: CaseRef,
  designCase: DesignCase | null,
  validation: CaseValidation,
  hash: string | null,
  renderedArms: { arm: string; doc: Html | null }[],
  notice: { ok: boolean; message: string } | null = null,
  job: JobInfo | null = null,
  proposals: Html | null = null,
  agent: AgentConfig | null = null,
): string {
  const canPromote = ref.draft && validation.errors === 0;
  const header = html`<span class="meta">${ref.key}${ref.draft ? " (draft)" : ""} ${hash ? html`· <span class="chip hash" style="border-color:${hashColor(hash)}">${hash}</span>` : ""}</span>
    <div class="tabs"><a class="tab" href="/cases">← cases</a></div>
    <div class="ctl">
      ${ref.draft
        ? html`<form class="inlineform" method="post" action="/cases/${ref.key}/promote"><button ${canPromote ? "" : raw("disabled title='fix validation errors first'")}>promote to cases/</button></form>
          <form class="inlineform" method="post" action="/cases/${ref.key}/delete-draft" onsubmit="return confirm('delete this draft?')"><button style="color:#e07070">delete draft</button></form>`
        : html`<a class="tab" href="/new-run">run it</a>`}
      <span class="dim" style="font-size:11px">edit files in your editor — this page revalidates on reload</span>
    </div>`;

  const cfg = designCase?.config;
  const checksTable = html`<div class="sect">validation${validation.errors ? html` — <span class="bad">${validation.errors} error(s) block promotion</span>` : validation.warnings ? html` — <span class="warn">${validation.warnings} warning(s)</span>` : html` — <span class="ok">clean</span>`}</div>
    <table class="metrics">
      ${validation.checks.map((c) => html`<tr><td>${c.label}</td><td>${statusChip(c.status)}</td><td class="dim" style="max-width:640px">${c.detail}</td></tr>`)}
    </table>`;

  const armRows = validation.arms.map((a) => {
    const rendered = renderedArms.find((r) => r.arm === a.arm)?.doc;
    const summary = html`<b>${a.arm}</b> · ${a.exists ? html`${a.words}w${a.todo ? html` <span class="bad">TODO</span>` : ""}${a.lintErrors ? html` <span class="bad">${a.lintErrors}E</span>` : ""}${a.lintWarnings ? html` <span class="warn">${a.lintWarnings}W</span>` : ""}` : html`<span class="bad">missing</span>`}
      <span class="dim" style="font-size:11px"> · cases/${ref.draft ? `${ref.key}.draft` : ref.key}/arms/${a.arm}.DESIGN.md</span>`;
    return html`<details class="armdoc">
      <summary>${summary}</summary>
      ${a.lintMessages.length ? html`<div style="padding:6px 10px" class="dim">${a.lintMessages.map((m) => html`<div>${m}</div>`)}</div>` : ""}
      ${rendered ? html`<div class="doc">${rendered}</div>` : html`<div class="doc dim">file missing</div>`}
    </details>`;
  });

  // Batch (claude -p) drafting tools — secondary to the interactive editor,
  // folded away unless a batch job is active.
  let agentPanel: Html = html``;
  if (ref.draft && agent) {
    const jobBanner = job
      ? html`<div class="jobbanner ${job.status === "running" ? "" : job.status}">
          ${job.status === "running" ? "⏳" : job.status === "done" ? "✓" : "✗"} agent ${job.status} · ${job.phase} · started ${job.startedAt.slice(11, 19)}
          ${job.status === "running" ? html`<form class="inlineform" method="post" action="/jobs/cancel" style="margin-left:10px"><button>cancel</button></form>` : ""}
          <pre>${job.tail.slice(-2200) || "starting…"}</pre>
        </div>`
      : html``;
    const todoArms = new Set(validation.arms.filter((a) => !a.exists || a.todo).map((a) => a.arm));
    const form =
      job?.status === "running"
        ? html``
        : html`<form method="post">
            <div class="formrow">
              <div class="lab">grounding seeds — leave blank and the agent invents (or run propose first and paste the winner)</div>
              <label class="opt">object <input type="text" name="seed-object" size="42" placeholder="a 1948 race programme sold at the gate" /></label>
              <label class="opt">constraint <input type="text" name="seed-constraint" size="36" placeholder="one ink on one paper" /></label>
              <label class="opt">metaphor <input type="text" name="seed-metaphor" size="36" placeholder="the page is a lap of the oval" /></label>
            </div>
            <div class="formrow">
              <div class="lab">arms to draft (overwrites the selected files in the draft)</div>
              ${DRAFTABLE_ARMS.map((a) => html`<label class="opt"><input type="checkbox" name="arms" value="${a}" ${todoArms.has(a) ? raw("checked") : ""} /> ${a}</label>`)}
            </div>
            <div class="formrow">
              <button class="tab" formaction="/cases/${ref.key}/agent/propose">propose groundings</button>
              <button class="go" formaction="/cases/${ref.key}/agent/draft" ${agent.available ? "" : raw("disabled")}>draft arms with agent</button>
              <span class="dim" style="margin-left:8px;font-size:11px">claude -p · model <b>${agent.model}</b> · edit authoring/claude-settings.json${agent.available ? "" : " · ⚠ claude CLI not found on PATH"} · subscription-billed (ANTHROPIC_API_KEY stripped)</span>
            </div>
          </form>`;
    agentPanel = html`<details class="armdoc" ${job ? raw("open") : ""}>
      <summary><b>batch drafting tools</b> <span class="dim">· claude -p, subscription-billed · one-shot propose/draft</span></summary>
      <div style="padding:10px 14px">${jobBanner}${form}
      ${proposals ? html`<details class="armdoc" open><summary><b>proposed groundings</b> · .authoring/proposals.md</summary><div class="doc">${proposals}</div></details>` : ""}</div>
    </details>`;
  }

  // The agent rail: a chat panel with its own scroll region and composer —
  // bootstrapped from /edit/transcript, streaming live turns over SSE.
  const editIsland = ref.draft
    ? html`<aside class="caserail">
      <div id="edit-island" data-api="/cases/${encodeURIComponent(ref.key)}/edit" data-mode="produce">
        <div id="ei-head"><b>agent</b> <span id="ei-provider"></span><span style="flex:1"></span><button type="button" id="ei-reset" title="drop session history (files are untouched)">reset</button></div>
        <div id="ei-turns"><span class="ei-empty">loading…</span></div>
        <div id="ei-composer">
          <div id="ei-quick"></div>
          <form id="ei-form">
            <textarea id="ei-prompt" placeholder="Tell the agent what to change… (Enter sends · Shift+Enter newline)"></textarea>
            <div id="ei-bar">
              <button class="go" type="submit" id="ei-send">send</button>
              <span class="working hidden" id="ei-working"></span>
            </div>
          </form>
        </div>
      </div>
      ${agentPanel}
      <script src="/edit-island.js"></script>
    </aside>`
    : html``;

  const body = html`<div class="casewrap">
    <div class="casemain">
      ${notice ? html`<div class="jobbanner ${notice.ok ? "done" : "failed"}" style="margin:0 0 12px">${notice.message}</div>` : ""}
      ${checksTable}
      ${cfg
        ? html`<div class="sect">case.json</div>
          <div class="kv" style="font-size:12.5px;color:var(--dim)">
            <b style="color:var(--text)">${cfg.title}</b> · ${cfg.deviceType} · forbid [${(cfg.prohibitions ?? []).join(", ") || "—"}]${cfg.requirements?.length ? html` · require [${cfg.requirements.join(", ")}]` : ""}
            <div style="margin-top:4px">generic center: ${cfg.genericCenter}</div>
          </div>`
        : ""}
      <div class="sect">brief</div>
      <div class="dim" style="font-size:12.5px;line-height:1.6;max-width:72ch">${designCase?.brief ?? "missing"}</div>
      <div class="sect">arms</div>
      ${armRows}
    </div>
    ${editIsland}
  </div>`;
  return page(`${ref.key} · cases · method-grounding`, header, body, {
    refresh: job?.status === "running" ? 6 : undefined,
  });
}

export function conceptPage(
  ref: ConceptRef,
  artifacts: ConceptArtifacts,
  briefHtml: Html | null,
  directionHtml: Html | null,
  error: string | null = null,
): string {
  const committable = !!artifacts.brief && !!artifacts.direction;
  const header = html`<span class="meta">ideating · <b>${ref.meta.spark.length > 60 ? ref.meta.spark.slice(0, 60) + "…" : ref.meta.spark}</b></span>
    <div class="tabs"><a class="tab" href="/cases">← cases</a></div>
    ${ref.meta.committedTo ? html`<a class="tab active" href="/cases/${ref.meta.committedTo}">committed → ${ref.meta.committedTo}</a>` : ""}`;

  const body = html`<div class="casewrap">
    <div class="casemain">
      ${error ? html`<div class="jobbanner failed" style="margin:0 0 12px">${error}</div>` : ""}
      <div class="sect">captured brief ${artifacts.brief ? "" : html`<span class="dim">— nothing yet; converge on content in the chat</span>`}</div>
      ${briefHtml ? html`<div class="doc" style="max-width:none">${briefHtml}</div>` : ""}
      <div class="sect">captured direction ${artifacts.direction ? "" : html`<span class="dim">— nothing yet; the world stated fully: token front matter + prose</span>`}</div>
      ${directionHtml ? html`<div class="doc" style="max-width:none">${directionHtml}</div>` : ""}
      ${!ref.meta.committedTo
        ? html`<div class="sect">commit</div>
          <form method="post" action="/concepts/${ref.id}/commit" class="formrow">
            <label class="opt">case key <input type="text" name="key" pattern="[a-z0-9][a-z0-9-]*" placeholder="kettle-and-leaf" size="22" required /></label>
            <button class="go" type="submit" ${committable ? "" : raw("disabled")}>commit → project into arms</button>
            <div class="dim" style="font-size:11.5px;margin-top:6px">${committable
              ? "scaffolds the draft from the captured direction (tokens + full-spec) and fires a projection turn — you land on the case watching the ladder get written"
              : "needs both captures before committing — that's the point: the direction is yours to converge, not the machine's to guess"}</div>
          </form>`
        : ""}
    </div>
    <aside class="caserail">
      <div id="edit-island" data-api="/concepts/${ref.id}/edit" data-mode="ideate">
        <div id="ei-head"><b>ideation</b> <span id="ei-provider"></span><span style="flex:1"></span><button type="button" id="ei-reset" title="drop session history (captures are untouched)">reset</button></div>
        <div id="ei-turns"><span class="ei-empty">loading…</span></div>
        <div id="ei-composer">
          <div id="ei-quick"></div>
          <form id="ei-form">
            <textarea id="ei-prompt" placeholder="React, redirect, choose… (Enter sends · Shift+Enter newline)"></textarea>
            <div id="ei-bar">
              <button class="go" type="submit" id="ei-send">send</button>
              <span class="working hidden" id="ei-working"></span>
            </div>
          </form>
        </div>
      </div>
      <script src="/edit-island.js"></script>
    </aside>
  </div>`;
  return page(`ideating · method-grounding`, header, body);
}

export function newCasePage(error: string | null = null, agentReady = true): string {
  const header = html`<span class="meta">new case</span>
    <div class="tabs"><a class="tab" href="/cases">← cases</a></div>`;
  const body = html`<div class="formwrap">
    ${error ? html`<div class="jobbanner failed">${error}</div>` : ""}
    <form method="post" action="/concepts">
      <div class="formrow">
        <div class="lab">start with a spark — a fragment is enough; the ideation agent helps you find the world before any files exist</div>
        <textarea name="spark" style="min-height:64px" placeholder="a tide chart for surfers · a zine for a synth meetup · my grandmother's recipe box…"></textarea>
      </div>
      <div class="formrow">
        <button class="go" type="submit" ${agentReady ? "" : raw("disabled")}>start ideating</button>
        <span class="dim" style="margin-left:10px;font-size:11.5px">${agentReady
          ? "a conversation, not a generator — diverge on worlds, converge on a brief and direction, commit when it's yours"
          : "⚠ agent provider not configured (.agent-provider.json)"}</span>
      </div>
    </form>
    <details class="armdoc" style="margin-top:18px">
      <summary><b>expert path</b> <span class="dim">· you already know the world — create a draft directly</span></summary>
      <div style="padding:12px 14px">
    <form method="post" action="/cases">
      <div class="formrow">
        <div class="lab">identity</div>
        <label class="opt">key <input type="text" name="key" pattern="[a-z0-9][a-z0-9-]*" placeholder="recipe-card" size="20" required /></label>
        <label class="opt">device
          <select name="deviceType">${DEVICE_TYPES.map((d) => html`<option value="${d}">${d}</option>`)}</select>
        </label>
      </div>
      <div class="formrow">
        <div class="lab">brief — the content world: everything the deliverable must contain. This is your irreducible input; the agent handles the rest (tokens, groundings, arms, flags) and you steer it in the editor.</div>
        <textarea name="brief" style="min-height:160px" placeholder="Design a desktop web page for …"></textarea>
      </div>
      <div class="formrow">
        <div class="lab">optional: tokens or a custom DESIGN.md — bare YAML becomes the shared tokens (the agent keeps them); a full DESIGN.md also seeds the full-spec arm, turning this into "evaluate my design system's grounding"</div>
        <textarea name="tokensOrDesignMd" placeholder="colors:&#10;  primary: '#1A1C1E'&#10;…  — or paste a complete DESIGN.md"></textarea>
      </div>
      <div class="formrow">
        <button class="go" type="submit" name="action" value="agent" ${agentReady ? "" : raw("disabled")}>create &amp; hand to agent</button>
        <button class="go" type="submit" name="action" value="empty" style="background:var(--panel);color:var(--text);border:1px solid var(--line)">create empty draft</button>
        <span class="dim" style="margin-left:10px;font-size:11.5px">${agentReady
          ? "wholesale generation — the agent invents everything from the brief in one turn"
          : "⚠ agent provider not configured — only empty drafts available"}</span>
      </div>
    </form>
      </div>
    </details>
  </div>`;
  return page("new case · method-grounding", header, body);
}

// ---------------------------------------------------------------------------
// Settings — BYOK for the Stitch API key
// ---------------------------------------------------------------------------

export function settingsPage(key: KeyStatus, notice: { ok: boolean; message: string } | null = null): string {
  const header = html`<span class="meta">settings</span>
    <div class="tabs"><a class="tab" href="/">← runs</a></div>`;
  const body = html`<div class="formwrap">
    ${notice ? html`<div class="jobbanner ${notice.ok ? "done" : "failed"}">${notice.message}</div>` : ""}
    <div class="formrow">
      <div class="lab">stitch api key</div>
      ${key.present
        ? html`<div style="margin-bottom:10px">current: <b>${key.masked}</b> <span class="dim">· source: ${key.source}${key.source === "environment" ? " (read-only here — set a key below to override it)" : ""}</span></div>`
        : html`<div class="warn" style="margin-bottom:10px">no key configured — generation jobs will fail at the first API call</div>`}
      <form method="post" action="/settings">
        <input type="password" name="key" placeholder="paste key" size="48" autocomplete="off" />
        <button class="go" name="action" value="save" type="submit">save</button>
        <button class="go" name="action" value="verify" type="submit" style="background:var(--panel);color:var(--text);border:1px solid var(--line)">save &amp; verify</button>
        ${key.source === "settings" ? html`<button class="go" name="action" value="clear" type="submit" style="background:var(--panel);color:#e07070;border:1px solid var(--line)">clear stored key</button>` : ""}
      </form>
      <div class="dim" style="margin-top:10px;font-size:12px">
        Stored in <code>.stitch-key</code> inside the eval package — gitignored, file mode 0600, never rendered in full.
        Jobs inherit it automatically; a stored key takes precedence over the viewer's <code>STITCH_API_KEY</code> environment variable.
        "save &amp; verify" makes one <code>list_projects</code> call to confirm the key works before you spend a run on it.
      </div>
    </div>
  </div>`;
  return page("settings · method-grounding", header, body);
}

// ---------------------------------------------------------------------------
// Run (matrix) page
// ---------------------------------------------------------------------------

function runUrl(runId: string, state: ViewState, over: Partial<Record<string, string | number | null>> = {}): string {
  return `/run/${encodeURIComponent(runId)}${qs({
    case: state.caseKey,
    channel: state.channel === "all" ? null : state.channel,
    size: state.size === 260 ? null : state.size,
    blind: state.blind ? 1 : null,
    reveal: state.reveal ? 1 : null,
    ...over,
  })}`;
}

function sampleUrl(runId: string, s: FlatSample, state: ViewState): string {
  return `/run/${encodeURIComponent(runId)}/sample/${encodeURIComponent(s.case)}/${encodeURIComponent(s.cell)}/${encodeURIComponent(s.index)}${qs({
    channel: state.channel === "all" ? null : state.channel,
    blind: state.blind ? 1 : null,
    reveal: state.reveal ? 1 : null,
  })}`;
}

export function fileUrl(runId: string, caseKey: string, cell: string, name: string): string {
  return `/files/${encodeURIComponent(runId)}/${encodeURIComponent(caseKey)}/${encodeURIComponent(cell)}/${encodeURIComponent(name)}`;
}

function cellUrl(runId: string, caseKey: string, cell: string, state: ViewState): string {
  return `/run/${encodeURIComponent(runId)}/cell/${encodeURIComponent(caseKey)}/${encodeURIComponent(cell)}${qs({
    channel: state.channel === "all" ? null : state.channel,
    size: state.size === 260 ? null : state.size,
  })}`;
}

function thumb(matrix: Matrix, c: MatrixCase, s: FlatSample, state: ViewState, label: string | null): Html {
  const [vw, vh] = VIEWPORT[c.deviceType] ?? VIEWPORT.DESKTOP;
  const w = state.size;
  const h = Math.round((w * Math.min(vh, vw * 1.4)) / vw);
  const media = s.png
    ? html`<img loading="lazy" src="${fileUrl(matrix.run, s.case, s.cell, s.index + ".png")}" />`
    : html`<iframe loading="lazy" sandbox="allow-same-origin" src="${fileUrl(matrix.run, s.case, s.cell, s.index + ".html")}"
        style="width:${vw}px;height:${Math.round((h * vw) / w)}px;transform:scale(${(w / vw).toFixed(4)})"></iframe>`;
  const sm = sampleMetrics(matrix, s.case, s.cell, s.index);
  const vio =
    sm && !state.blind
      ? html`<span class="vio" style="color:${sm.violationCount === 0 ? "#76c893" : sm.violationCount >= 3 ? "#e07070" : "#e0a13c"}">v:${sm.violationCount}</span>`
      : html``;
  // Dominant extracted colors — output-descriptive, so safe to show while blinded.
  const fp = fingerprintFor(matrix.root, matrix.run, s.case, s.cell, s.index);
  const strip = fp?.colors.length
    ? html`<span class="strip">${fp.colors.slice(0, 5).map((u) => html`<i style="background:${u.css}"></i>`)}</span>`
    : html``;
  return html`<a class="thumb" style="width:${w}px;height:${h}px" href="${sampleUrl(matrix.run, s, state)}">
    ${media}${label ? html`<span class="tag">${label}</span>` : ""}${vio}${strip}
  </a>`;
}

function runHeader(matrix: Matrix, state: ViewState): Html {
  const tabs = matrix.cases.map(
    (cs) => html`<a class="tab${cs.key === state.caseKey ? " active" : ""}" href="${runUrl(matrix.run, state, { case: cs.key })}">${cs.key}</a>`,
  );
  const channels = (["all", "design-system", "prompt"] as const).map(
    (ch) => html`<a class="${state.channel === ch ? "on" : ""}" href="${runUrl(matrix.run, state, { channel: ch === "all" ? null : ch })}">${ch === "design-system" ? "ds" : ch}</a>`,
  );
  const sizes = [200, 260, 340].map(
    (sz, i) => html`<a class="${state.size === sz ? "on" : ""}" href="${runUrl(matrix.run, state, { size: sz === 260 ? null : sz })}">${["S", "M", "L"][i]}</a>`,
  );
  return html`
    <span class="meta">${matrix.run} · model: ${matrix.config?.model ?? "?"} · eval: ${matrix.config?.evalHash ?? "unrecorded"}</span>
    <div class="tabs"><a class="tab" href="/">← runs</a>${tabs}</div>
    <div class="ctl">channel ${channels}</div>
    <div class="ctl">size ${sizes}</div>
    <div class="ctl">
      <a class="${state.blind ? "on" : ""}" href="${runUrl(matrix.run, state, { blind: state.blind ? null : 1, reveal: null })}">blind mode</a>
      ${state.blind ? html`<a class="${state.reveal ? "on" : ""}" href="${runUrl(matrix.run, state, { reveal: state.reveal ? null : 1 })}">reveal</a>` : ""}
    </div>`;
}

function centerLine(c: MatrixCase | undefined): Html {
  if (!c) return html`<div id="center"></div>`;
  const drift = c.drifted
    ? ` ⚠ this case's definition has changed in the working tree since this run (run saw ${c.evalHash}) — metrics and arm docs reflect the run's snapshot`
    : "";
  return html`<div id="center" class="${c.drifted ? "drift" : ""}">${c.genericCenter ? `generic center: ${c.genericCenter}` : ""}${drift}</div>`;
}

export function runPage(matrix: Matrix, state: ViewState, job: JobInfo | null = null): string {
  const c = matrix.cases.find((x) => x.key === state.caseKey);

  // Job banner, plus run actions (measure / resume) whenever no job is RUNNING —
  // a failed job is precisely when resume is wanted.
  let banner: Html = html``;
  if (job) {
    banner = html`<div class="jobbanner ${job.status === "running" ? "" : job.status}">
      ${job.status === "running" ? "⏳" : job.status === "done" ? "✓" : "✗"} job ${job.status} · phase: ${job.phase} · started ${job.startedAt.slice(11, 19)}
      ${job.status === "running" ? html`<form class="inlineform" method="post" action="/jobs/cancel" style="margin-left:10px"><button>cancel</button></form>` : ""}
      <pre>${job.tail.slice(-2500) || "starting…"}</pre>
    </div>`;
  }
  if (job?.status !== "running" && matrix.config && !matrix.config.demo) {
    const actions: Html[] = [];
    if (!matrix.report) {
      actions.push(html`<form class="inlineform" method="post" action="/run/${matrix.run}/measure"><button>measure now</button></form>`);
    }
    actions.push(html`<form class="inlineform" method="post" action="/run/${matrix.run}/resume"><button>resume / extend generation</button></form>`);
    banner = html`${banner}<div style="padding:8px 16px;border-bottom:1px solid var(--line)">${actions}</div>`;
  }

  let body: Html;
  if (!c) {
    body = html`<div id="index"><h2>no samples in this run yet${job?.status === "running" ? " — generating" : ""}</h2></div>`;
  } else if (state.blind) {
    const items = flatSamples(matrix, c, state);
    body = html`<div class="wrap">${items.map((s) => thumb(matrix, c, s, state, state.reveal ? `${s.cell}/${s.index}` : null))}</div>`;
  } else {
    const judgments = readJudgments(matrix.root, matrix.run);
    const cols = visibleCells(c, state.channel).map((cell) => {
      const m = cellMetrics(matrix, c.key, cell.cell);
      const v = cellVerdictCounts(judgments, c.key, cell.cell);
      const humanBadge =
        v.total > 0
          ? html`<span class="badge">human <b><span class="verdict-good">${v.good}✓</span>${v.mixed ? html` <span class="verdict-mixed">${v.mixed}~</span>` : ""}${v.poor ? html` <span class="verdict-poor">${v.poor}✗</span>` : ""}</b></span>`
          : html``;
      const badges =
        m || v.total > 0
          ? html`<div class="badges">
              ${m
                ? html`<span class="badge ${m.meanViolationCount === 0 ? "good" : "warn"}">viol <b>${fmt(m.meanViolationCount, 1)}</b></span>
                  <span class="badge">excess <b>${fmt(m.excessDistanceFromControl)}</b></span>
                  <span class="badge">disp <b>${fmt(m.intraArmDispersion)}</b></span>
                  <span class="badge">palette <b>${pct(m.paletteAdherence)}</b></span>`
                : ""}
              ${humanBadge}
            </div>`
          : html``;
      return html`<div class="col" style="width:${state.size}px">
        <a class="colhead" href="${cellUrl(matrix.run, c.key, cell.cell, state)}"><span class="name">${cell.cell}</span>${badges}</a>
        <div class="thumbs">
          ${cell.samples.map((s) => thumb(matrix, c, { case: c.key, cell: cell.cell, index: s.index, png: s.png }, state, s.index))}
        </div>
      </div>`;
    });
    body = html`<div id="grid">${cols}</div>`;
  }
  return page(`${matrix.run} · method-grounding`, runHeader(matrix, state), html`${banner}${centerLine(c)}${body}`, {
    refresh: job?.status === "running" ? 6 : undefined,
  });
}

// ---------------------------------------------------------------------------
// Sample page (the lightbox, as a real URL)
// ---------------------------------------------------------------------------

export function samplePage(matrix: Matrix, state: ViewState, caseKey: string, cell: string, index: string): string {
  const c = matrix.cases.find((x) => x.key === caseKey);
  if (!c) return page("not found", html``, html`<div id="index"><h2>unknown case</h2></div>`);
  const list = flatSamples(matrix, c, { ...state, caseKey });
  const pos = list.findIndex((s) => s.cell === cell && s.index === index);
  const cur = pos >= 0 ? list[pos] : null;
  if (!cur) return page("not found", html``, html`<div id="index"><h2>unknown sample</h2></div>`);
  const prev = list[(pos - 1 + list.length) % list.length];
  const next = list[(pos + 1) % list.length];
  const blinded = state.blind && !state.reveal;
  const label = blinded ? `sample ${pos + 1}/${list.length} (blinded)` : `${caseKey} / ${cell} / ${index}`;
  const [vw, vh] = VIEWPORT[c.deviceType] ?? VIEWPORT.DESKTOP;
  const pin = `${matrix.run}/${caseKey}/${cell}/${index}`;

  const header = html`
    <span class="meta">${label}</span>
    <div class="tabs">
      <a class="tab" href="${runUrl(matrix.run, { ...state, caseKey })}">← grid</a>
      <a class="tab" id="prev" href="${sampleUrl(matrix.run, prev, { ...state, caseKey })}">←</a>
      <a class="tab" id="next" href="${sampleUrl(matrix.run, next, { ...state, caseKey })}">→</a>
    </div>
    <div class="ctl"><button class="tab" onclick="mgPin('${raw(encodeURIComponent(pin))}')">pin to compare</button></div>`;

  const sm = sampleMetrics(matrix, caseKey, cell, index);
  const metaLine = blinded
    ? html`<div id="center">judging blinded — condition-revealing data hidden; the fingerprint below describes only the output</div>`
    : html`<div id="center">${sm ? `violations ${sm.violationCount} · palette ${pct(sm.paletteAdherence)} · dist-from-control ${fmt(sm.distToControl, 3)}` : "unmeasured"} · device ${c.deviceType}</div>`;

  // ---- fingerprint inspector ----
  const fp = fingerprintFor(matrix.root, matrix.run, caseKey, cell, index);
  const palette = cellPalette(matrix.root, matrix.run, caseKey, cell);
  const sw = (css: string) => html`<span class="swatch" style="background:${css}"></span>${css}`;

  let checks: Html = html``;
  if (fp) {
    const bg = fp.backgroundLightness;
    const darkBackground = bg.length > 0 && bg.filter((l) => l < 0.5).length > bg.length / 2;
    const counts: Record<string, string | number> = {
      gradients: fp.gradients,
      shadows: fp.shadows,
      roundedCorners: fp.roundedCorners,
      boldUses: fp.boldUses,
      iconFonts: fp.iconFonts,
      extraFonts: `${fp.fontFamilies.length} families`,
      darkBackground: darkBackground ? "dark" : "light",
    };
    const fired: Record<string, boolean> = {
      gradients: fp.gradients > 0,
      shadows: fp.shadows > 0,
      roundedCorners: fp.roundedCorners > 0,
      boldUses: fp.boldUses > 0,
      iconFonts: fp.iconFonts > 0,
      extraFonts: fp.fontFamilies.length > 2,
      darkBackground,
    };
    const rows = [
      ...c.prohibitions.map((flag) => ({ name: `forbid ${flag}`, count: counts[flag], bad: fired[flag] })),
      ...c.requirements.map((flag) => ({ name: `require ${flag}`, count: counts[flag], bad: !fired[flag] })),
    ];
    if (rows.length > 0) {
      checks = html`<div class="sect">checks (evidence counts)</div>
        <table class="metrics">
          ${rows.map((r) => html`<tr><td>${r.name}</td><td>${r.count}</td><td class="${r.bad ? "bad" : "ok"}">${r.bad ? "✗ violated" : "✓"}</td></tr>`)}
        </table>`;
    }
  }

  const MAX_COLOR_ROWS = 14;
  const colorTable = fp?.colors.length
    ? html`<div class="sect">extracted colors (${fp.colors.length}) · ΔE to nearest token, flagged ≥ ${ADHERENCE_THRESHOLD}</div>
      <table class="metrics">
        <tr><th>color</th><th>n</th><th>nearest token</th><th>ΔE</th></tr>
        ${fp.colors.slice(0, MAX_COLOR_ROWS).map((u) => {
          const near = palette ? nearestToken(u.lab, palette) : null;
          const off = near ? near.dist >= ADHERENCE_THRESHOLD : false;
          return html`<tr>
            <td>${sw(u.css)}</td><td>${u.count}</td>
            <td>${near ? sw(near.css) : html`<span class="dim">no palette</span>`}</td>
            <td class="${near ? (off ? "bad" : "ok") : "dim"}">${near ? near.dist.toFixed(3) : "—"}</td>
          </tr>`;
        })}
      </table>
      ${fp.colors.length > MAX_COLOR_ROWS ? html`<div class="kv">+${fp.colors.length - MAX_COLOR_ROWS} more</div>` : ""}`
    : html``;

  const fontList = fp?.fontFamilies.length
    ? html`<div class="sect">fonts</div>
      <div>${fp.fontFamilies.map((f) => {
        const specified = palette?.fonts.includes(f);
        return html`<span class="kv" style="margin-right:10px">${specified ? html`<b>${f}</b> ✓` : f}</span>`;
      })}</div>`
    : html``;

  // Generation metadata and raw links reveal the condition — hidden while blinded.
  let provenance: Html = html``;
  if (!blinded) {
    const meta = sampleMetaFor(matrix.root, matrix.run, caseKey, cell, index);
    const rawFiles = rawFilesFor(matrix.root, matrix.run, caseKey, cell);
    provenance = html`<div class="sect">generation</div>
      ${meta
        ? html`<div class="kv">model <b>${meta.model ?? "?"}</b> · channel <b>${meta.channel ?? "?"}</b>${meta.elapsedMs ? html` · <b>${Math.round(meta.elapsedMs / 1000)}s</b>` : ""}</div>
          ${meta.screenId ? html`<div class="kv">screen <b>${meta.screenId}</b></div>` : ""}
          ${meta.designSystem ? html`<div class="kv">design system <b>${meta.designSystem}</b></div>` : ""}`
        : html`<div class="kv dim">no generation metadata (${matrix.config?.demo ? "synthetic fixture" : "missing .json"})</div>`}
      <div class="kv" style="margin-top:6px">
        <a href="${fileUrl(matrix.run, caseKey, cell, index + ".html")}">html</a>
        ${cur.png ? html` · <a href="${fileUrl(matrix.run, caseKey, cell, index + ".png")}">screenshot</a>` : ""}
        ${meta ? html` · <a href="${fileUrl(matrix.run, caseKey, cell, index + ".json")}">meta</a>` : ""}
      </div>
      ${rawFiles.length
        ? html`<div class="sect">raw tool responses</div>
          <div>${rawFiles.map((f) => html`<div><a href="${fileUrl(matrix.run, caseKey, cell, "raw/" + f)}">${f}</a></div>`)}</div>`
        : ""}`;
  }

  // ---- judgment capture ----
  // Verdicts given while blinded auto-advance to the next sample, so a blind
  // sweep is: look → verdict → next. Existing judgments are the judge's own
  // prior output, so showing them never reveals the condition.
  const existing = readJudgments(matrix.root, matrix.run)[judgmentKey(caseKey, cell, index)];
  const selfUrl = sampleUrl(matrix.run, cur, { ...state, caseKey });
  const judgeAction = `/run/${encodeURIComponent(matrix.run)}/judge/${encodeURIComponent(caseKey)}/${encodeURIComponent(cell)}/${encodeURIComponent(index)}`;
  const judgePanel = html`<div class="sect">judgment</div>
    ${existing
      ? html`<div class="kv" style="margin-bottom:6px">
          <b class="verdict-${existing.verdict}">${existing.verdict}</b>${existing.note ? html` — ${existing.note}` : ""}
          <span class="dim"> (${existing.blinded ? "blinded" : "unblinded"} · ${existing.at.slice(0, 16).replace("T", " ")})</span>
        </div>`
      : ""}
    <form class="judge" method="post" action="${judgeAction}">
      <input type="hidden" name="blind" value="${blinded ? "1" : "0"}" />
      <input type="hidden" name="next" value="${blinded ? sampleUrl(matrix.run, next, { ...state, caseKey }) : selfUrl}" />
      <input type="text" name="note" placeholder="note (optional)" maxlength="500" />
      <div class="verdicts">
        <button class="v-good" name="verdict" value="good">✓ good</button>
        <button class="v-mixed" name="verdict" value="mixed">~ mixed</button>
        <button class="v-poor" name="verdict" value="poor">✗ poor</button>
      </div>
    </form>`;

  const body = html`${metaLine}
    <div class="samplewrap">
      <div class="pageframe" style="height:calc(100vh - 120px)">
        <iframe sandbox="allow-same-origin" src="${fileUrl(matrix.run, caseKey, cell, index + ".html")}"
          style="width:${vw}px;height:${Math.max(vh, 1600)}px"></iframe>
      </div>
      <div class="inspector" style="height:calc(100vh - 120px)">
        ${judgePanel}${checks}${colorTable}${fontList}${provenance}
      </div>
    </div>`;
  const inline = `document.addEventListener("keydown",(e)=>{if(e.key==="ArrowLeft")document.getElementById("prev").click();if(e.key==="ArrowRight")document.getElementById("next").click();if(e.key==="Escape")location.href=${JSON.stringify(runUrl(matrix.run, { ...state, caseKey }))}});`;
  return page(`${label} · method-grounding`, header, body, { inline });
}

// ---------------------------------------------------------------------------
// Cell inspector — the arm document that produced a cell, rendered beside its
// outputs and metrics. The middle layer between grid and sample.
// ---------------------------------------------------------------------------

function pStr(p: number | null | undefined): Html {
  if (p == null) return html`—`;
  return p < 0.05 ? html`<b class="sig">${p.toFixed(3)}</b>` : html`${p.toFixed(3)}`;
}

export function cellPage(matrix: Matrix, state: ViewState, caseKey: string, cellName: string, doc: ArmDoc | null): string {
  const c = matrix.cases.find((x) => x.key === caseKey);
  const cell = c?.cells.find((x) => x.cell === cellName);
  if (!c || !cell) return page("not found", html``, html`<div id="index"><h2>unknown cell</h2></div>`);

  const m = cellMetrics(matrix, caseKey, cellName);
  const cmp = caseComparison(matrix, caseKey, cellName);
  const isControl = cellName === "no-design-md";
  const channel = cellName.includes("+prompt") ? "prompt-embedded" : isControl ? "—" : "design-system";

  const header = html`
    <span class="meta">${matrix.run} / ${caseKey} / <b>${cellName}</b></span>
    <div class="tabs"><a class="tab" href="${runUrl(matrix.run, { ...state, caseKey })}">← grid</a></div>
    ${m
      ? html`<div class="badges">
          <span class="badge ${m.meanViolationCount === 0 ? "good" : "warn"}">viol <b>${fmt(m.meanViolationCount, 1)}</b></span>
          <span class="badge">excess <b>${fmt(m.excessDistanceFromControl)}</b></span>
          <span class="badge">disp <b>${fmt(m.intraArmDispersion)}</b></span>
          <span class="badge">palette <b>${pct(m.paletteAdherence)}</b></span>
          <span class="badge">fonts <b>${pct(m.fontMatchRate)}</b></span>
        </div>`
      : html`<span class="meta warn">unmeasured — run measure.ts</span>`}`;

  // Left panel: the document this cell was generated from.
  let docPanel: Html;
  if (isControl) {
    docPanel = html`<div class="doc"><div class="docmeta">control arm</div>
      <p>No DESIGN.md — this cell renders the case brief in the model's default register. It defines the generic center every other cell is measured against.</p>
      ${c.genericCenter ? html`<p class="dim">${c.genericCenter}</p>` : ""}</div>`;
  } else if (!doc) {
    docPanel = html`<div class="doc"><div class="docmeta warn">arm document not found</div></div>`;
  } else {
    const rawLink =
      doc.source === "snapshot"
        ? `/files/${encodeURIComponent(matrix.run)}/eval/${encodeURIComponent(caseKey)}/arms/${encodeURIComponent(cellName.split("+")[0])}.DESIGN.md`
        : null;
    docPanel = html`<div class="doc">
      <div class="docmeta">
        <span>${doc.source === "snapshot" ? "from run snapshot" : "⚠ working tree (run predates snapshots — may have drifted)"}</span>
        <span>channel: ${channel}</span>
        ${rawLink ? html`<a href="${rawLink}" style="text-decoration:underline">raw</a>` : ""}
      </div>
      ${renderDesignDoc(doc.content)}
    </div>`;
  }

  // Right column: outputs, per-sample metrics, violation breakdown, comparison.
  const thumbState = { ...state, caseKey, size: 220 };
  const thumbs = html`<div class="wrap" style="padding:0">
    ${cell.samples.map((s) => thumb(matrix, c, { case: caseKey, cell: cellName, index: s.index, png: s.png }, thumbState, s.index))}
  </div>`;

  const judgments = readJudgments(matrix.root, matrix.run);
  const verdictOf = (index: string) => judgments[judgmentKey(caseKey, cellName, index)];
  const sampleTable = m?.sampleSummaries?.length
    ? html`<div class="sect">per sample</div>
      <table class="metrics">
        <tr><th>sample</th><th>violations</th><th>palette</th><th>dist from control</th><th>human</th></tr>
        ${m.sampleSummaries.map((s: any) => {
          const j = verdictOf(s.index);
          return html`<tr>
            <td><a href="${sampleUrl(matrix.run, { case: caseKey, cell: cellName, index: s.index, png: false }, { ...state, caseKey })}">${s.index}</a></td>
            <td>${s.violationCount}</td><td>${pct(s.paletteAdherence)}</td><td>${fmt(s.distToControl, 3)}</td>
            <td>${j ? html`<span class="verdict-${j.verdict}">${j.verdict}</span>${j.blinded ? html`<span class="dim"> (blind)</span>` : ""}${j.note ? html` <span class="dim">— ${j.note.slice(0, 60)}</span>` : ""}` : html`<span class="dim">—</span>`}</td>
          </tr>`;
        })}
      </table>`
    : html``;

  const violationTable = m?.violationRates
    ? html`<div class="sect">inherited prohibitions & requirements (stated nowhere except full-spec)</div>
      <table class="metrics">
        <tr><th>check</th><th>violation rate</th></tr>
        ${Object.entries(m.violationRates as Record<string, number>).map(
          ([flag, rate]) => html`<tr><td>${flag}</td><td class="${rate === 0 ? "ok" : rate >= 0.5 ? "bad" : "warn"}">${pct(rate)}</td></tr>`,
        )}
      </table>`
    : html``;

  const comparisonTable = cmp
    ? html`<div class="sect">vs ${cmp.baseline} (permutation tests; green = p&lt;0.05)</div>
      <table class="metrics">
        <tr><th>metric</th><th>Δ</th><th>p</th></tr>
        <tr><td>distance from control</td><td>${fmt(cmp.deltaDistFromControl, 3)}</td><td>${pStr(cmp.pDistFromControl)}</td></tr>
        <tr><td>violations</td><td>${fmt(cmp.deltaViolations, 2)}</td><td>${pStr(cmp.pViolations)}</td></tr>
        <tr><td>dispersion</td><td>${fmt(cmp.deltaDispersion, 3)}</td><td>${pStr(cmp.pDispersion)}</td></tr>
      </table>`
    : html``;

  const body = html`${centerLine(c)}
    <div class="cellwrap">
      ${docPanel}
      <div class="cellmain">
        <div class="sect">outputs (${cell.samples.length})</div>
        ${thumbs}
        ${sampleTable}
        ${violationTable}
        ${comparisonTable}
      </div>
    </div>`;
  return page(`${cellName} · ${caseKey} · ${matrix.run}`, header, body);
}

// ---------------------------------------------------------------------------
// Compare page — items are fully-qualified run/case/cell/index slices, so
// cross-run comparison works by construction.
// ---------------------------------------------------------------------------

export interface CompareItem {
  run: string;
  case: string;
  cell: string;
  index: string;
}

export function comparePage(items: CompareItem[], crossRun: boolean): string {
  const header = html`<span class="meta">compare · ${items.length} panes${crossRun ? " · cross-run" : ""}</span>
    <div class="tabs"><a class="tab" href="/">← runs</a></div>
    <div class="ctl"><button class="tab" onclick="mgClear()">clear pinned</button></div>`;
  const vw = 1280;
  const panes = items.map((it) => {
    return html`<div class="pane">
      <div class="panelabel">${crossRun ? `${it.run} · ` : ""}${it.case} / ${it.cell} / ${it.index}</div>
      <div class="holder" style="height:calc(100vh - 130px)">
        <iframe sandbox="allow-same-origin" src="${fileUrl(it.run, it.case, it.cell, it.index + ".html")}"
          style="width:${vw}px;height:2400px" data-fit="${vw}"></iframe>
      </div>
    </div>`;
  });
  const body = html`<div id="center">panes scale to fit — labels carry the run when panes come from different runs</div>
    <div class="panes">${panes}</div>`;
  // Scale each iframe to its pane's width once layout is known.
  const inline = `for(const f of document.querySelectorAll("iframe[data-fit]")){const w=f.parentElement.clientWidth;const s=w/Number(f.dataset.fit);f.style.transform="scale("+s+")";f.parentElement.style.height=(window.innerHeight-130)+"px"}`;
  return page("compare · method-grounding", header, body, { inline });
}
