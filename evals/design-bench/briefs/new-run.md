# Brief — new measurement batch

Design a desktop web page where a maker configures and launches a measurement batch. A batch runs one **experiment** — a question with an axis of arms — over one or more cases, through one or more tools, and scores the result with a metric. The page's first job is to make the experiment choice, because it determines everything below it: what the arms are, which tools apply, and which metric is used. The maker knows the system; the page's job is clarity about what will be generated and what it will cost. This brief carries content only — all visual direction comes from the project's DESIGN.md.

The page contains, in sequence:

## 1. Wayfinding

A link back to "Measurements" and the page's name: "New measurement batch."

## 2. The experiment — what question is this batch asking

The first and governing choice, two options today, each with a plain phrase. The choice reshapes the rest of the form:

- **Method grounding** — "Hold the tool fixed; vary the design direction across the grounding ladder. The arms are treatments; scored by distance from the tool's default look."
- **Tool comparison** — "Hold one design direction fixed; vary the tool. The arms are the tools you pick; scored by fidelity to the handed direction."

One sentence beneath: "The experiment sets the axis — what varies across arms — and the metric follows from it."

## 3. The arms — what varies

This group's contents depend on the experiment chosen above:

- If **method grounding**: the seven treatments, selectable — no direction, tokens only, adjectives, one real object, one hard constraint, one governing metaphor, full specification. "Adjectives is the comparison baseline and is always included; no direction is the control."
- If **tool comparison**: the tools to compare, selectable — "Stitch · Gemini 3.1 Pro," "Gemini 3.1 Pro · direct," "Claude · (model)" — plus one choice of the fixed direction every tool receives (default: full specification). "Every selected tool renders the same fixed direction; that's what makes them comparable."

## 4. Cases

The four available cases (Agent Architecture, Auralis, DC Tracks, Urban Nocturnal Field Guide), each selectable. "Each selected case is rendered for every arm above."

## 5. The tool

Shown only for **method grounding** (tool comparison sets its tools as the arms in section 3): a single tool to run the ladder on — "Stitch · Gemini 3.1 Pro," "Gemini 3.1 Pro · direct," etc. "One tool, so every treatment's distance is measured from the same default look."

## 6. Channels

How the direction is delivered, with one phrase each: "as a design system — attached the way a real design system would be," and "in the prompt — written into the request itself." One sentence: "Only Stitch offers the design-system channel; raw model tools receive the direction in the prompt, so a fair tool comparison uses the prompt channel for all of them."

## 7. The metric

Stated as a consequence of the experiment, not a free choice: "Method grounding is scored by distance from the tool's default look (how far the direction pushed the result from the lazy default). Tool comparison is scored by fidelity to the handed direction (how faithfully each tool reproduced the palette and type) — the only measure comparable across tools."

## 8. How many

Two numeric choices: "Renderings per arm" (example: 8) and, for method grounding only, "Renderings of the no-direction control" (example: 8). One sentence stating the cost in plain arithmetic: "8 per arm across 2 cases, 5 arms, and 1 channel is 80 renderings, plus controls."

## 9. The model and the name

A model choice where the tool exposes one (GEMINI_3_1_PRO, GEMINI_3_FLASH) and an input for the batch's name (example: "october-baseline").

## 10. Launch

One action: "Generate and measure." Two sentences beneath: "The batch records the experiment, the tool(s), and the exact case definitions it measured, identified by hash, and refuses to resume if any of them change underneath it. Progress is visible from the measurements page; batches are resumable."
