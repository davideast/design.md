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
