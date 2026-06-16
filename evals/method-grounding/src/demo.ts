/**
 * Synthesizes a fixture run (runs/demo) so the matrix viewer and measurement
 * pipeline can be exercised without a STITCH_API_KEY. The fixtures are crude
 * HTML caricatures of each condition — useful for trying the UI, meaningless
 * as evidence.
 *
 * Fixtures are case-faithful: every arm of a case renders that case's brief
 * content (as a real run would), and only the styling varies by arm — the
 * control arm is the case's content in the model's default register.
 *
 * Usage:
 *   bun src/demo.ts && bun src/measure.ts runs/demo && bun src/viewer.ts runs/demo
 */
import { mkdirSync, writeFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { ROOT, loadCases, snapshotEval, evalHashOf } from "./cases.ts";

const runDir = join(ROOT, "runs", "demo");
rmSync(runDir, { recursive: true, force: true });

const page = (head: string, body: string) => `<!doctype html><html><head><meta charset="utf-8">${head}</head><body>${body}</body></html>`;
const fonts = (...families: string[]) =>
  `<link href="https://fonts.googleapis.com/css2?${families.map((f) => `family=${f.replace(/ /g, "+")}`).join("&")}" rel="stylesheet">`;
const ICONS = `<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined" rel="stylesheet">`;
const ACCENTS = ["#8b5cf6", "#ec4899", "#22d3ee", "#f59e0b", "#10b981", "#6366f1"];

// ---------------------------------------------------------------------------
// agent-slides: the brief is a 7-slide deck on agent architecture.
// ---------------------------------------------------------------------------

/** Generic center: dark conference deck — gradient title, icon bullets, agenda. */
function deckGeneric(i: number) {
  const a = ACCENTS[i % 6];
  const b = ACCENTS[(i + 2) % 6];
  return page(
    fonts(["Inter", "Roboto", "Poppins", "Manrope", "Sora"][i % 5]) +
      ICONS +
      `<style>body{margin:0;background:#0d1117;color:#f0f3f8;font-family:Inter,sans-serif}.slide{min-height:540px;padding:56px;border-radius:18px;box-shadow:0 10px 40px rgba(0,0,0,.5);margin:24px;background:#161d2a}.title{background:linear-gradient(120deg,${a}44,${b}33);text-align:center;padding-top:160px}.chip{background:linear-gradient(90deg,${a},${b});border-radius:9999px;padding:8px 22px;font-weight:700}</style>`,
    `<div class="slide title"><h1 style="font-size:58px;font-weight:800">Agent Architecture</h1><p style="color:#9aa6b8">ReAct · Reflexion · Plan-and-Execute</p><span class="chip">Let's dive in</span></div>
<div class="slide"><h2 style="font-weight:700">Agenda</h2><p><span class="material-symbols-outlined" style="color:${a}">lightbulb</span> Think</p><p><span class="material-symbols-outlined" style="color:${b}">bolt</span> Act</p><p><span class="material-symbols-outlined">visibility</span> Observe — sample ${i}</p></div>
<div class="slide" style="text-align:center"><h2 style="font-weight:800">Thank you!</h2><p style="color:#9aa6b8">Questions?</p></div>`,
  );
}

/** Grounded: handout pages — paper, serif, hand ink, one vermilion mark. */
function deckHandout(i: number) {
  return page(
    fonts("Fraunces", "Source Serif 4", "IBM Plex Mono") +
      `<style>body{margin:0;background:#f4f0e4;color:#1e1a14;font-family:'Source Serif 4',serif}.slide{min-height:540px;padding:64px 96px}.meta{font-family:'IBM Plex Mono',monospace;font-size:12px;letter-spacing:.08em;color:#b8b0a2}.num{text-align:right}</style>`,
    `<div class="slide"><div class="meta">§ A LECTURE · 14 OCTOBER 2026</div><h1 style="font-family:Fraunces,serif;font-weight:500;font-size:54px;margin-top:120px">Agent Architecture</h1><p style="font-style:italic">On loops, traces, and the structures by which language models act.</p><div class="meta num">§ i / xxiv</div></div>
<div class="slide"><div class="meta">§ 1. THE LOOP</div><h2 style="font-family:Fraunces,serif;font-weight:500">§ 1. The Loop</h2><p style="max-width:60ch">The ReAct <span style="border-bottom:2px solid #c3402a">loop</span> interleaves reasoning and action; OBSERVE returns to THINK — a controller, not a pipeline. Variant ${i}.</p><p class="meta">THINK → ACT → OBSERVE ⟲</p><div class="meta num">§ ii / xxiv</div></div>
<div class="slide"><div class="meta">§ 2. A WORKED TRACE</div><p class="meta">THOUGHT: find the keynote date<br>ACTION: tool.search("Jensen Huang 2024 keynote")<br>OBSERVATION: March 18, 2024</p><hr style="border:0;border-top:1px solid #b8b0a2"><div class="meta num">§ iii / xxiv</div></div>`,
  );
}

// ---------------------------------------------------------------------------
// auralis: the brief is the Auralis voice-platform landing page.
// ---------------------------------------------------------------------------

/** Generic center: the default AI-product rendering of the Auralis brief — dark, purple gradient, glow. */
function auralisGeneric(i: number) {
  const a = ACCENTS[i % 6];
  return page(
    fonts(["Inter", "Roboto", "Manrope", "Sora"][i % 4]) +
      ICONS +
      `<style>body{margin:0;background:#0b0716;color:#f5f3ff;font-family:Inter,sans-serif}.hero{padding:120px 40px;text-align:center;background:linear-gradient(160deg,#1c1038,${a}33)}.cta{background:linear-gradient(90deg,#8b5cf6,${a});border:none;border-radius:9999px;box-shadow:0 0 40px #8b5cf680;color:#fff;padding:14px 32px;font-weight:700}.grid{display:flex;gap:16px;padding:40px}.card{flex:1;background:#171030;border-radius:16px;box-shadow:0 4px 24px rgba(0,0,0,.6);padding:24px}</style>`,
    `<nav style="display:flex;gap:18px;padding:18px 32px;color:#a78bfa">Auralis <span>Studio</span><span>Agents</span><span>API</span></nav>
<div class="hero"><h1 style="font-size:56px;font-weight:800">Making digital experiences sound human</h1><p style="color:#b8aee0">The AI voice platform for everyone — sample ${i}.</p><button class="cta">Sign up</button></div>
<div class="grid"><div class="card"><span class="material-symbols-outlined" style="color:${a}">graphic_eq</span><h3 style="font-weight:700">Auralis Studio</h3></div><div class="card"><span class="material-symbols-outlined">smart_toy</span><h3 style="font-weight:700">Auralis Agents</h3></div><div class="card"><span class="material-symbols-outlined">api</span><h3 style="font-weight:700">Auralis API</h3></div></div>`,
  );
}

/** Grounded: Engineered Softness — light page, one gradient cloud, pills, icon glyphs. */
function auralisEngineered(i: number) {
  return page(
    fonts("Geist") +
      ICONS +
      `<style>body{margin:0;background:#F7F7F5;color:#111111;font-family:Geist,sans-serif}.nav{display:flex;justify-content:space-between;padding:0 32px;height:72px;align-items:center;border-bottom:1px solid #E5E5E3;font-size:12px;letter-spacing:.2em}.hero{padding:140px;text-align:center}.pill{border-radius:9999px;background:#111111;color:#fff;border:1px solid #E5E5E3;padding:12px 28px}.demo{width:80%;margin:auto;background:#ffffff;border:1px solid #E5E5E3;border-radius:24px;box-shadow:0 12px 60px rgba(0,0,0,.04);overflow:hidden}.cloud{height:480px;background:radial-gradient(circle at ${35 + i * 8}% 40%, #9958ff 0%, #d946ef 30%, rgba(34,211,238,.6) 60%, rgba(244,114,182,.4) 80%, #ffffff 100%)}</style>`,
    `<div class="nav"><b>AURALIS</b><span style="color:#6B6B6B">STUDIO · AGENTS · API · RESOURCES · ENTERPRISE · PRICING</span><button class="pill">Sign up</button></div>
<div class="hero"><h1 style="font-size:72px;font-weight:600;letter-spacing:-0.04em">Making digital experiences sound human</h1><button class="pill">Sign up</button> <button class="pill" style="background:transparent;color:#111">Contact sales</button></div>
<div class="demo"><div style="padding:14px 20px;border-bottom:1px solid #E5E5E3;font-size:12px;letter-spacing:.08em">AURALIS STUDIO · AGENTS · API</div><div class="cloud"></div><div style="padding:16px;border-top:1px solid #E5E5E3"><span class="material-symbols-outlined">play_arrow</span> AI Voice Generator · <span style="color:#6B6B6B">Text to Speech · Music</span></div></div>`,
  );
}

// ---------------------------------------------------------------------------

const matrix: Record<string, Record<string, (i: number) => string>> = {
  "agent-slides": {
    "no-design-md": deckGeneric,
    "tokens-only": (i) => (i % 2 ? deckGeneric(i) : deckHandout(i)),
    description: (i) => (i % 3 === 0 ? deckGeneric(i) : deckHandout(i)),
    object: deckHandout,
    "object+prompt": (i) => deckHandout(i + 1),
  },
  auralis: {
    "no-design-md": auralisGeneric,
    description: (i) => (i % 2 ? auralisGeneric(i) : auralisEngineered(i)),
    object: auralisEngineered,
    metaphor: (i) => auralisEngineered(i + 2),
  },
};

for (const [caseKey, cells] of Object.entries(matrix)) {
  for (const [cell, fn] of Object.entries(cells)) {
    const n = cell === "no-design-md" ? 6 : 4;
    const dir = join(runDir, caseKey, cell);
    mkdirSync(dir, { recursive: true });
    for (let i = 0; i < n; i++) {
      writeFileSync(join(dir, `${i}.html`), fn(i));
      writeFileSync(
        join(dir, `${i}.json`),
        JSON.stringify(
          {
            case: caseKey,
            channel: cell.includes("+prompt") ? "prompt" : "design-system",
            model: "GEMINI_3_1_PRO",
            elapsedMs: 60_000 + i * 7_000,
            synthetic: true,
          },
          null,
          2,
        ),
      );
    }
  }
}
// Snapshot the eval definition exactly as generate.ts would.
const demoCases = loadCases(Object.keys(matrix));
snapshotEval(demoCases, join(runDir, "eval"));
const { evalHash, caseHashes } = evalHashOf(demoCases);

writeFileSync(
  join(runDir, "config.json"),
  JSON.stringify(
    { demo: true, model: "GEMINI_3_1_PRO", stitchSdkVersion: "synthetic-fixtures", evalHash, caseHashes, startedAt: "demo" },
    null,
    2,
  ),
);

// A second run over a case subset with a different model — gives the runs
// index something to group: same auralis case hash (comparable), different
// run-level hash (different coverage).
const flashDir = join(ROOT, "runs", "demo-flash");
rmSync(flashDir, { recursive: true, force: true });
for (const [cell, fn] of Object.entries(matrix.auralis)) {
  const n = cell === "no-design-md" ? 4 : 3;
  const dir = join(flashDir, "auralis", cell);
  mkdirSync(dir, { recursive: true });
  for (let i = 0; i < n; i++) writeFileSync(join(dir, `${i}.html`), fn(i + 1));
}
const flashCases = loadCases(["auralis"]);
snapshotEval(flashCases, join(flashDir, "eval"));
const flashHashes = evalHashOf(flashCases);
writeFileSync(
  join(flashDir, "config.json"),
  JSON.stringify(
    {
      demo: true,
      model: "GEMINI_3_FLASH",
      stitchSdkVersion: "synthetic-fixtures",
      evalHash: flashHashes.evalHash,
      caseHashes: flashHashes.caseHashes,
      startedAt: "demo",
    },
    null,
    2,
  ),
);

console.log(`demo runs written to ${runDir} and ${flashDir}`);
console.log(`next: bun src/measure.ts runs/demo && bun src/measure.ts runs/demo-flash && bun src/viewer.ts`);
