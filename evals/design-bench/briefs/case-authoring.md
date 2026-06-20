# Brief — case authoring

Design a desktop web page where a maker works on one draft case: the content brief, the treatment documents, the validation gate, and a conversation with an editing agent. Two regions: the case's documents, and a persistent conversation panel where the maker directs an agent that edits them. This brief carries content only — all visual direction comes from the project's DESIGN.md.

The page contains:

## 1. Wayfinding and status

A link back to the case gallery; the case name "Urban Nocturnal Field Guide"; its status: "Draft — passes all checks, ready to promote." Two actions: "Promote to the gallery" and a quieter "Delete draft."

## 2. The validation gate

A section titled "Checks," listing each with its result in plain words: "Shared tokens identical across all treatments — pass. Treatment lengths within 35% of each other — pass (310–355 words). Format linter — 0 errors, 0 warnings. No unfinished markers. Do's and Don'ts only in the full specification — pass." One sentence beneath: "A case enters the gallery only when every check passes; the agent runs these same checks after each edit."

## 3. The content brief

The case's brief shown as readable prose, titled "The brief — what every treatment must contain," opening with its real first line: "Design a field-notes site for night birding in the city: a season log of nocturnal walks, each entry with species heard, location, time, and a short field note…"

## 4. The treatments

The six treatment documents as an ordered list, each with its name, its one-line character, and its word count: "Tokens only (front matter, no prose) · Adjectives — 340 words · One real object: a 1960s Peterson field guide — 350 words · One hard constraint: 1960s offset printing — 322 words · One governing metaphor: the naturalist's season log — 331 words · Full specification — 612 words." Each opens for reading.

## 5. The conversation

A persistent panel where the maker types instructions and an agent answers with edits. It shows: the agent's provider ("gemini / gemini-3-flash-preview"), a short exchange — maker: "Sharpen the constraint treatment; the printing limitation should forbid more" / agent: "Tightened to two ink colors and halftone-only images; validation clean" — with the agent's reply carrying a record of files changed ("constraint +6 −4") and the tools it used, quoted in the machine's register. An input area with the placeholder "Direct the agent — critique, rewrite, validate…" and a set of quick actions: "validate," "draft all treatments," "propose groundings," "critique."
