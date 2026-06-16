# Brief — measurements index

Design a desktop web page listing every measurement batch the tool has recorded — the provenance ledger behind the case pages. The reader is here to verify a claim or find a specific batch, not to browse artwork. Every claim on the site traces to a batch here, and a batch is defined by four things: the experiment it ran, the tool(s) it used, the cases it measured, and the metric it scored with. This brief carries content only — all visual direction comes from the project's DESIGN.md.

The page contains, in sequence:

## 1. Identity and framing

The page title "Measurements," a link back to the case gallery, and two sentences of framing: "Every claim on this site traces to one of the batches below. Two batches are directly comparable only when they share an experiment, a metric, and a definitions hash."

## 2. The batches

Entries, newest first. Each shows: the batch name, the date, the **experiment**, the **tool(s)**, the model, the **metric**, the case definitions hash, and its headline claim where one exists:

1. **tool-comp-smoke** — 2026-06-15 · tool comparison · Stitch · Gemini 3.1 Pro vs Gemini 3.1 Pro · direct · metric: fidelity to direction · definitions 9255ea5d23ee · "Agent Architecture, full specification handed to both tools through the prompt. Gemini direct reproduced 83% of its color on the handed palette; Stitch 49%. (2 renderings each — a smoke test, not yet powered.)"
2. **demo** — 2026-06-09 · method grounding · Stitch · Gemini 3.1 Pro · metric: distance from default look · definitions 5d7280c55ee4 · "40 renderings across Agent Architecture (22) and Auralis (18); 2 blind judgments recorded. Headline: one real object beat adjectives by 0.64 on Agent Architecture."
3. **demo-flash** — 2026-06-09 · method grounding · Stitch · Gemini 3 Flash · metric: distance from default look · definitions 50e2cc3f1a01 · "13 renderings of Auralis on the smaller model. Headline: one real object beat adjectives by 0.34 — the effect holds at lower model capacity."
4. **par-diag** — 2026-06-10 · method grounding · Stitch · Gemini 3.1 Pro · metric: distance from default look · definitions 50e2cc3f1a01 · "2 renderings of Auralis; a parallelism diagnostic, resumed twice."
5. **dc-tracks (afternoon)** — 2026-06-10 · method grounding · Stitch · Gemini 3.1 Pro · metric: distance from default look · definitions 16119bc6a53a · "42 renderings of DC Tracks, 6 excluded as failures. Headline: the metaphor grounding led adjectives by 0.21."
6. **dc-tracks (earlier)** — 2026-06-10 · method grounding · Stitch · Gemini 3.1 Pro · definitions 16119bc6a53a · "Generated but never measured — no claims trace here."

## 3. How a batch becomes a claim

Plain words covering both kinds of experiment, because they ask different questions and use different metrics:

- "A **method-grounding** batch renders the same brief under every treatment through one tool, and measures each rendering's **distance from that tool's default look** — combining perceptual color difference with structural features (gradients, shadows, dark backgrounds, icon fonts). A treatment's advantage over adjectives is validated against 10,000 reshuffled orderings before it is called significant."
- "A **tool-comparison** batch hands the same fixed direction to several tools and measures each rendering's **fidelity** to it — the share of color within OKLab ΔE < 0.05 of the handed palette. Fidelity is used here because each tool has a different default look, so distance-from-default can't compare across tools."

## 4. For makers

One quieter path: "Start a new measurement batch," with the phrase "choose the experiment, its arms, the tool(s), and sample count."
