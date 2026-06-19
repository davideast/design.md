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

Every design decision in this deck is deduced from one hard constraint.

## Method

Every slide must survive the department photocopier — a 1985 machine that renders solid ink {colors.primary} on paper {colors.neutral} and destroys everything else. A photocopier cannot reproduce a gradient without banding, cannot hold a soft shadow, cannot keep a glow, cannot honor translucency, and turns large dark fields into smeared toner; so none of these exist anywhere in the deck. What survives copying is exactly this: typeset text, solid thin lines, and white space — so hierarchy is built from scale and breathing room, separation from blank paper and the occasional hairline {colors.secondary}, and emphasis from size, position, and nothing else. Filled backgrounds behind code or content blocks would copy as gray mud, so content sits directly on the paper. Fine uniform vector lines alias and break on the glass, but a confident hand-drawn stroke copies beautifully — which is why every diagram is drawn by hand, with the natural variation of ink, while every word stays machine-set and crisp. The one thing the copier cannot produce is added after copying: a single mark of vermilion {colors.tertiary} pressed onto each page by hand — the arrow that closes a loop, one underline, the page numeral. Because each mark costs a pass of the teacher's pen over every copy in the stack, it appears exactly once per page, and its scarcity is what makes it legible as meaning. If an element cannot survive the copier or be added by one stroke of the pen, it does not appear in this deck.

## Colors

The copier's budget: ink {colors.primary} on paper {colors.neutral}, hairline gray {colors.secondary} where a rule earns its place inside content, and the hand-added vermilion {colors.tertiary}, one mark per page.

## Typography

What the glass preserves: titles in {typography.display}, prose in {typography.body-md}, code and traces in {typography.code} set directly on the paper, metadata and diagram labels in {typography.label-sm}.

## Layout

A landscape page with generous margins, content inset and breathing, structure made of white space and scale — the only materials that copy at full fidelity.
