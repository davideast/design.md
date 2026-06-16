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

Title: Kettle & Leaf — neighborhood tea house site
Device: DESKTOP

### Brief

Design a desktop home page for Kettle and Leaf, a neighborhood tea house. The page contains: the shop name and a one-line welcome; today's three brewed teas each with name, origin, and tasting note; the weekly quiet hours schedule as a small table; a short paragraph on the owner's sourcing trips to Taiwan and Kenya; a map line with the address (412 Maple Row); and a footer with hours and a phone number. No lorem ipsum — all text real.

### Generic center to escape

TODO: describe the template-default this case must escape (or measure it with a control-only probe run).

### Basin flags

forbid [shadows, darkBackground]

### Shared tokens (fixed — reference these names in prose; do not emit front matter)

```yaml
version: alpha
name: TODO Case Name
colors:
  primary: '#1A1C1E'   # TODO: the case's ink
  secondary: '#6C7278' # TODO: supporting tone
  tertiary: '#B8422E'  # TODO: the single accent
  neutral: '#F7F5F2'   # TODO: the canvas
typography:
  headline-lg:
    fontFamily: TODO
    fontSize: 48px
    fontWeight: 400
    lineHeight: 1.1
  body-md:
    fontFamily: TODO
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.6
  label-sm:
    fontFamily: TODO
    fontSize: 12px
    fontWeight: 400
    lineHeight: 1.4
    letterSpacing: 0.08em
rounded:
  none: 0px
spacing:
  sm: 8px
  md: 16px
  lg: 32px
  xl: 64px
```

### Grounding seeds

- object: The reverse of a 1959 Blue Note LP jacket — liner notes set in bold Franklin Gothic; the teas are the track listing, the owner's sourcing paragraph is the liner essay, hours and phone are the ruled credits block at the foot
- constraint: (none — invent one)
- metaphor: (none — invent one)

If a seed is given for a slot, use it faithfully. If a slot has no seed, invent a strong grounding consistent with the tokens and the brief.

## Exemplar (one complete case from the canon — match this register, depth, and discipline)

### exemplar arm: description

## Overview

The deck should feel scholarly, rigorous, and intellectual. The design is academic and serious without being dry: thoughtful, generous, patient, and quietly authoritative. It should read as deep expertise shared openly — considered, articulate, and trustworthy — with a warmth that makes difficult material feel approachable. The overall impression is timeless rather than trendy, substantive rather than flashy, and humane rather than corporate. Every slide should communicate care, depth, and a love of the subject.

## Colors

The palette is warm, restrained, and bookish. **Primary** {colors.primary} is a deep, serious near-black for all text and diagrams — grounded and calm. **Neutral** {colors.neutral} is a warm, gentle background tone, soft and inviting like good paper. **Tertiary** {colors.tertiary} is a confident, energetic accent used very sparingly for emphasis. **Secondary** {colors.secondary} is a quiet supporting gray for the least important details. Together they create a dignified, focused, contemplative atmosphere.

## Typography

Typography is elegant, classical, and legible. Slide titles in {typography.display} are graceful and assured, never loud. Body text in {typography.body-md} is comfortable and bookish, made for careful reading. Code and labels in {typography.code} and {typography.label-sm} are precise and technical. Sizes are modest, weights restrained, and the hierarchy is calm and clear.

## Layout

Each slide is spacious, balanced, and unhurried. Margins are generous, compositions are airy and deliberate, and diagrams and prose share the page in a considered, harmonious way that guides the audience gently through the argument.

### exemplar arm: object

## Overview

Each slide of this deck is one page of a printed object, not a screen of a presentation.

## Method

Every slide is a single page of a lecture handout from a graduate CS course in the tradition of Patrick Winston's MIT 6.034, Sussman and Abelson's SICP, or Andrew Ng's original Stanford CS229 PDFs — typeset in serif, diagram-heavy, photocopied that morning on warmed xerox stock {colors.neutral} and handed down the row. The voice is one teacher's, not an institution's; the register is intellectually hospitable — provisional, generous, designed to be followed with a pen in hand. A page of such a handout announces its section in small monospace at a margin corner, numbers itself in lowercase Roman numerals at the opposite corner, and lets content sit freely on the paper between them. Blank paper is correct; a page that ends two-thirds of the way down has simply finished its thought. On flip-through the deck reads as a sequence of handout pages the audience could photocopy, fold in half, and annotate on the train home.

Two registers share each page, and the contrast between them is the design's whole gesture. The typeset register is crisp: titles set large in the display serif {typography.display} like section heads, prose in the text serif {typography.body-md} at a reading measure, code sitting on the paper like prose in {typography.code} with no fill behind it. The drawn register carries the hand: every diagram looks like the professor drew it on the board at speed and someone faithfully scanned it — strokes that vary, corners that almost meet, arrows with wobble — labeled inside in small typeset monospace {typography.label-sm}. And one mark of color: the vermilion {colors.tertiary} a teacher adds to the master by hand — the arrow that closes a loop, a single underline, the page numeral — once per page, never twice.

## Colors

Paper {colors.neutral}, graphite-warm ink {colors.primary} for all type and all diagram strokes, rule gray {colors.secondary} for hairlines inside content only, and the teacher's vermilion {colors.tertiary}, once per page.

## Typography

The handout's voices: {typography.display} for section titles, {typography.body-md} for prose, {typography.code} for pseudocode and traces, {typography.label-sm} for section labels, page numerals, and the words inside diagrams.

## Layout

A printed page in landscape: generous margins on all sides, the section label sitting in space at the upper-left, the numeral at the lower-right, hierarchy made entirely of scale and breathing room the way a handout makes it.

### exemplar arm: constraint

## Overview

Every design decision in this deck is deduced from one hard constraint.

## Method

Every slide must survive the department photocopier — a 1985 machine that renders solid ink {colors.primary} on paper {colors.neutral} and destroys everything else. A photocopier cannot reproduce a gradient without banding, cannot hold a soft shadow, cannot keep a glow, cannot honor translucency, and turns large dark fields into smeared toner; so none of these exist anywhere in the deck. What survives copying is exactly this: typeset text, solid thin lines, and white space — so hierarchy is built from scale and breathing room, separation from blank paper and the occasional hairline {colors.secondary}, and emphasis from size, position, and nothing else. Filled backgrounds behind code or content blocks would copy as gray mud, so content sits directly on the paper. Fine uniform vector lines alias and break on the glass, but a confident hand-drawn stroke copies beautifully — which is why every diagram is drawn by hand, with the natural variation of ink, while every word stays machine-set and crisp. The one thing the copier cannot produce is added after copying: a single mark of vermilion {colors.tertiary} pressed onto each page by hand — the arrow that closes a loop, one underline, the page numeral. Because each mark costs a pass of the teacher's pen over every copy in the stack, it appears exactly once per page, and its scarcity is what makes it legible as meaning. If an element cannot survive the copier or be added by one stroke of the pen, it does not appear in this deck.

## Colors

The copier's budget: ink {colors.primary} on paper {colors.neutral}, hairline gray {colors.secondary} where a rule earns its place inside content, and the hand-added vermilion {colors.tertiary}, one mark per page.

## Typography

What the glass preserves: titles in {typography.display}, prose in {typography.body-md}, code and traces in {typography.code} set directly on the paper, metadata and diagram labels in {typography.label-sm}.

## Layout

A landscape page with generous margins, content inset and breathing, structure made of white space and scale — the only materials that copy at full fidelity.

### exemplar arm: metaphor

## Overview

This deck embodies the geometric primitive of its own subject.

## Method

The shape of agent architecture is the closed feedback loop — the arrow that returns to its origin — and the deck is built from that primitive the way its subject is. ReAct is a loop; Reflexion is a loop with memory; Plan-and-Execute is a loop with a plan node. So every architectural diagram in this deck must close back on itself: a loop is not a triangle, not a chain, not a row of three equal boxes with arrows between them — it is a cycle whose last node returns to the first, and the returning arrow is the entire point. That returning arrow is drawn in vermilion {colors.tertiary} every time it appears, because it is the single move that turns a pipeline into a controller, and the deck's one color belongs to the deck's one idea. The loop recurs as a motif the way a professor redraws the same figure on the board — small as a chapter mark on the title page, large as the central figure where it is the argument, redrawn slightly differently each time because it is drawn, not stamped: living strokes with the wobble of a hand, while every word around them stays crisply typeset {typography.body-md}. Even the deck closes on itself: the final slide redraws the opening loop at full scale, returning the audience to where they began — the structure of the talk performing the thesis of the talk. Whatever does not serve the loop's legibility — decoration, chrome, surfaces, noise — is not part of the figure and therefore not part of the deck; the loop reads against quiet paper {colors.neutral} in plain ink {colors.primary}, labeled in small monospace {typography.label-sm}, with hairlines {colors.secondary} only where a trace or chart needs a baseline.

## Colors

Ink {colors.primary} on paper {colors.neutral}; rule gray {colors.secondary} for working hairlines; vermilion {colors.tertiary} reserved for the arrow that closes each loop and at most one echo of it per slide.

## Typography

Titles in {typography.display}, prose in {typography.body-md}, traces and code in {typography.code}, node labels and page metadata in {typography.label-sm} — the typeset stillness the drawn loop moves against.

## Layout

Each landscape slide gives the loop room: generous margins, one dominant figure or text block per page, prose and diagram paired so the eye travels the cycle and returns, like the architecture it depicts.

## Output protocol

Write each requested arm as a block, exactly:

===FILE arms/<arm>.DESIGN.md===
<markdown body only — no front matter, no code fences around the block>
===END===

Requested arms: description, object, constraint, metaphor, full-spec

If the case's generic-center description is a TODO, you may additionally emit:

===FIELD genericCenter===
<one- or two-sentence description of the template default this brief will produce>
===END===

Emit only the blocks. No preamble, no commentary between blocks.
