// The editing island: a chat panel over the draft. Transcript bootstrap,
// live SSE turn rendering, per-turn diffs, quick actions, prompt composer.
(() => {
  const root = document.getElementById("edit-island");
  if (!root) return;
  const apiBase = root.dataset.api; // e.g. /cases/<key>/edit or /concepts/<id>/edit
  const mode = root.dataset.mode || "produce";
  const turnsEl = document.getElementById("ei-turns");
  const formEl = document.getElementById("ei-form");
  const promptEl = document.getElementById("ei-prompt");
  const sendEl = document.getElementById("ei-send");
  const providerEl = document.getElementById("ei-provider");
  const resetEl = document.getElementById("ei-reset");
  const quickEl = document.getElementById("ei-quick");
  const workingEl = document.getElementById("ei-working");

  const QUICK = {
    produce: [
      ["validate", "Run validate_case; fix any errors it reports, then summarize the state in one sentence."],
      ["draft all arms", "Draft or redraft every arm (description, object, constraint, metaphor, full-spec) honoring all invariants, then validate until clean."],
      ["propose groundings", "Propose 2–3 edged grounding candidates each for object, constraint, and metaphor, with one-line rationales and one honest risk each. Don't write any files yet."],
      ["critique", "Read every arm and critique the weakest one honestly: where does its grounding lack prohibitive force or drift into adjectives? Don't write files."],
    ],
    ideate: [
      ["3 worlds", "Give me three distinct worlds for this spark — different framings, audiences, content shapes. Two or three sentences each, then which you'd pick in one line."],
      ["name the enemy", "Name the generic center for the direction we're circling — what would a generation model produce by default? Be concrete: layout, palette, type, chrome."],
      ["directions", "Propose three grounded directions for our brief — each one cohesive world with an object face, a constraint face, and a metaphor face. One short paragraph each, with an honest risk."],
      ["capture brief", "Draft the content-complete brief for the world we've converged on — every section, real copy, zero aesthetics — and capture it with capture_brief."],
      ["capture direction", "Capture our converged direction with capture_direction: token front matter drawn from the world's materials, then the world stated fully in prose."],
    ],
  };
  const QUICK_ACTIONS = QUICK[mode] || QUICK.produce;

  let turns = [];
  let live = null; // { turn, es, startedAt }
  let workingTimer = null;

  const esc = (s) =>
    String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

  const api = (path) => `${apiBase}/${path}`;

  function diffHtml(change) {
    const lines = change.unified
      .split("\n")
      .map((l) => {
        const cls = l.startsWith("+") ? "da" : l.startsWith("-") ? "dd" : l.startsWith("@@") ? "dh" : "";
        return `<span class="${cls}">${esc(l)}</span>`;
      })
      .join("\n");
    return `<details class="ei-diff"><summary>${esc(change.file)} <span class="da">+${change.added}</span> <span class="dd">−${change.removed}</span></summary><pre>${lines}</pre></details>`;
  }

  function turnHtml(turn, isLive) {
    const tools = (turn.tools ?? [])
      .map((t) => {
        const cls = t.summary === "…" ? "pending" : t.ok ? "" : "fail";
        return `<span class="ei-tool ${cls}" title="${esc(t.summary)}">${esc(t.name)}${t.summary === "…" ? " ⏳" : t.ok ? "" : " ✗"}</span>`;
      })
      .join("");
    const diffs = (turn.changes ?? []).map(diffHtml).join("");
    const hasOutput = turn.text || (turn.tools ?? []).length;
    return `<div class="ei-turn">
      <div class="ei-user">› ${esc(turn.prompt.length > 220 ? turn.prompt.slice(0, 220) + "…" : turn.prompt)}</div>
      ${tools ? `<div class="ei-tools">${tools}</div>` : ""}
      ${turn.text ? `<div class="ei-text${isLive ? " streaming" : ""}">${esc(turn.text)}</div>` : ""}
      ${isLive && !hasOutput ? `<div class="ei-thinking">thinking</div>` : ""}
      ${turn.error ? `<div class="ei-error">✗ ${esc(turn.error)}</div>` : ""}
      ${diffs}
    </div>`;
  }

  function render() {
    const nearBottom = turnsEl.scrollHeight - turnsEl.scrollTop - turnsEl.clientHeight < 80;
    const parts = turns.map((t) => turnHtml(t, false));
    if (live) parts.push(turnHtml(live.turn, true));
    const empty =
      mode === "ideate"
        ? `<div class="ei-empty">Ideation only — no case files exist yet. Bounce ideas, react, redirect; the agent captures the brief and direction only when you agree, and committing is yours.<br><br>Captures appear on the left and as diffs here.</div>`
        : `<div class="ei-empty">The agent edits this draft through tools — every change shows up as a diff here and in your editor.<br><br>Try a quick action below, or ask for anything: a sharper grounding, a rewrite, a critique.</div>`;
    turnsEl.innerHTML = parts.join("") || empty;
    if (nearBottom || live) turnsEl.scrollTop = turnsEl.scrollHeight;
    const busy = !!live;
    sendEl.disabled = busy;
    promptEl.disabled = busy;
    for (const b of quickEl.querySelectorAll("button")) b.disabled = busy;
  }

  function setWorking(on) {
    clearInterval(workingTimer);
    if (!on) {
      workingEl.classList.add("hidden");
      workingEl.textContent = "";
      return;
    }
    workingEl.classList.remove("hidden");
    const t0 = Date.now();
    const tick = () => {
      workingEl.textContent = `working · ${Math.round((Date.now() - t0) / 1000)}s`;
    };
    tick();
    workingTimer = setInterval(tick, 1000);
  }

  // The commit affordance, in the rail where convergence happens — committing
  // is a page action, not a chat command, so the strip is where "commit" leads.
  function renderConceptStatus(concept) {
    if (!concept) return;
    let el = document.getElementById("ei-status");
    if (!el) {
      el = document.createElement("div");
      el.id = "ei-status";
      turnsEl.insertAdjacentElement("afterend", el);
    }
    const mark = (ok, label) => `<span class="${ok ? "ok" : "dim"}">${ok ? "✓" : "○"} ${label}</span>`;
    if (concept.committedTo) {
      el.innerHTML = `committed → <a href="/cases/${encodeURIComponent(concept.committedTo)}">${esc(concept.committedTo)}</a>`;
    } else if (concept.brief && concept.direction) {
      const action = apiBase.replace(/\/edit$/, "") + "/commit";
      el.innerHTML = `${mark(true, "brief")} ${mark(true, "direction")} — ready:
        <form method="post" action="${action}" class="ei-commit">
          <input name="key" pattern="[a-z0-9][a-z0-9-]*" placeholder="case-key" size="14" required />
          <button class="go" type="submit">commit</button>
        </form>`;
    } else {
      el.innerHTML = `${mark(concept.brief, "brief")} ${mark(concept.direction, "direction")} <span class="dim">— captures land on the left (reload to read them)</span>`;
    }
  }

  async function loadTranscript() {
    const res = await fetch(api("transcript"));
    const data = await res.json();
    const status = data.providerStatus;
    providerEl.textContent = status.ok ? `· ${status.config.provider}/${status.config.model}` : `· ⚠ ${status.problem}`;
    if (data.concept) renderConceptStatus(data.concept);
    turns = (data.turns ?? []).filter((t) => t.status !== "running");
    const inFlight = (data.turns ?? []).find((t) => t.status === "running");
    if (inFlight && !live) attach(inFlight.jobId, inFlight.prompt);
    render();
  }

  function attach(jobId, prompt) {
    if (live) live.es.close();
    const turn = { prompt, tools: [], text: "", changes: [] };
    const es = new EventSource(api(`stream?job=${encodeURIComponent(jobId)}`));
    live = { turn, es };
    setWorking(true);

    es.onmessage = (msg) => {
      let event;
      try {
        event = JSON.parse(msg.data);
      } catch {
        return;
      }
      switch (event.kind) {
        case "text":
          turn.text += event.chunk;
          break;
        case "tool_started":
          turn.tools.push({ name: event.name, summary: "…", ok: true });
          break;
        case "tool_finished": {
          const pending = [...turn.tools].reverse().find((t) => t.summary === "…");
          if (pending) {
            pending.summary = event.result?.summary ?? "";
            pending.ok = !!event.result?.ok;
          }
          break;
        }
        case "error":
          turn.error = event.message;
          break;
      }
      render();
    };

    const finish = () => {
      es.close();
      live = null;
      setWorking(false);
      loadTranscript(); // server transcript now carries the folded turn + diffs
    };
    es.addEventListener("terminal", finish);
    es.onerror = () => {
      if (es.readyState === EventSource.CLOSED) finish();
    };
    render();
  }

  async function send(prompt) {
    if (!prompt || live) return;
    const res = await fetch(api("messages"), {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ prompt }),
    });
    const data = await res.json();
    if (data.error) {
      turns.push({ prompt, tools: [], text: "", changes: [], error: data.error, status: "failed" });
      render();
      return;
    }
    attach(data.jobId, prompt);
  }

  formEl.addEventListener("submit", (e) => {
    e.preventDefault();
    const prompt = promptEl.value.trim();
    if (!prompt) return;
    promptEl.value = "";
    send(prompt);
  });

  promptEl.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      formEl.requestSubmit();
    }
  });

  for (const [label, prompt] of QUICK_ACTIONS) {
    const b = document.createElement("button");
    b.type = "button";
    b.textContent = label;
    b.title = prompt;
    b.addEventListener("click", () => send(prompt));
    quickEl.appendChild(b);
  }

  resetEl.addEventListener("click", async () => {
    if (live) return;
    await fetch(api("reset"), { method: "POST" });
    turns = [];
    render();
  });

  loadTranscript();
})();
