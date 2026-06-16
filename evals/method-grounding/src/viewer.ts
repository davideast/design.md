/**
 * Matrix viewer: a server-rendered Hono app over the runs/ root. Every page is
 * a URL — runs index, per-run matrix, per-sample page, cross-run compare — and
 * all view state (case, channel, size, blind) lives in query params. The only
 * client JS is the compare tray and keyboard navigation.
 *
 * Routes:
 *   GET /                                      runs index
 *   GET /run/:id?case=&channel=&size=&blind=&reveal=
 *   GET /run/:id/sample/:case/:cell/:idx       one sample, full size
 *   GET /compare?items=<run/case/cell/idx>,…   side-by-side panes (cross-run OK)
 *   GET /api/runs, /api/run/:id                JSON (for scripting)
 *   GET /files/<run>/…                         raw artifacts
 *
 * Usage:
 *   bun src/viewer.ts [runs|runs/<run-id>] [--port 4173]
 */
import { Hono } from "hono";
import { readFileSync, existsSync, statSync } from "node:fs";
import { join, resolve, isAbsolute, extname, dirname, basename } from "node:path";
import { fileURLToPath } from "node:url";
import { ROOT, loadCases, caseHashOf } from "./cases.ts";
import { startJob, cancelJob, activeJob, jobFor } from "./viewer/jobs.ts";
import { agentConfig, startPropose, startDraft, DRAFTABLE_ARMS } from "./viewer/agent.ts";
import { renderMarkdown } from "./viewer/markdown.ts";
import { submitTurn, transcript, editEngine, providerStatus, resetEditSession, type SessionKind } from "./agent/sessions.ts";
import { createConcept, findConcept, listConcepts, conceptArtifacts, markCommitted } from "./agent/concepts.ts";
import {
  newRunPage,
  settingsPage,
  casesPage,
  caseDetailPage,
  newCasePage,
  conceptPage,
  ARM_OPTIONS,
  MODEL_OPTIONS,
  type CaseListItem,
} from "./viewer/views.ts";
import { resolveKey, writeStoredKey, clearStoredKey, verifyKey } from "./viewer/settings.ts";
import {
  listAllCases,
  findCase,
  loadCaseRef,
  validateCase,
  scaffoldCase,
  promoteCase,
  deleteDraft,

} from "./viewer/authoring.ts";
import { renderDesignDoc } from "./viewer/markdown.ts";
import {
  buildIndex,
  buildMatrix,
  runIds,
  parseViewState,
  armDocFor,
  writeJudgment,
  judgmentKey,
  VERDICTS,
  type Verdict,
} from "./viewer/data.ts";
import { indexPage, runPage, samplePage, cellPage, comparePage, type CompareItem } from "./viewer/views.ts";

const SRC = dirname(fileURLToPath(import.meta.url));

function parseArgs() {
  const args = process.argv.slice(2);
  const portIdx = args.indexOf("--port");
  const pathArg = args.find((a, i) => !a.startsWith("--") && i !== portIdx + 1);
  let target = pathArg ? (isAbsolute(pathArg) ? pathArg : join(ROOT, pathArg)) : join(ROOT, "runs");
  let initialRun: string | null = null;
  // Back-compat: pointing at a single run dir serves its parent, preselected.
  if (existsSync(join(target, "config.json"))) {
    initialRun = basename(target);
    target = dirname(target);
  }
  return { root: target, initialRun, port: portIdx >= 0 ? Number(args[portIdx + 1]) : 4747 };
}

const { root, initialRun, port } = parseArgs();
if (!existsSync(root)) {
  console.error(`runs directory not found: ${root} — generate a run first (or: bun src/demo.ts)`);
  process.exit(1);
}

const MIME: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".png": "image/png",
  ".json": "application/json",
  ".md": "text/plain; charset=utf-8",
  ".txt": "text/plain",
};

/** Load a run's matrix, or null when the id is unknown. */
function matrixFor(runId: string) {
  return runIds(root).includes(runId) ? buildMatrix(root, runId) : null;
}

// Redirect to the preselected run only on the very first hit, so "← runs"
// navigation isn't hijacked afterwards.
let redirectedToInitialRun = false;

const app = new Hono();

// ---------------------------------------------------------------------------
// Pages — rebuilt per request so new runs / re-measures appear on reload.
// ---------------------------------------------------------------------------

app.get("/", (c) => {
  if (initialRun && !redirectedToInitialRun && !c.req.url.includes("?")) {
    redirectedToInitialRun = true;
    return c.redirect(`/run/${encodeURIComponent(initialRun)}`);
  }
  return c.html(indexPage(root, buildIndex(root), activeJob()));
});

app.get("/run/:id", (c) => {
  const runId = c.req.param("id");
  const matrix = matrixFor(runId);
  // A freshly-started job's run dir may exist with no samples yet — still show it.
  if (!matrix && !jobFor("run", runId)) return c.html(indexPage(root, buildIndex(root)), 404);
  const m = matrix ?? buildMatrix(root, runId);
  return c.html(runPage(m, parseViewState(new URL(c.req.url), m), jobFor("run", runId)));
});

app.get("/run/:id/cell/:case/:cell", (c) => {
  const runId = c.req.param("id");
  const matrix = matrixFor(runId);
  if (!matrix) return c.html(indexPage(root, buildIndex(root)), 404);
  const caseKey = c.req.param("case");
  const cell = c.req.param("cell");
  const state = { ...parseViewState(new URL(c.req.url), matrix), caseKey };
  const exists = matrix.cases.find((x) => x.key === caseKey)?.cells.some((x) => x.cell === cell);
  return c.html(cellPage(matrix, state, caseKey, cell, armDocFor(root, runId, caseKey, cell)), exists ? 200 : 404);
});

app.get("/run/:id/sample/:case/:cell/:idx", (c) => {
  const matrix = matrixFor(c.req.param("id"));
  if (!matrix) return c.html(indexPage(root, buildIndex(root)), 404);
  const caseKey = c.req.param("case");
  const state = { ...parseViewState(new URL(c.req.url), matrix), caseKey };
  return c.html(samplePage(matrix, state, caseKey, c.req.param("cell"), c.req.param("idx")));
});

// ---------------------------------------------------------------------------
// Case library + authoring (Phase A: scaffold, validate, promote)
// ---------------------------------------------------------------------------

/** How many runs used this case, split by whether they saw its current hash. */
function runsUsing(key: string, currentHash: string | null): { current: number; stale: number } {
  let current = 0;
  let stale = 0;
  for (const id of runIds(root)) {
    try {
      const config = JSON.parse(readFileSync(join(root, id, "config.json"), "utf8"));
      const h = config?.caseHashes?.[key];
      if (!h) continue;
      if (currentHash && h === currentHash) current++;
      else stale++;
    } catch {
      // unreadable config — skip
    }
  }
  return { current, stale };
}

function caseHashSafe(ref: ReturnType<typeof findCase>): string | null {
  if (!ref) return null;
  try {
    const dc = loadCaseRef(ref);
    return dc ? caseHashOf(dc) : null;
  } catch {
    return null;
  }
}

app.get("/cases", (c) => {
  const items: CaseListItem[] = listAllCases().map((ref) => {
    const dc = loadCaseRef(ref);
    const hash = caseHashSafe(ref);
    const counts = ref.draft ? { current: 0, stale: 0 } : runsUsing(ref.key, hash);
    return {
      ref,
      title: dc?.config.title ?? "(invalid case.json)",
      hash,
      validation: validateCase(ref),
      arms: dc?.armFiles.size ?? 0,
      runsCurrent: counts.current,
      runsStale: counts.stale,
    };
  });
  return c.html(casesPage(items, listConcepts()));
});

app.get("/cases/new", (c) => c.html(newCasePage(null, providerStatus().ok)));

app.post("/cases", async (c) => {
  const body = await c.req.parseBody();
  const key = String(body.key ?? "").trim();
  const action = String(body.action ?? "empty");
  try {
    scaffoldCase({
      key,
      title: key.replace(/-/g, " "),
      deviceType: String(body.deviceType ?? "DESKTOP"),
      // The agent fills these from the brief (kickoff step 3); empty drafts
      // keep the TODO defaults for hand-editing.
      genericCenter: "",
      prohibitions: [],
      requirements: [],
      brief: String(body.brief ?? ""),
      tokensOrDesignMd: String(body.tokensOrDesignMd ?? ""),
    });
  } catch (err) {
    return c.html(newCasePage(err instanceof Error ? err.message : String(err), providerStatus().ok), 400);
  }
  if (action === "agent") {
    // Fire the kickoff turn; the detail page's island attaches to it on load.
    // On failure (provider unconfigured, slot busy) the draft still exists and
    // the island surfaces the problem — don't block creation.
    const kickoff = readFileSync(join(ROOT, "authoring", "kickoff.md"), "utf8");
    await submitTurn("case", key, kickoff);
  }
  return c.redirect(`/cases/${encodeURIComponent(key)}`, 303);
});

function renderCaseDetail(c: any, key: string, notice: { ok: boolean; message: string } | null = null, status = 200) {
  const ref = findCase(key);
  if (!ref) return c.html(newCasePage(`no case "${key}"`), 404);
  const dc = loadCaseRef(ref);
  const validation = validateCase(ref);
  const renderedArms = validation.arms.map((a) => {
    const file = dc?.armFiles.get(a.arm);
    return { arm: a.arm, doc: file ? renderDesignDoc(readFileSync(file, "utf8")) : null };
  });
  const proposalsPath = join(ref.dir, ".authoring", "proposals.md");
  const proposals = ref.draft && existsSync(proposalsPath) ? renderMarkdown(readFileSync(proposalsPath, "utf8")) : null;
  return c.html(
    caseDetailPage(
      ref,
      dc,
      validation,
      caseHashSafe(ref),
      renderedArms,
      notice,
      jobFor("authoring", key),
      proposals,
      ref.draft ? agentConfig() : null,
    ),
    status,
  );
}

// ---------------------------------------------------------------------------
// Interactive sessions (ideation on concepts, production editing on drafts).
// Turns are jobs on a resumable engine — the stream endpoint replays from any
// offset, so a refreshed tab rejoins an in-flight turn.
// ---------------------------------------------------------------------------

function sessionRoutes(base: string, kind: SessionKind, param: string, backTo: (id: string) => string) {
  app.post(`${base}/edit/messages`, async (c) => {
    const id = c.req.param(param) ?? "";
    let prompt = "";
    if (c.req.header("content-type")?.includes("application/json")) {
      prompt = String(((await c.req.json()) as any)?.prompt ?? "");
    } else {
      prompt = String((await c.req.parseBody()).prompt ?? "");
    }
    prompt = prompt.trim();
    if (!prompt) return c.json({ error: "empty prompt" }, 400);
    const result = await submitTurn(kind, id, prompt);
    return result.error ? c.json(result, 409) : c.json(result);
  });

  app.get(`${base}/edit/stream`, (c) => {
    const jobId = c.req.query("job");
    if (!jobId) return c.text("missing ?job=", 400);
    // EventSource reconnects send Last-Event-ID — resume after it natively.
    const lastEventId = c.req.header("last-event-id");
    const from = Number(c.req.query("from") ?? (lastEventId !== undefined ? Number(lastEventId) + 1 : 0)) || 0;
    const abort = new AbortController();
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        try {
          for await (const item of editEngine().subscribe(jobId, { from, signal: abort.signal })) {
            if (item.kind === "event") {
              controller.enqueue(encoder.encode(`id: ${item.seq}\ndata: ${JSON.stringify(item.value)}\n\n`));
            } else {
              controller.enqueue(encoder.encode(`event: terminal\ndata: ${JSON.stringify({ status: item.status, reason: item.reason })}\n\n`));
            }
          }
        } catch (err) {
          controller.enqueue(encoder.encode(`event: terminal\ndata: ${JSON.stringify({ status: "error", reason: String(err) })}\n\n`));
        }
        controller.close();
      },
      cancel() {
        abort.abort();
      },
    });
    return new Response(stream, {
      headers: { "content-type": "text/event-stream", "cache-control": "no-cache", connection: "keep-alive" },
    });
  });

  app.get(`${base}/edit/transcript`, (c) => {
    const id = c.req.param(param) ?? "";
    // The browser needs provider/model names only — never the key.
    const redact = <T extends { apiKey?: string }>(config: T): T => ({ ...config, apiKey: undefined });
    const t = transcript(kind, id);
    const status = providerStatus();
    const payload: Record<string, unknown> = {
      ...t,
      provider: redact(t.provider),
      providerStatus: { ...status, config: redact(status.config) },
    };
    if (kind === "concept") {
      const ref = findConcept(id);
      if (ref) {
        const artifacts = conceptArtifacts(ref);
        payload.concept = {
          brief: !!artifacts.brief,
          direction: !!artifacts.direction,
          committedTo: ref.meta.committedTo ?? null,
        };
      }
    }
    return c.json(payload);
  });

  app.post(`${base}/edit/reset`, (c) => {
    const id = c.req.param(param) ?? "";
    resetEditSession(kind, id, { clearTranscript: true });
    return c.redirect(backTo(id), 303);
  });
}

sessionRoutes("/cases/:key", "case", "key", (id) => `/cases/${encodeURIComponent(id)}`);
sessionRoutes("/concepts/:id", "concept", "id", (id) => `/concepts/${encodeURIComponent(id)}`);

// ---------------------------------------------------------------------------
// Concepts: the ideation stage. Spark in → conversation → captured brief +
// direction → commit scaffolds the draft and fires a projection turn.
// ---------------------------------------------------------------------------

app.post("/concepts", async (c) => {
  const body = await c.req.parseBody();
  const spark = String(body.spark ?? "").trim();
  if (!spark) return c.html(newCasePage("give the ideation a spark — even a fragment", providerStatus().ok), 400);
  const ref = createConcept(spark);
  // The spark is the first message; the agent answers with worlds.
  await submitTurn("concept", ref.id, spark);
  return c.redirect(`/concepts/${encodeURIComponent(ref.id)}`, 303);
});

app.get("/concepts/:id", (c) => {
  const ref = findConcept(c.req.param("id"));
  if (!ref) return c.html(indexPage(root, buildIndex(root)), 404);
  const artifacts = conceptArtifacts(ref);
  return c.html(
    conceptPage(
      ref,
      artifacts,
      artifacts.brief ? renderMarkdown(artifacts.brief) : null,
      artifacts.direction ? renderDesignDoc(artifacts.direction) : null,
    ),
  );
});

app.post("/concepts/:id/commit", async (c) => {
  const id = c.req.param("id");
  const ref = findConcept(id);
  if (!ref) return c.text("concept not found", 404);
  const body = await c.req.parseBody();
  const key = String(body.key ?? "").trim();
  const artifacts = conceptArtifacts(ref);
  const fail = (msg: string) =>
    c.html(
      conceptPage(ref, artifacts, artifacts.brief ? renderMarkdown(artifacts.brief) : null, artifacts.direction ? renderDesignDoc(artifacts.direction) : null, msg),
      400,
    );
  if (!artifacts.brief) return fail("no brief captured yet — converge on content first");
  if (!artifacts.direction) return fail("no direction captured yet — converge on the world first");
  try {
    scaffoldCase({
      key,
      title: key.replace(/-/g, " "),
      deviceType: "DESKTOP", // projection sets it from the brief
      genericCenter: "",
      prohibitions: [],
      requirements: [],
      brief: artifacts.brief,
      tokensOrDesignMd: artifacts.direction, // tokens + full-spec seed
    });
  } catch (err) {
    return fail(err instanceof Error ? err.message : String(err));
  }
  markCommitted(id, key);
  resetEditSession("concept", id);
  // Projection, not invention: refract the committed direction into the ladder.
  const projection = readFileSync(join(ROOT, "authoring", "project.md"), "utf8");
  await submitTurn("case", key, projection);
  return c.redirect(`/cases/${encodeURIComponent(key)}`, 303);
});

app.post("/cases/:key/agent/:kind", async (c) => {
  const key = c.req.param("key");
  const kind = c.req.param("kind");
  const ref = findCase(key);
  if (!ref || !ref.draft) return renderCaseDetail(c, key, { ok: false, message: "agent authoring works on drafts only" }, 400);
  const dc = loadCaseRef(ref);
  if (!dc) return renderCaseDetail(c, key, { ok: false, message: "draft is malformed" }, 400);

  const body = await c.req.parseBody({ all: true });
  let error: string | null;
  if (kind === "propose") {
    error = startPropose(ref, dc);
  } else if (kind === "draft") {
    const seeds = {
      object: String(body["seed-object"] ?? "").trim() || undefined,
      constraint: String(body["seed-constraint"] ?? "").trim() || undefined,
      metaphor: String(body["seed-metaphor"] ?? "").trim() || undefined,
    };
    const arms = (Array.isArray(body.arms) ? body.arms.map(String) : body.arms ? [String(body.arms)] : []).filter((a) =>
      DRAFTABLE_ARMS.includes(a),
    );
    error = startDraft(ref, dc, seeds, arms);
  } else {
    return c.text("unknown agent action", 404);
  }
  if (error) return renderCaseDetail(c, key, { ok: false, message: error }, 409);
  return c.redirect(`/cases/${encodeURIComponent(key)}`, 303);
});

app.get("/cases/:key", (c) => renderCaseDetail(c, c.req.param("key")));

app.post("/cases/:key/promote", (c) => {
  const key = c.req.param("key");
  try {
    promoteCase(key);
    resetEditSession("case", key);
  } catch (err) {
    return renderCaseDetail(c, key, { ok: false, message: String(err instanceof Error ? err.message : err) }, 400);
  }
  return renderCaseDetail(c, key, { ok: true, message: `promoted — "${key}" is now runnable from + new run` });
});

app.post("/cases/:key/delete-draft", (c) => {
  const key = c.req.param("key");
  try {
    deleteDraft(key);
    resetEditSession("case", key);
  } catch (err) {
    return renderCaseDetail(c, key, { ok: false, message: String(err instanceof Error ? err.message : err) }, 400);
  }
  return c.redirect("/cases", 303);
});

// ---------------------------------------------------------------------------
// Generation from the viewer: new-run form → job → live banner on the run page.
// ---------------------------------------------------------------------------

function defaultRunName(): string {
  return new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
}

function newRunPageData() {
  return loadCases().map((c) => ({ key: c.key, title: c.config.title, hash: caseHashOf(c), arms: c.armFiles.size }));
}

app.get("/new-run", (c) => {
  return c.html(newRunPage(newRunPageData(), resolveKey().status, defaultRunName()));
});

app.get("/settings", (c) => c.html(settingsPage(resolveKey().status)));

app.post("/settings", async (c) => {
  const body = await c.req.parseBody();
  const action = String(body.action ?? "save");
  const key = String(body.key ?? "").trim();
  if (action === "clear") {
    clearStoredKey();
    return c.html(settingsPage(resolveKey().status, { ok: true, message: "stored key cleared" }));
  }
  if (!key) {
    return c.html(settingsPage(resolveKey().status, { ok: false, message: "paste a key first" }), 400);
  }
  writeStoredKey(key);
  if (action === "verify") {
    const result = await verifyKey(key);
    return c.html(
      settingsPage(resolveKey().status, {
        ok: result.ok,
        message: result.ok ? `saved · ${result.message}` : `saved, but ${result.message}`,
      }),
      result.ok ? 200 : 200,
    );
  }
  return c.html(settingsPage(resolveKey().status, { ok: true, message: "key saved" }));
});

app.post("/jobs", async (c) => {
  const body = await c.req.parseBody({ all: true });
  const toList = (v: unknown): string[] => (Array.isArray(v) ? v.map(String) : v == null ? [] : [String(v)]);
  const fail = (msg: string) => c.html(newRunPage(newRunPageData(), resolveKey().status, defaultRunName(), msg), 400);

  const cases = toList(body.cases).filter((k) => loadCases([k]).length > 0);
  const arms = toList(body.arms).filter((a) => ARM_OPTIONS.includes(a));
  const channels = toList(body.channels).filter((ch) => ch === "design-system" || ch === "prompt");
  const samples = Math.max(1, Math.min(20, Number(body.samples) || 3));
  const controlSamples = Math.max(1, Math.min(40, Number(body.controlSamples) || samples * 2));
  const concurrency = Math.max(1, Math.min(8, Number(body.concurrency) || 3));
  const model = MODEL_OPTIONS.includes(String(body.model)) ? String(body.model) : MODEL_OPTIONS[0];
  const runId = String(body.run ?? "").trim() || defaultRunName();

  if (cases.length === 0) return fail("pick at least one case");
  if (arms.length === 0) return fail("pick at least one arm");
  if (channels.length === 0) return fail("pick at least one channel");
  if (!/^[A-Za-z0-9._-]+$/.test(runId)) return fail("run name must be [A-Za-z0-9._-]");

  const args = [
    "--run", runId,
    "--cases", cases.join(","),
    "--channels", channels.join(","),
    "--samples", String(samples),
    "--control-samples", String(controlSamples),
    "--concurrency", String(concurrency),
    "--model", model,
  ];
  if (arms.length < ARM_OPTIONS.length) args.push("--arms", arms.join(","));

  const error = startJob(runId, args, root);
  if (error) return fail(error);
  return c.redirect(`/run/${encodeURIComponent(runId)}`, 303);
});

app.post("/run/:id/resume", (c) => {
  const runId = c.req.param("id");
  const runDir = join(root, runId);
  const configPath = join(runDir, "config.json");
  if (!existsSync(configPath)) return c.text("run has no config to resume from", 404);
  const config = JSON.parse(readFileSync(configPath, "utf8"));
  if (config.demo) return c.text("demo runs are synthetic — nothing to resume", 400);
  const args = [
    "--run", runId,
    "--cases", (config.cases ?? []).join(","),
    "--channels", (config.channels ?? ["design-system"]).join(","),
    "--samples", String(config.samples ?? 3),
    "--control-samples", String(config.controlSamples ?? 6),
    "--concurrency", String(config.concurrency ?? 3),
    "--model", String(config.model ?? MODEL_OPTIONS[0]),
  ];
  if (Array.isArray(config.arms)) args.push("--arms", config.arms.join(","));
  const error = startJob(runId, args, root);
  if (error) return c.text(error, 409);
  return c.redirect(`/run/${encodeURIComponent(runId)}`, 303);
});

app.post("/run/:id/measure", (c) => {
  const runId = c.req.param("id");
  if (!runIds(root).includes(runId)) return c.text("run not found", 404);
  const result = Bun.spawnSync({ cmd: ["bun", "src/measure.ts", join(root, runId)], cwd: ROOT });
  if (result.exitCode !== 0) return c.text(`measure failed:\n${result.stderr.toString()}`, 500);
  return c.redirect(`/run/${encodeURIComponent(runId)}`, 303);
});

app.post("/jobs/cancel", (c) => {
  cancelJob();
  const back = c.req.header("referer");
  return c.redirect(back && back.startsWith("http") ? new URL(back).pathname : "/", 303);
});

app.post("/run/:id/judge/:case/:cell/:idx", async (c) => {
  const runId = c.req.param("id");
  const matrix = matrixFor(runId);
  if (!matrix) return c.text("run not found", 404);
  const caseKey = c.req.param("case");
  const cell = c.req.param("cell");
  const index = c.req.param("idx");
  const exists = matrix.cases
    .find((x) => x.key === caseKey)
    ?.cells.find((x) => x.cell === cell)
    ?.samples.some((s) => s.index === index);
  if (!exists) return c.text("sample not found", 404);

  const body = await c.req.parseBody();
  const verdict = String(body.verdict ?? "");
  if (!VERDICTS.includes(verdict as Verdict)) return c.text("bad verdict", 400);
  writeJudgment(root, runId, judgmentKey(caseKey, cell, index), {
    verdict: verdict as Verdict,
    note: String(body.note ?? "").slice(0, 500),
    blinded: body.blind === "1",
    at: new Date().toISOString(),
  });
  const next = String(body.next ?? "");
  return c.redirect(next.startsWith("/") ? next : `/run/${encodeURIComponent(runId)}`, 303);
});

app.get("/compare", (c) => {
  const known = runIds(root);
  const items: CompareItem[] = (c.req.query("items") ?? "")
    .split(",")
    .filter(Boolean)
    .map((item) => decodeURIComponent(item).split("/"))
    .filter((p) => p.length === 4 && known.includes(p[0]))
    .map(([run, caseKey, cell, index]) => ({ run, case: caseKey, cell, index }))
    .slice(0, 4);
  if (items.length === 0) return c.html(indexPage(root, buildIndex(root)), 404);
  const crossRun = new Set(items.map((i) => i.run)).size > 1;
  return c.html(comparePage(items, crossRun));
});

app.get("/client.js", (c) =>
  c.body(readFileSync(join(SRC, "viewer", "client.js")), 200, { "content-type": "text/javascript; charset=utf-8" }),
);

app.get("/edit-island.js", (c) =>
  c.body(readFileSync(join(SRC, "viewer", "edit-island.js")), 200, { "content-type": "text/javascript; charset=utf-8" }),
);

// ---------------------------------------------------------------------------
// JSON API, kept for scripting.
// ---------------------------------------------------------------------------

app.get("/api/runs", (c) => c.json({ root, initialRun, runs: buildIndex(root) }));

app.get("/api/run/:id", (c) => {
  const matrix = matrixFor(c.req.param("id"));
  return matrix ? c.json(matrix) : c.text("run not found", 404);
});

// ---------------------------------------------------------------------------
// Raw artifacts — root is dynamic and the traversal guard explicit, so this
// stays hand-rolled rather than using serveStatic.
// ---------------------------------------------------------------------------

app.get("/files/*", (c) => {
  const rel = decodeURIComponent(c.req.path.slice("/files/".length));
  const file = resolve(root, rel);
  if (!file.startsWith(resolve(root) + "/") || !existsSync(file) || statSync(file).isDirectory()) {
    return c.text("not found", 404);
  }
  return c.body(readFileSync(file), 200, { "content-type": MIME[extname(file)] ?? "application/octet-stream" });
});

app.notFound((c) => c.text("not found", 404));

app.onError((err, c) => {
  console.error(`[viewer] ${c.req.method} ${c.req.path}:`, err);
  return c.text(`internal error: ${err.message}`, 500);
});

// Listen on the preferred port, but fall back when it's taken (a stale viewer,
// a parallel run) rather than crashing — then print where we actually landed.
function serve() {
  for (let p = port; p < port + 20; p++) {
    try {
      const server = Bun.serve({ port: p, fetch: app.fetch });
      if (p !== port) console.warn(`port ${port} in use — listening on ${p} instead`);
      console.log(`viewer: http://localhost:${server.port}`);
      return;
    } catch (err) {
      if ((err as { code?: string })?.code !== "EADDRINUSE") throw err;
    }
  }
  // Whole range busy — let the OS pick any free port.
  const server = Bun.serve({ port: 0, fetch: app.fetch });
  console.warn(`ports ${port}–${port + 19} in use — listening on OS-assigned port`);
  console.log(`viewer: http://localhost:${server.port}`);
}

serve();

console.log(`matrix viewer over ${root} (${runIds(root).length} runs)`);
console.log(`→ http://localhost:${port}${initialRun ? `  (opens ${initialRun} first)` : ""}`);
