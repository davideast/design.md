# Brief — the comparison page (treatment × tool)

Design a desktop web page that compares one evaluation case across two axes: the **design direction** it was given (the treatment) and the **tool** that generated it (a provider and its model, e.g. Stitch running Gemini 3.1 Pro). The reader pivots which axis is primary, because there are two distinct questions and each wants a different layout. The reader is a first-time visitor; every term and number is explained where it appears. This brief carries content only — all visual direction comes from the project's DESIGN.md.

This is the two-axis comparison page; it replaced an earlier single-axis version that assumed one implicit tool.

The page contains, in sequence:

## 1. Wayfinding

A link back to "All cases," the tool name "Design Bench," and the current case name: "Agent Architecture."

## 2. The case

Beneath the case name, one paragraph stating what was held constant: "Every rendering below was asked for exactly the same thing — a seven-slide deck on agent architectures. The content never changed; only the design direction and the tool did."

## 3. The pivot — choose what to compare

A single control offering two ways to read the case, with one plain phrase each. Default is the first:

- **By design direction** — "Hold the tool fixed; see what increasing design direction does, from no direction up to a full specification."
- **By tool** — "Hold the direction fixed; see how different tools render the same handed direction."

The choice changes which axis is laid out side by side and which is named as a fixed label. Whichever dimension is *not* being compared is stated explicitly, never implied: in direction mode, the tool is labeled "Tool: Stitch · Gemini 3.1 Pro"; in tool mode, the treatment is labeled "Direction: one real object."

## 4. Direction mode (default) — the treatment ladder

For the fixed tool, the seven treatments are shown **side by side at equal size with aligned baselines**, in order of increasing direction. Each is a summary cell: a placeholder image of that rendering, and a caption with the treatment name, what the model was given in plain words, and how far its result landed from this tool's default look:

1. **No direction** — "The model received the brief alone. This is the default look everything else is measured against." (distance 0)
2. **Tokens only** — "The shared palette and type, no words about how to use them. Landed 0.18 from the default look."
3. **Adjectives** — "The shared tokens, plus a description in adjectives: scholarly, restrained, print-like. Landed 0.31. Adjectives are the method being challenged."
4. **One real object** — "The shared tokens, plus one named artifact: a graduate CS lecture handout. Landed 0.95 — 0.64 farther than adjectives."
5. **One hard constraint** — "Plus one limitation: everything must survive photocopying. Landed 0.71 — 0.40 farther than adjectives."
6. **One governing metaphor** — "Plus one idea on every element: each slide is a page from a professor's notebook. Landed 0.66 — 0.35 farther than adjectives."
7. **Full specification** — "The complete designer-grade specification. Landed 1.02 — the ceiling the shorter methods reach toward."

Below this band, a control reads **"Add a provider to compare."** Choosing one appends a second band — the same seven treatments, columns aligned to the first — labeled with its tool and model (e.g. "Gemini 3.1 Pro · direct"). Stacked bands let the reader scan a column to see one treatment across tools.

One sentence must sit with the stacked bands, because it is the easiest thing to get wrong: "Each band's distances are measured from *that tool's own* default look, so they compare down a band but not across bands — to compare a treatment across tools, switch to comparing by tool, which uses fidelity instead." (See section 6.)

## 5. Tool mode — providers side by side

For one fixed treatment (default: the strongest, "one real object"), the tools are shown **side by side at equal size**, with the handed design direction shown among them as the reference being matched. Each tool's cell carries a placeholder rendering, its tool and model name, and its **fidelity** reading — how faithfully it reproduced the handed palette and type, in plain words. Using real values from a first comparison of this treatment:

- **Reference** — "The handed direction: the shared palette and type the tools were asked to honor."
- **Stitch · Gemini 3.1 Pro** — "Reproduced 49% of its color on the handed palette. It re-synthesized the palette into fifteen shades."
- **Gemini 3.1 Pro · direct** — "Reproduced 83% of its color on the handed palette, with six shades — the more faithful of the two."

This side-by-side-for-one-treatment is the genuine cross-tool comparison; the stacked bands in direction mode are for checking whether the grounding finding *replicates* across tools.

## 6. How to read the numbers

Three sentences, each defining one term plainly, because the page shows two different measures and they are not interchangeable:

- "**Default look** — what a tool produces with no direction. Every distance in *direction mode* is measured from it."
- "**Distance** — how far a rendering moved from that tool's default look. Higher means the direction pushed it farther from the lazy default."
- "**Fidelity** — how faithfully a rendering reproduced the *handed* palette and type. This is the only measure that compares across tools, because each tool has a different default look of its own."

## 7. The words that did it

A section titled "The sentence that moved it 0.64," quoting the winning treatment's grounding prose: "Each slide looks like a single page of a graduate CS lecture handout — photocopied that morning, diagram-heavy, one teacher's voice, designed to be followed with a pen in hand." Then: "The model was never told 'no dark theme, no icon bullets' — the handout implies all of it."

## 8. Drill in

Each summary cell — a single (treatment × tool) — opens its own sheet showing every rendering that cell produced, so the reader can judge consistency. A cell is a summary; the detail is one level down.

## 9. What to do next

Two links: "Compare without labels — judge the renderings yourself, then see which made each," and "Next case: Auralis."

## 10. Certification

A closing block in the register reserved for machine-quoted values: tools Stitch · Gemini 3.1 Pro and Gemini 3.1 Pro · direct · 22 renderings per treatment per tool · case definitions hash 5d7280c55ee4 · measured 2026-06-10 · "Distance combines perceptual color difference with structural features; fidelity is share of color within OKLab ΔE < 0.05 of the handed palette; significance validated against 10,000 reshuffled orderings."
