---
version: alpha
name: Design Bench
colors:
  primary: '#6D4DE3'
  secondary: '#5B6FE0'
  tertiary: '#B45CC9'
  neutral: '#E9E9EC'
  ink: '#1C1B22'
  ink-muted: '#6B6A74'
  paper: '#FFFFFF'
  line: '#D8D8DC'
  accent-wash: '#EFEBFD'
typography:
  display:
    fontFamily: IBM Plex Sans
    fontSize: 28px
    fontWeight: 600
    lineHeight: 1.2
  body:
    fontFamily: IBM Plex Sans
    fontSize: 15px
    fontWeight: 400
    lineHeight: 1.55
  label:
    fontFamily: IBM Plex Sans
    fontSize: 12px
    fontWeight: 500
    lineHeight: 1.3
    letterSpacing: 0.04em
  data:
    fontFamily: IBM Plex Mono
    fontSize: 12.5px
    fontWeight: 400
    lineHeight: 1.5
rounded:
  sharp: 0px
  soft: 2px
spacing:
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 40px
---

## Overview

Design Bench is a tool for testing and comparing how AI design tools render the same brief. Its user is a designer judging output against an intended direction — so the interface is grounded in the one place that work has always happened: the prepress contract-proofing station, where a proof sheet sits on the easel under a neutral viewing light and is checked, mark by mark, against the approved reference. Comparison is not a feature here; it is the entire instrument.

## Method

The governing object is the proofing station, rendered precisely and then translated to software. Picture it: a proof pulled and laid on the easel; a neutral gray viewing surround chosen so no color in the room biases the eye; a loupe set down on the halftone to inspect it; a color bar of solid patches printed along the sheet's edge so density can be read, not guessed; crop marks and registration targets at the corners; a grease pencil for marking what's off; the approved reference clipped alongside for the side-by-side check. Every decision in this interface is borrowed from that bench. Where it departs from the physical original: the proofs are AI-generated screens, the loupe is a zoom, the reference is the handed design direction, and the densitometer's readings become our distance and fidelity numbers. The station is precise, neutral, and operable — a place you do exacting visual work, never a gallery and never a dashboard.

## Colors

The surround is a neutral viewing-booth gray, neutral `#E9E9EC` — deliberately not white, because color is judged against neutral gray, and this single choice sets the instrument apart from every white-canvas tool. Proof sheets sit on it as bright white paper, `#FFFFFF`. Text, rules, crop marks, and registration targets are press black, ink `#1C1B22`; densitometer labels, secondary readings, and hairline metadata drop to a muted gray, ink-muted `#6B6A74`; the thin registration and cut rules are a light line `#D8D8DC`. The one mark color is the grease pencil — a violet, primary `#6D4DE3` — reserved for the proofer's hand: the current selection, the active comparison, links, the ring of the loupe, anything the user has touched. Its faint wash, accent-wash `#EFEBFD`, sits behind what is selected. The edge color bars and swatch chips carry a small process spectrum — a blue, secondary `#5B6FE0`, and a magenta, tertiary `#B45CC9` — used only on the sheets and in swatches, never on the chrome. The generated screens hold all other color; the station around them stays neutral so the eye trusts what it sees.

## Typography

One technical type system, set in two weights of one family with a monospace for readings — the register of a job ticket and a spec sheet, not a magazine. IBM Plex Sans carries everything human: the display sizes for headings, the body for prose and controls, and small tracked labels (the kind printed beside a color bar). IBM Plex Mono is reserved strictly for measured values — densities, distances, fidelity percentages, content hashes, model identifiers — so a number always reads as a meter reading, never as the voice of the page. Monospace never sets running text. There is no serif and no second sans; the academic register and the generic-startup grotesque are both exactly what this instrument is not. Hierarchy comes from size and weight, the way a spec sheet separates a field name from its value.

## Layout

The page is a proofing easel, not a scroll. A slim top rail carries identity, the current job, and global actions, set in tracked labels. Navigation lives only in this top rail — there is no left navigation bar and no icon rail of any kind. The work sits on the neutral surround with tight, exact gutters from the spacing scale — denser than a document, more deliberate than a dashboard. The defining view is the side-by-side check: parallel renderings of one brief pinned as proof sheets at equal size with aligned baselines and a shared edge color bar, the reference among them. Controls live in a panel to the side, the way a proofer keeps loupe, densitometer, and swatch book within reach. Generated screens lead; the plain-language claim sits beneath each; the measured numbers come last in the mono reading-voice, one register down. Crop marks register the corners of each sheet so the grid feels measured, not decorative.

## Elevation & Depth

The sheets lie flat on the easel — this is paper on a surface, not floating cards. Separation is by the neutral surround `#E9E9EC` showing between white sheets `#FFFFFF` and by hairline rules in line `#D8D8DC`, not by shadow. Only the genuinely physical tools rise above the work: the loupe, a menu, a dialog cast a soft, low shadow because they sit *on* the sheet, and the easel beneath them dims under a faint ink wash. Nothing else lifts. Depth means "this is a tool resting on the page," used sparingly and only then.

## Shapes

Corners are sharp — `sharp` (0px) for sheets, color bars, crop marks, rules, and panels, because the edge of paper and the precision of a registration target are square by nature. Only interactive controls take a `soft` (2px) corner, just enough to read as pressable. The geometry is the precision of the proofing bench, not the friendly roundness of consumer software; the crosshair, the cut line, and the right angle are the vocabulary.

## Components

- **Top rail:** identity, current job, global actions, in tracked IBM Plex Sans `label`. Actions take the grease-pencil violet `#6D4DE3` on hover.
- **Proof sheet:** a white `#FFFFFF` sheet on the neutral `#E9E9EC` surround, sharp-cornered, edged with a hairline `#D8D8DC` and registered with crop marks in ink `#1C1B22`. Holds a generated screen with its caption and readings beneath.
- **Color bar:** a strip of solid patches along a sheet's edge in the process spectrum (`#6D4DE3`, `#5B6FE0`, `#B45CC9`), small density labels beneath — calibration, and the page's main ornament.
- **Loupe & selection:** the grease-pencil violet `#6D4DE3` ring and the `#EFEBFD` wash mark what the user has inspected or chosen — the one moving color in a neutral room.
- **Readings:** every number in IBM Plex Mono, paired with a plain claim in IBM Plex Sans — never a bare value.
- **Swatch book:** color shown as labeled patches, never a hex string alone.

## Do's and Don'ts

- **Do** ground every surface in the proofing bench — neutral gray surround, white proof sheets, crop marks, registration targets, edge color bars, the loupe, the grease-pencil mark. That specific iconography is the identity and the decoration at once.
- **Do** keep the surround neutral gray `#E9E9EC` and let the generated screens be the only saturated things in the room.
- **Do** reserve the violet `#6D4DE3` for the proofer's hand — selection, comparison, links, the loupe — and the blue `#5B6FE0` and magenta `#B45CC9` for color bars and swatches only.
- **Don't** default to the generic light-SaaS tool: no all-white canvas, no friendly rounded cards, no violet-on-white gradient hero, no soft drop shadows under everything. Those are the center this instrument exists to escape.
- **Don't** swing back to austerity either — no all-serif, no empty museum margins. The bench is dense, exact, and operable.
- **Don't** use serif anywhere, set running text in monospace, or let mono become the house voice — mono is only ever a meter reading.
- **Don't** use an icon vocabulary: no icon set, no icon toolbar, and above all no left navigation bar or icon rail. The interface is words and the work; navigation is text in the slim top rail only. Generation tools reflexively add icon chrome and side rails — refuse them.
- **Don't** rename the tool. It is **Design Bench**. The proofing bench shapes the room but is never named in the interface — no "ProofStation," "proof shop," "station," or other metaphor label. The grounding is felt, never quoted.
