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
This interface is a digital translation of a physical 1960s Peterson Field Guide. It adopts the tactile, utilitarian aesthetic of a pocket-sized manual designed for rugged field use.

## Method
The design is modeled after the **mid-century scientific manual**, a cloth-bound book printed on heavy, matte paper. The interface treats the screen as a printed page where information density is a virtue, not a flaw. Navigation mirrors the experience of thumbing through a physical index, and the visual hierarchy is established through line weights and typographical shifts rather than depth or color. The most distinctive element is the "Pointer System"—precise, sharp callouts that look like they were hand-inked onto the plates to highlight bird field marks.

## Colors
The color strategy replicates the ink-on-paper reality of vintage printing. The background is {colors.background}, representing the slightly yellowed, unbleached paper of a well-used guide. Primary information is rendered in {colors.text}, a dense black that mimics heavy offset ink. Functional metadata and UI chrome use {colors.ui-neutral}, a gray that suggests a lighter secondary ink pass. All critical focus is directed by {colors.accent}, a vibrant red used for arrows and indicators, echoing the spot-color printing common in mid-century guides.

## Typography
The system uses a pairing of industrial sans-serif and academic serif. {typography.headings} provides the functional, "labeling" feel of a museum tag or a chapter header, while {typography.body} brings the authoritative, readable quality of a printed encyclopedia. The tight spacing and bold weights in {typography.labels} help maintain clarity even in the most crowded data views.

## Layout
The layout is a rigid, multi-column grid that treats screen real estate as a scarce resource. Elements are separated by 1pt rules in {colors.text}, creating a structured environment of boxes and rows. There are no soft edges or rounded corners; everything is cut with the precision of a paper guillotine. Images are presented as high-contrast silhouettes or schematic diagrams that sit flat on the {colors.background} surface.
