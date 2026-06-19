---
version: alpha
name: Agent Architecture
colors:
  primary: '#1E1A14'
  secondary: '#B8B0A2'
  tertiary: '#C3402A'
  neutral: '#F4F0E4'
typography:
  display:
    fontFamily: Fraunces
    fontSize: 54px
    fontWeight: 500
    lineHeight: 1.1
    letterSpacing: 0.01em
  body-md:
    fontFamily: Source Serif 4
    fontSize: 17px
    fontWeight: 400
    lineHeight: 1.62
  code:
    fontFamily: IBM Plex Mono
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.5
  label-sm:
    fontFamily: IBM Plex Mono
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
---

## Overview

Each slide looks like a single page of a graduate CS lecture handout in the tradition of Patrick Winston's 6.034, SICP, or the original CS229 PDFs — photocopied that morning, diagram-heavy, one teacher's voice, intellectually hospitable, designed to be followed with a pen in hand. The deck reads on flip-through as a sequence of handout pages, not presentation slides: the audience leaves with something they could photocopy, fold in half, and annotate on the train home.

## Method

The reference object is the handout page; the recurring geometric primitive is the closed feedback loop — the arrow that returns to its origin. ReAct is a loop; Reflexion is a loop with memory; Plan-and-Execute is a loop with a plan node. Every architectural diagram must close back on itself: a loop is not a triangle, not a chain — it is a closed cycle where the last node's arrow returns to the first. The hand-drawn loop motif recurs across the deck — small as a chapter mark on the title slide, large where it is the central figure — slightly redrawn each time, the way a professor redraws it on the board.

## Colors

Canvas: handout paper {colors.neutral} — the off-white of warmed xerox stock. Ink: graphite-warm {colors.primary}, never pure black, carrying all typography, all rules, all diagram strokes. Single accent: vermilion {colors.tertiary}, used only for the closing feedback arrow in every loop diagram, for a single hand-drawn underline beneath one emphasized term per slide, and for the page numeral — once per slide, never twice; its scarcity is the entire reason it carries meaning. Muted graphite {colors.secondary} for hairline rules where they appear inside content. No other colors anywhere; if a second accent or soft secondary color suggests itself, the answer is no.

## Typography

Five roles, each defined by register and function. The display serif {typography.display} carries slide titles — display-class, high stroke contrast, set at Regular or Medium with slightly opened letter-spacing, never Bold at display sizes; titles read like handout section heads (§ 3. The Observe Step), not magazine covers. The text serif {typography.body-md} carries body prose at a generous line height with measure capped near 60–65ch, ranged-left, never justified. Monospace {typography.code} is first-class: pseudocode, tool names, state labels (OBSERVE, THINK, ACT), inline references like tool.search() — sitting on the page like prose, same ink, no card, no fill, no syntax highlighting beyond optional bold keywords. Italic of the text serif carries definitions, margin notes, and figure captions (Fig. 1. The basic loop…). Small tracked uppercase monospace {typography.label-sm} carries slide numerals, section labels, and figure references, with lowercase Roman numerals where they fit the register (§ iii).

## Layout

Landscape pages with a generous outer margin on all sides — content sits inset, roughly two or three lines of body text of breathing room per side, and blank margin is correct. The section label (§ 2. A WORKED TRACE) anchors to the upper-left of the page margin in small tracked uppercase monospace; the page numeral (§ iii / xxiv) anchors to the lower-right; neither is underlined by a rule — both sit in space. Hierarchy comes from typographic scale and breathing room, not containers, fills, or rules. The title slide announces: the title dominant (cap height around 1/8 to 1/6 of slide height), left-aligned, optical-centered; the standfirst beneath in italic at roughly a quarter of the title's size; the loop motif as a small margin mark above the title block; speaker metadata in monospace at the corners — the cover sheet of a serious document, not a content slide with a big heading.

## Diagrams

Diagrams are hand-drawn-feeling: stroke weight varies slightly along each line; corners of boxes do not perfectly meet, with small gaps where lines almost join; arrows wobble; circles oval slightly; arrowheads are simple two-line chevrons, not filled triangles. If a diagram looks like clean SVG vector art, it is wrong; if it looks like a professor drew it on a chalkboard at speed and someone faithfully scanned it, it is right. Stroke weight roughly 1.5–2px with natural variation. Only the diagrams carry the hand — every typeset element, including the small monospace labels inside drawn boxes, stays crisp. The contrast between careful typeset words and sketched diagrams is the gesture. No uniform sketch filter, no marker texture, no watercolor, no Excalidraw look: human imperfection, not visual effects.

## Do's and Don'ts

- **Don't** add persistent navigation of any kind: no tab bars, no left rails, no running headers, no repeated series branding, no breadcrumbs, no table-of-contents sidebar, no Think/Act/Observe icon rail. Each slide is one page in isolation.
- **Don't** frame the page: no hairline rules under headers or above footers, no rules as page chrome. Hairlines are permitted only inside content where they perform work (separating trace steps, a chart baseline).
- **Don't** use icons. No lightbulb for Think, no lightning bolt for Act, no eye for Observe, no gear, no brain, no robot, no circuit motif, no abstract AI glyph. The only graphics are typeset words and hand-drawn diagrams.
- **Don't** use dark mode, neon, gradients, glow, drop shadows, glass surfaces, rounded corners on typeset elements, stock photography, marketing dividers, an agenda slide, a thank-you slide, a Q&A slide, an oversized cover title, or the centered-headline-with-subhead SaaS convention.
- **Don't** use sans-serif anywhere. No Inter, no geometric or humanist sans. Titles, body, captions are serif; the only non-serif role is the monospace for code and tracked uppercase metadata.
- **Don't** put cards or boxes around content, or filled backgrounds behind code or trace steps. Content sits directly on the paper.
- **Do** keep vermilion to one appearance per slide; **do** let pages end early — blank is correct; **do** keep diagrams drawn and words typeset, never the reverse.
