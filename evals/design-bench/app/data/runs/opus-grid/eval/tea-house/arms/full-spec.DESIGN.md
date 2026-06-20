---
version: alpha
name: Kettle & Leaf
colors:
  primary: '#1B1B1B'
  secondary: '#6E675C'
  tertiary: '#E8590C'
  neutral: '#F4EFE6'
typography:
  headline-lg:
    fontFamily: Libre Franklin
    fontSize: 44px
    fontWeight: 700
    lineHeight: 1.05
    letterSpacing: -0.01em
  body-md:
    fontFamily: Source Serif 4
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.65
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

A complete specification for the Kettle & Leaf home page, grounded in the reverse of a 1959 Blue Note LP jacket: a warm, flat, text-led broadside that reads as a printed object lying on a counter rather than a screen.

## Method

The page is the liner side of a Reid Miles–era Blue Note jacket, re-warmed and brought to tea. Bold-weighted Franklin Gothic crowds a warm paper field; the shop name and welcome are the album title and tagline; the three brewed teas are the track listing, each name set bold with origin and tasting note trailing as a credit; the owner's sourcing paragraph is the liner essay set as one confident column; the quiet-hours table and address are catalogue data; the hours and phone are the ruled credits block at the foot. Where a Blue Note front is dark, cool, and photographic, this design takes the *back* and warms it: paper field, positive ink, square printed corners, and a single warm spot in place of the cool duotone. The page lies flat on its surface — there is no element raised above another, and the only depth is the depth of reading order.

## Colors

- `{colors.neutral}` — the jacket paper; the full field and the only background anywhere.
- `{colors.primary}` — liner ink; all primary type, all rules, all tea names.
- `{colors.secondary}` — catalogue grey; the hours table, the address line, recording-date metadata, hairline rules.
- `{colors.tertiary}` — the warm spot, used at most twice on the page: a rule beneath the title and a single mark at today's date. Never as a fill, never behind type.

## Typography

- **Title role** — `{typography.headline-lg}`: the shop name and one-line welcome, top of the jacket.
- **Listing & essay role** — `{typography.body-md}`, bold weight for tea names and lead-ins, regular for tasting notes and the sourcing essay.
- **Credits role** — `{typography.label-sm}`: the quiet-hours table, the address, and the footer hours and phone, ranked and slightly tracked like ruled credits.

## Layout

- Corners are `{rounded.none}` throughout — printed card, not soft UI.
- Outer margin `{spacing.xl}`; the title clears the listing by `{spacing.lg}`; lines within a tea by `{spacing.sm}`; between teas `{spacing.md}`.
- A wide warm field: title across the top, the three-tea listing column and the liner essay sharing the middle band, the ruled credits block — hours, phone, address — pinned along the foot above a single hairline.
- Structure is made from rules and blank paper, never from raised surfaces.

## Do's and Don'ts

- **Do** keep every surface the paper field `{colors.neutral}`; let separation come from rules and white space.
- **Do** set all type positive in `{colors.primary}` at honest weights, ink on paper.
- **Do** spend `{colors.tertiary}` exactly twice, as a line and a mark — never as a panel or a button.
- **Do** square every corner and let the page sit flat on its surface.
- **Don't** raise any element above the field or imply depth between blocks.
- **Don't** reverse type out of a dark panel or place any block on a filled background.
- **Don't** introduce a second accent, a tint behind text, or a photographic hero.
