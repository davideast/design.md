---
version: alpha
name: Pocket Tides
colors:
  primary: '#0F172A'
  secondary: '#64748B'
  tertiary: '#F97316'
  neutral: '#F8FAFC'
typography:
  headline-lg:
    fontFamily: 'Roboto Condensed, sans-serif'
    fontSize: 42px
    fontWeight: 700
    lineHeight: 1.0
    letterSpacing: -0.02em
  body-md:
    fontFamily: 'Inter, sans-serif'
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.5
  label-sm:
    fontFamily: 'JetBrains Mono, monospace'
    fontSize: 12px
    fontWeight: 500
    lineHeight: 1.2
    letterSpacing: 0.05em
rounded:
  none: 0px
  sm: 2px
spacing:
  sm: 8px
  md: 16px
  lg: 32px
  xl: 64px
---

## Overview
Pocket Tides is designed as a "Shipping Manifest" for the ocean. In this metaphor, the sea is an industrial port, and the incoming and outgoing tides are massive shipments of water being tracked by a logistics manager. The interface is a high-stakes inventory of the shoreline.

## Method
The design adopts the language of maritime logistics and inventory tracking. Instead of "conditions," the app tracks "cargo status." Each section of the page is a line item in a master manifest. The tide curve is treated as a "shipment schedule," showing the volume and arrival time of the water. The surfer is the logistics foreman, deciding whether to "open the dock" (paddle out) based on the inventory levels. This framing removes any sentimentality from the beach, replacing it with a sense of industrial rhythm and the precision of a cargo manifest.

## Colors
The color palette follows the logic of a commercial shipping yard. {colors.primary} represents the heavy iron and shipping containers that dominate the landscape. {colors.neutral} is the paper of the manifest itself—stark and utilitarian. {colors.secondary} is the "supporting ink" used for serial numbers and logistical fine print. {colors.tertiary} is the high-visibility orange of a crane or a life vest, used to flag the "Active Window" when the tide is optimal for the surfer’s "operation."

## Typography
The type system reinforces the clerical nature of a manifest. {typography.headline-lg} is used for the "Manifest Number" (the tide height), presented with the authority of a stamped document. {typography.body-md} provides the "Operational Notes" for the paddle-out window. {typography.label-sm} is used for the 5-day outlook table, where timestamps and heights are organized like SKU numbers in an inventory list, emphasizing a rigid, data-first hierarchy.

## Layout
The layout is organized as a vertical stack of manifest entries. Each section is a "ledger block," with the 24-hour tide chart acting as a graphical timeline of water deliveries. The 5-day outlook is formatted as a strict, multi-column table reminiscent of a port’s arrival/departure board. Spacing is tight and efficient, as if the manifest is trying to fit a year's worth of logistics onto a single page, resulting in a dense and authoritative grid of information.
