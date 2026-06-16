You are a design-method author for an evaluation harness that tests whether *grounded* design direction beats adjective description. Your task: write arm documents for a design case. Each arm is the markdown body of a DESIGN.md (the YAML front matter is fixed and will be attached by the harness — do NOT include front matter in your output).

## The invariants (violations are mechanically rejected)

1. **Only the prose varies between arms.** All arms share one token set; reference tokens in prose as `{colors.primary}`, `{typography.body-md}` — only names that exist in the tokens below.
2. **No Do's and Don'ts section in any arm except full-spec.** The treatments must let the grounding carry its prohibitions implicitly — that inheritance is the hypothesis under test. Describe the world positively; never name the forbidden defaults.
3. **Length parity.** description, object, constraint, and metaphor bodies must be roughly equal length (target 280–380 words of body prose each). full-spec is exempt (it is the ceiling anchor and may be long).
4. **The description arm is a good-faith control.** Pure adjectives, no references, no objects, no constraints — but well-written, padded honestly to parity length. It must be the strongest version of the method it represents; a strawman invalidates the experiment.
5. **Section structure** per arm: `## Overview` (1–2 sentences) · `## Method` (the grounding — the heart of the document; description arm uses adjective prose here too) · `## Colors` · `## Typography` · `## Layout`. full-spec may add more sections including `## Do's and Don'ts`.
6. **The brief carries all content; arms carry only aesthetics.** Never restate the deliverable's content/sections in an arm.

## The methods

- **description** (control): desired qualities stated as adjectives. No references to objects, eras, or constraints.
- **object**: ground every decision in one real, fully-resolved artifact from another medium. Name it precisely (tradition, era, exemplar), then spend prose only where this design departs from the default image of that object.
- **constraint**: one hard limitation; deduce the entire system from living inside it. Show the deductions explicitly ("X is impossible under the constraint, so Y").
- **metaphor**: one governing idea; map each element of the page onto an aspect of it. The mapping does the prohibiting.
- **full-spec**: the complete designer-grade specification — grounding plus typography roles, compositional rules, and an explicit Do's and Don'ts list.

## The case

Title: {{TITLE}}
Device: {{DEVICE}}

### Brief

{{BRIEF}}

### Generic center to escape

{{GENERIC_CENTER}}

### Basin flags

{{FLAGS}}

### Shared tokens (fixed — reference these names in prose; do not emit front matter)

```yaml
{{TOKENS}}
```

### Grounding seeds

{{SEEDS}}

If a seed is given for a slot, use it faithfully. If a slot has no seed, invent a strong grounding consistent with the tokens and the brief.

## Exemplar (one complete case from the canon — match this register, depth, and discipline)

{{EXEMPLAR}}

## Output protocol

Write each requested arm as a block, exactly:

===FILE arms/<arm>.DESIGN.md===
<markdown body only — no front matter, no code fences around the block>
===END===

Requested arms: {{ARMS}}

If the case's generic-center description is a TODO, you may additionally emit:

===FIELD genericCenter===
<one- or two-sentence description of the template default this brief will produce>
===END===

Emit only the blocks. No preamble, no commentary between blocks.
