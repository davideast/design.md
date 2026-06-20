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
This design is a digitized mid-century scientific manual, specifically a field guide for the pocket. It rejects modern digital "slickness" in favor of the physical constraints of 1960s offset printing on matte paper stock.

## Method
The interface is grounded in the **Peterson Pointer System**. Every identification task is aided by small, sharp red arrows—{colors.accent}—that physically call out specific features within illustrations or text blocks. The visual language is purely diagrammatic; photography is replaced by high-contrast line art and silhouettes. The system behaves like a scan of a durable, authoritative tool rather than a standard mobile application.

## Colors
The palette is limited to a high-contrast, functional set. The background is a warm, unbleached {colors.background} (Paper Cream), providing a soft but clear canvas. Text and primary diagrams are rendered in {colors.text} (Midnight Ink). Interactive labels and secondary data use {colors.ui-neutral} (Field Gray). The only high-chroma element is the {colors.accent} (Pointer Red), reserved strictly for callouts and critical field marks.

## Typography
The type system uses a "Book-as-Tool" hierarchy. Headings and functional labels are set in {typography.headings}, providing a clean, modernistic industrial feel. Body text and sighting logs use {typography.body}, a serif face that suggests the weight of academic authority and ensures legibility in dense, multi-column blocks of information.

## Layout
The grid is utilitarian and high-density, maximizing the information per square inch. Information is boxed in by 1pt keylines with sharp 0px corners, creating a rigid, compartmentalized structure. There are no floating elements; every component is locked into a fixed position on the grid.

## Do's and Don'ts
### Do
- Use sharp, 1pt borders to define content areas.
- Use {colors.accent} pointers to indicate specific data points or field marks.
- Maintain high information density, preferring lists and grids over large empty spaces.
- Present imagery as line-art silhouettes in {colors.text}.

### Don't
- Use rounded corners; every edge must be a sharp 90-degree angle.
- Use shadows, gradients, or any effect that suggests digital depth.
- Use photography or soft-focus illustrations.
- Introduce decorative colors outside the functional palette.
