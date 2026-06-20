/**
 * Round 2: generate the six remaining screens concurrently, each in its own
 * Stitch project with the (tightened) proofing DESIGN.md installed. Same
 * pattern as generate-probes.ts. Each prompt carries a guardrail line
 * reinforcing the new DESIGN.md clauses (no left nav, no icons, name = Design Bench).
 *
 *   STITCH_API_KEY=$(cat .stitch-key) bun design/generate-round2.ts
 */
import { StitchEval } from "../src/tools/stitch.ts";
import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const designMd = readFileSync("DESIGN.md", "utf8");
const GUARD =
  "\n\nThe tool is named Design Bench. Navigation is the slim top rail only — no left navigation bar, no icon rail, and no icon vocabulary.";

interface Probe { name: string; prompt: string; }

const PROBES: Probe[] = [
  {
    name: "comparison-tool-mode",
    prompt: `Page: the comparison page in Design Bench, in TOOL MODE — comparing how different tools rendered one fixed design direction. Follow the attached design system. Content:
1. Wayfinding: link back to "All cases," tool name "Design Bench," case "Agent Architecture."
2. A pivot control with two options: "By design direction" and "By tool" (selected). Because "by tool" is selected, the fixed direction is labeled: "Direction: one real object."
3. The providers side by side at equal size, with the handed direction shown among them as the reference being matched. Each cell: a placeholder rendering, the tool and model name, and its fidelity reading in plain words:
- Reference — "The handed direction: the shared palette and type the tools were asked to honor."
- Stitch · Gemini 3.1 Pro — "Reproduced 49% of its color on the handed palette. It re-synthesized the palette into fifteen shades."
- Gemini 3.1 Pro · direct — "Reproduced 83% of its color on the handed palette, with six shades — the more faithful of the two."
4. A "How to read" line: "Fidelity is the share of color within OKLab ΔE < 0.05 of the handed palette — the only measure comparable across tools, because each tool has a different default look of its own."
5. Certification block: definitions hash 9255ea5d23ee · measured 2026-06-15 · 2 renderings per tool (a smoke test).
Numbers are measured values in the machine-reading register beside plain claims.${GUARD}`,
  },
  {
    name: "blind-judgment",
    prompt: `Page: blind judgment in Design Bench — judge renderings without knowing which treatment produced them. Follow the attached design system. Content:
1. Wayfinding back to "Agent Architecture," and a frame: "Below are five renderings of the same seven-slide deck — all from Stitch · Gemini 3.1 Pro, in shuffled order, with their treatments hidden. Pick the one with the clearest point of view — then see which method made it." A small companion link: "Judge tools instead — same direction, the tool hidden."
2. Five renderings at equal size (placeholder images), labeled only A through E, no other captions. Each selectable as the reader's verdict.
3. The verdict: a question "Which rendering most escapes the look you'd expect by default?" with the five options, and a confirm action "Lock in and reveal." A quiet line: "Your verdict is recorded before the reveal — it can't be changed after."
4. Progress: "Judgment 2 of 6 in this set."${GUARD}`,
  },
  {
    name: "judgment-reveal",
    prompt: `Page: judgment reveal in Design Bench — shown immediately after locking a blind verdict. Follow the attached design system. Content:
1. The outcome first: "You picked C — the one real object treatment. The measurement agrees: it landed farthest from this tool's default look (all five were from Stitch · Gemini 3.1 Pro)."
2. The same five renderings in the same positions (placeholder images), each now captioned with treatment and distance, the reader's pick marked:
- A — Adjectives · 0.31 from the default look
- B — Tokens only · 0.18
- C — One real object · 0.95 — your pick
- D — No direction · 0 (the default look itself)
- E — One governing metaphor · 0.66
3. "The words that did it": the grounding prose — "Each slide looks like a single page of a graduate CS lecture handout — photocopied that morning, diagram-heavy, one teacher's voice." Then: "You judged the output; these are the words that produced it."
4. The running tally: "Across your 2 judgments in this set, you've picked a grounded treatment twice. Readers agree with the measurement in 71% of recorded judgments."
5. Onward: "Next judgment (3 of 6)" and "Done judging — back to Agent Architecture."${GUARD}`,
  },
  {
    name: "settings",
    prompt: `Page: Settings in Design Bench — the tool's credentials. Follow the attached design system. A short, exact page. Content:
1. Wayfinding back to the case gallery, page name "Settings."
2. A section "Generation tools" with one sentence: "Renderings are generated through these tools; each key is stored locally with restricted permissions and never leaves this machine." A list, one row per tool, each with name, status, and manage actions:
- Stitch — "AIza••••••••kjJY · verified" · Replace key · Remove
- Gemini · direct — "AIza••••••••kjJY · key configured" · Replace key · Remove
- Claude — "no key — add one to compare this tool" · Add key
Each row has an input for a new key with "Save and verify." One line: "A tool without a key can't be selected as an arm in a tool comparison."
3. A section "Editing agent" with one sentence: "The conversation panels on case and ideation pages are driven by this provider." Current config shown plainly: "gemini / gemini-3-flash-preview · key configured." A provider choice (ollama — local, no key · gemini · anthropic · openrouter), a model input, an optional key input, and "Save." One line: "Switching providers starts a fresh conversation; past transcripts are kept."${GUARD}`,
  },
  {
    name: "new-case",
    prompt: `Page: New case in Design Bench — start a new case from a fragment of an idea. Follow the attached design system. Make starting feel smaller than a form: one input, one action. Content:
1. Wayfinding back to the case gallery, page name "New case."
2. The spark: one text input labeled "Start with a spark — a fragment is enough; an ideation agent helps you find the world before any files exist," with example text inside it: "a tide chart for surfers · a zine for a synth meetup · my grandmother's recipe box…". One action "Start ideating." One line beneath: "A conversation, not a generator — diverge on worlds, converge on a brief and a direction, commit when it's yours."
3. A collapsed secondary section "You already know the world — create a draft directly," containing an input for the case short name (example "recipe-card"), a device choice (desktop, mobile, tablet), and a larger input for the full content brief labeled "The brief — everything the deliverable must contain." One action "Create draft."${GUARD}`,
  },
  {
    name: "case-authoring",
    prompt: `Page: case authoring in Design Bench — a maker works on one draft case. Follow the attached design system. Two regions side by side: the case's documents on the left, and a persistent conversation panel on the right where an editing agent edits them. Content:
1. Wayfinding and status: back to the case gallery; case name "Urban Nocturnal Field Guide"; status "Draft — passes all checks, ready to promote." Two actions: "Promote to the gallery" and a quieter "Delete draft."
2. Left — a section "Checks" (the validation gate), each with a plain result: "Shared tokens identical across all treatments — pass. Treatment lengths within 35% of each other — pass (310–355 words). Format linter — 0 errors, 0 warnings. No unfinished markers. Do's and Don'ts only in the full specification — pass." One line: "A case enters the gallery only when every check passes; the agent runs these same checks after each edit."
3. Left — the content brief as readable prose, titled "The brief — what every treatment must contain," opening: "Design a field-notes site for night birding in the city: a season log of nocturnal walks, each entry with species heard, location, time, and a short field note…"
4. Left — the six treatment documents as an ordered list, each with name, one-line character, word count: "Tokens only (front matter, no prose) · Adjectives — 340 words · One real object: a 1960s Peterson field guide — 350 words · One hard constraint: 1960s offset printing — 322 words · One governing metaphor: the naturalist's season log — 331 words · Full specification — 612 words." Each opens for reading.
5. Right — a persistent conversation panel: the agent's provider "gemini / gemini-3-flash-preview," a short exchange — maker: "Sharpen the constraint treatment; the printing limitation should forbid more" / agent: "Tightened to two ink colors and halftone-only images; validation clean" — the agent's reply carrying a record of files changed ("constraint +6 −4") in the machine register. An input area with placeholder "Direct the agent — critique, rewrite, validate…" and quick actions: "validate," "draft all treatments," "propose groundings," "critique."${GUARD}`,
  },
];

async function runProbe(p: Probe) {
  const client = new StitchEval();
  const log = (m: string) => console.log(`[${p.name}] ${m}`);
  try {
    const { projectId } = await client.createProject(`design-bench/r2/${p.name}`);
    log(`project ${projectId}`);
    const ds = await client.setupDesignSystem(projectId, designMd, () => {}, "DESKTOP");
    log(`design system ${ds}`);
    const known = new Set<string>(await client.listScreenIds(projectId));
    const screen = await client.generateScreen(projectId, p.prompt, ds, known, log, "GEMINI_3_1_PRO", "DESKTOP");
    const dir = join("design", p.name);
    mkdirSync(dir, { recursive: true });
    if (screen.htmlUrl) writeFileSync(join(dir, "page.html"), await fetch(screen.htmlUrl).then((r) => r.text()));
    if (screen.imageUrl) writeFileSync(join(dir, "page.png"), Buffer.from(await fetch(screen.imageUrl).then((r) => r.arrayBuffer())));
    writeFileSync(join(dir, "meta.json"), JSON.stringify({ projectId, ...screen, raw: undefined }, null, 2));
    log(`DONE html=${!!screen.htmlUrl} img=${!!screen.imageUrl}`);
  } catch (e) {
    log(`FAILED: ${e}`);
  } finally {
    await client.close().catch(() => {});
  }
}

await Promise.all(PROBES.map(runProbe));
console.log("all six round-2 screens complete");
