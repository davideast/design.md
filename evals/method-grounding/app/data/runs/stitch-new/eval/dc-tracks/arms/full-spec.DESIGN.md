---
version: alpha
name: The Tracks of Washington DC
colors:
  primary: '#1B3026'
  secondary: '#7A6A5A'
  tertiary: '#B5491C'
  neutral: '#F2ECE2'
typography:
  headline-lg:
    fontFamily: DM Serif Display
    fontSize: 48px
    fontWeight: 400
    lineHeight: 1.1
    letterSpacing: -0.01em
  body-md:
    fontFamily: Source Serif 4
    fontSize: 17px
    fontWeight: 400
    lineHeight: 1.7
  label-sm:
    fontFamily: IBM Plex Mono
    fontSize: 12px
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: 0.12em
rounded:
  none: 0px
spacing:
  sm: 8px
  md: 16px
  lg: 32px
  xl: 64px
  gutter: 24px
---

## Overview

The oval is a monument. Every city has one — worn terracotta, chalked lanes, the same quarter-mile run ten thousand times by ten thousand different people at ten thousand different speeds. This is a publication about Washington DC's running tracks: where they are, what they feel like underfoot, who has run them, and why the oval endures as the purest form of athletic space. The aesthetic draws from the physical materials of the track itself and the tradition of serious amateur athletics — collegiate, unhurried, earned. The typography is authoritative and editorial, like the annals of an athletics club that has been meeting on the same oval since 1923. Every design decision references something real and physical, not digital.

## Colors

The palette is the track. **Primary** {colors.primary}: deep midnight forest green — near-black, the infield at first light; all text, headings, core content. **Secondary** {colors.secondary}: warm weathered slate — aged concrete, worn rubber track; captions, metadata, supporting structure. **Tertiary** {colors.tertiary}: track terracotta — the surface itself, the single vivid accent, used once per panel for CTAs and emphasis only. **Neutral** {colors.neutral}: warm cream — archival paper, a race programme from 1948, linen; the canvas. Warmth lives in the terracotta accent only — no warm backgrounds other than the cream canvas.

## Typography

**Headlines** {typography.headline-lg}: high-contrast collegiate editorial serif — authoritative, slightly condensed, the kind found on the cover of a century-old athletics club annual. Large sizes use tight tracking. Headlines are left-aligned, never centered. **Body** {typography.body-md}: a refined editorial serif for extended reading, generous line height, warm and legible — the prose of a serious running magazine. **Labels** {typography.label-sm}: monospace, all uppercase, wide tracking — like a race timing display, a lane marker, a split time on a stopwatch; section eyebrows in muted warm gray.

## Layout

Lookbook / editorial spread: full-bleed imagery dominates each panel, with text overlaying or sitting adjacent in generous margins. The layout reads vertically like turning pages in a physical catalogue — each panel its own composition, a full-width photograph paired with sparse editorial text and a single terracotta CTA. Scrolling feels deliberate, with scroll-snap behavior. Heroes are left-aligned with a split layout: large headline left (about 3/5), description and CTA right (about 2/5), both top-aligned. Section headings are never centered — inline heading and subheading on the same line, heading dark, subheading in warm gray. A subtle canvas grid of thin ruled lines runs between panels — horizontal lines at full viewport width, vertical lines within the page container — like the lane markings of the track extended onto the page: low contrast, architectural, not decorative.

## Elevation & Depth

No shadows. Depth through tonal surface variation only — warm cream panels giving way to slightly deeper cream containers. The page reads like a printed object, not a glowing screen. No drop shadows anywhere.

## Shapes

Roundedness: 0px. The track is geometry — precise arcs, exact distances, chalk-white right angles. No softness.

## Components

- **Buttons**: 0px radius, terracotta fill {colors.tertiary}, dark forest green text. One per panel — the lane marker, the single instruction. An outer ring at forest-green 10% opacity instead of a solid border.
- **Pull quotes**: large editorial serif, left-bordered with a 2px terracotta rule — the voice of a runner, a coach, a timekeeper.
- **Track labels**: monospace eyebrow style — track name, surface type, distance, ward — like the data panel beside a race course map.

## Do's and Don'ts

- **Do** use terracotta exactly once per panel — it is the lane marker, not the paint.
- **Do** let photography and typography share equal weight — this is an editorial publication, not a product page.
- **Don't** center section headings or heroes.
- **Don't** use icons on buttons.
- **Don't** use solid borders alongside shadows — outer ring at 10% opacity only.
- **Don't** use warm backgrounds other than the cream canvas.
- **Don't** round corners, add drop shadows, or let the page glow like a screen.
