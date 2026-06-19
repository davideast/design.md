---
version: alpha
name: Auralis System
colors:
  primary: '#111111'
  secondary: '#6B6B6B'
  tertiary: '#9958ff'
  neutral: '#F7F7F5'
  surface-elevated: '#ffffff'
  outline-muted: '#E5E5E3'
typography:
  h1:
    fontFamily: Geist
    fontSize: 72px
    fontWeight: 600
    lineHeight: 0.95
    letterSpacing: -0.04em
  h2:
    fontFamily: Geist
    fontSize: 42px
    fontWeight: 600
    lineHeight: 1.1
    letterSpacing: -0.02em
  body-md:
    fontFamily: Geist
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.5
  label-caps:
    fontFamily: Geist
    fontSize: 12px
    fontWeight: 600
    lineHeight: 1
    letterSpacing: 0.08em
  button:
    fontFamily: Geist
    fontSize: 14px
    fontWeight: 500
    lineHeight: 1
    letterSpacing: 0.01em
rounded:
  sm: 0.25rem
  md: 0.75rem
  lg: 1.5rem
  full: 9999px
spacing:
  sm: 8px
  md: 24px
  lg: 64px
  xl: 140px
  gutter: 24px
---

## Overview

The visual identity is "Engineered Softness" — premium, enterprise-grade aesthetics balancing technical precision with approachable editorial clarity. The aesthetic evokes high-end laboratory equipment and architectural blueprints: quiet, authoritative, structured. The design blends minimalism with glassmorphism, emphasizing structural containment through subtle 1px borders and layered containers. The page is built on asymmetric editorial composition — content leans on invisible structural rails rather than centering — with exactly three centered compositions: the hero, the platform overview heading, and the final CTA. No two sections share the same layout DNA. The brand rejects generic SaaS layout repetition, uniform section spacing, decorative illustrations, stock photography heroes, colored hero backgrounds, and anything that feels like a template.

## Colors

A quiet monochromatic base with a single vivid accent. **Primary** {colors.primary}: near-black for headlines, buttons, the nav wordmark, and the dark dashboard panel — the dominant ink. **Secondary** {colors.secondary}: warm mid-grey for body text, muted links, and anything that should recede. **Tertiary** {colors.tertiary}: vivid purple, the only chromatic color — the anchor hue of the demo panel's gradient cloud (alongside cerulean, cyan, and pink extending from it); never a background fill. **Neutral** {colors.neutral}: warm off-white page surface; cards float above it in pure white {colors.surface-elevated} with borders in {colors.outline-muted}. Accent gradients live exclusively inside the demo panel: large, soft, heavily blurred radial blobs on a light base — deep purple and magenta at the core bleeding into bright cerulean on one side and cyan/teal on the other, pink washing the lower edges — luminous and airy, like colored ink dropped into clear water viewed from above, never dark or cinematic, and never faint: the cloud dominates the panel.

## Typography

Geist exclusively; typography is structural. Headlines {typography.h1} and {typography.h2} use tight negative tracking and compressed line heights for a locked, architectural look — without negative tracking they read airy and generic. Body {typography.body-md} is always flush-left, ragged right, never centered outside the three designated compositions. ALL navigation text and section labels are UPPERCASE in {typography.label-caps} with wide tracking — the wordmark reads AURALIS, never "Auralis"; nav links read STUDIO, AGENTS, API, RESOURCES, ENTERPRISE, PRICING, never sentence-case or full product names. Buttons {typography.button} use sentence-case: "Sign up", "Contact sales" — never uppercase. Hierarchy comes from weight (600 headers, 500 labels, 400 body), never size alone.

## Layout

A strict 12-column grid, 24px gutters, max-width 1280px. Three invisible vertical rails: a left rail anchoring headings and body, a content spine of about 600px for reading, and a right float zone of about 460px for supporting text or intentional emptiness. Spacing follows a density wave — sparse sections (hero, platform overview, final CTA) at maximum padding {spacing.xl}, dense sections (demo panel, studio, agents) at moderate padding, the trust strip tightest — dense always followed by sparser. The hero is one of three centered compositions: the headline centered with two pill CTAs beneath, no sub-copy, no background, no gradient, no images — the negative space IS the design. Minimum page height around 4800px at desktop width.

## Elevation & Depth

Depth through tonal layering, not shadows: base plate, recessed panels, elevated white cards with ultra-light borders. Shadows are almost entirely absent — the single exception is the demo panel container's ultra-diffused shadow at roughly 4% opacity. Product simulations use glassmorphic workstation panels: layered translucency, backdrop blur, crisp low-opacity borders. Flat everywhere else.

## Shapes

"Soft-Industrial": rigid grid, generous radii. Primary cards at large radius {rounded.lg}; every button is a full pill {rounded.full} — mandatory, no rectangular or slightly-rounded buttons; no sharp corners anywhere; internal elements nest with tighter radii {rounded.md}.

## Components

The navigation bar is a full-width strip touching both browser edges — not a floating pill — 72px tall, fixed on scroll, neutral at 80% opacity with backdrop blur and a 1px bottom border {colors.outline-muted}. Left: the AURALIS wordmark in {typography.label-caps} at 0.2em tracking, plain text, no logo image. Center: the six uppercase links. Right: a single "Sign up" pill in primary — the bar's only filled element. Cards: white, 1px {colors.outline-muted} border, large radius, no shadow. Section labels ("AURALIS STUDIO", "AURALIS AGENTS"): label-caps above headings. Trust logos: a Material Symbols icon (24px) paired with an UPPERCASE fictional name, evenly spaced. All icons throughout the page use Material Symbols; brand identity remains purely typographic.

## Do's and Don'ts

- **Don't** add a gradient, color, image, or sub-copy to the hero — only the centered heading and two pill CTAs.
- **Don't** use sentence-case navigation or a sentence-case wordmark; **don't** use UPPERCASE button labels.
- **Don't** make the nav a floating pill, and **don't** make it static — it sticks with blur.
- **Don't** use rectangular buttons — every CTA is a full pill.
- **Don't** add shadows to cards — only the demo panel carries one.
- **Don't** center body text outside the hero, platform-overview heading, and final CTA.
- **Don't** use uniform section spacing — keep the sparse/dense wave.
- **Don't** make the dashboard a plain dark box — it needs metrics, waveform, and transport; **don't** skip the chat bubbles in the agents section.
- **Don't** use decorative illustrations, floating shapes, animated backgrounds, logo images, or lorem ipsum.
- **Don't** make the demo-panel gradient subtle, faint, dark, or moody — it is a vivid, luminous, multi-color cloud on a light surface, the visual centerpiece of the page.
