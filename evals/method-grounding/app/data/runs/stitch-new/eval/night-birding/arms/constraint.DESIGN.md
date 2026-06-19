---
colors:
  background: "#F9F6EE" # Paper Cream
  text: "#1A1A1B" # Midnight Ink
  primary: "#1A1A1B" # Midnight Ink (Primary)
  ui-neutral: "#707372" # Field Gray
  accent: "#C53030" # Pointer Red
typography:
  - role: headings
    family: Spartan
    weight: Bold
  - role: body
    family: Century Schoolbook
    weight: Regular
  - role: labels
    family: Spartan
    weight: Medium
roundness: 0px
spacing: tight
---

## Overview
The interface is designed as if it must be produced using **1960s offset lithography**. This hard technical limitation dictates every aesthetic choice, from the lack of depth to the specific use of spot colors.

## Method
By adopting the constraints of **mid-century printing technology**, the design eliminates all digital luxuries. There are no gradients, shadows, or semi-transparent layers because these cannot be easily reproduced with solid ink on paper. Every element must be a hard-edged, solid block or a line. The system relies on "overprinting" logic, where color is used sparingly for emphasis rather than decoration. Layouts are locked into a grid that respects the physical reality of a printing plate, favoring high-density information over the fluid, airy whitespace of modern web design.

## Colors
The palette is restricted to three "inks" on a base "paper." {colors.background} is the paper itself—matte and non-reflective. {colors.text} is the primary ink used for all text and structural lines. {colors.ui-neutral} acts as a screen or a secondary ink for less critical information. {colors.accent} is a specific spot-color used for the "pointer" system, highlighting birds' identifying marks. There is no mixing of these colors to create new shades; they exist as distinct, overlapping layers.

## Typography
Type selection is governed by the need for legibility at small sizes on physical paper. {typography.headings} and {typography.labels} are used for clear, punchy identification and navigational signposting. {typography.body} provides the narrative weight of a scientific text, its serif forms helping the eye track through dense sighting logs and behavioral descriptions. The 0px roundness of the containers ensures that the type is always framed by sharp, industrial edges.

## Layout
The layout is a "locked plate" grid. Because the medium is theoretically physical, there is no "scrolling" in the fluid sense; rather, the view is a series of dense, information-packed panes. Content is organized within 1pt boxes that use {colors.text} borders. The spacing is tight and efficient, prioritizing the inclusion of data over aesthetic "breathing room," resulting in an interface that feels like a precision instrument.
