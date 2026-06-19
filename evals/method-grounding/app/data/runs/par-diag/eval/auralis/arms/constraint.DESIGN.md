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

Every design decision on this page is deduced from one hard rule.

## Method

Color may exist only where sound is being rendered. Auralis makes the digital sound human, so the page enforces the product's own physics: silence is achromatic, and sound is color. The page at rest is ink {colors.primary} on warm off-white {colors.neutral} — headlines, navigation, buttons, borders {colors.outline-muted}, supporting grey {colors.secondary} — a completely quiet monochrome field. Wherever the product is actually rendering audio, and only there, color floods in: the demo panel's preview area blooms with a vivid organic cloud anchored in purple {colors.tertiary} bleeding into cerulean, cyan, and pink — pigment dropped into still water, luminous on its light surface — and the dashboard's waveform pulses in the same family. Nothing else on the page may be chromatic: no tinted hero, no colored section backgrounds, no accent links, because nothing else is making sound. The rule deduces the rest of the system. Sound has no corners — a wave is continuous — so every interactive element is a full capsule {rounded.full} and every container curves {rounded.lg}; a hard 90° corner would be a click in the signal path. An anechoic page has no reverb, so there are no drop shadows — surfaces meet by hairline seam {colors.outline-muted} and tonal step {colors.surface-elevated}, with a single permitted exception: the demo panel, the one object actually emitting, may cast one barely-perceptible shadow (about 4% opacity) the way a speaker cabinet sits on its stand. And a silent room has one voice, so the page has one typeface at every size — tight, dense headlines {typography.h1}, plain body {typography.body-md}, tracked uppercase labels {typography.label-caps} — because a second family would be crosstalk. If an element is not rendering sound, it stays silent: monochrome, flat, capsule-edged, waiting.

## Colors

The rule's budget: ink {colors.primary} on off-white {colors.neutral}, recessive grey {colors.secondary}, seam grey {colors.outline-muted}, white modules {colors.surface-elevated} — and chroma {colors.tertiary} with its blues, cyans, and pinks, only where audio renders.

## Typography

One voice: {typography.h1} and {typography.h2} for statements, {typography.body-md} for prose, {typography.label-caps} for technical labels, {typography.button} for controls.

## Layout

Quiet structure: a strict grid, generous silent margins between sections, every surface flat and seamed — so that the two places where color sounds are unmissable.
