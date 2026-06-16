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
This design for Pocket Tides is governed by a strict "Hard Cell" constraint: every individual piece of information and every structural module must be fully enclosed in a solid {colors.primary} border. There is no open space in this interface; the ocean's data is literally "caged" within a rigid, continuous grid.

## Method
The UI is a closed system of interlocking cells. In this method, grouping is never achieved through proximity or white space, but only through the containment of lines. When two data points are related, they share a common border; when they are separate, they are partitioned by a double-weight rule. This creates an aesthetic of extreme structural integrity, resembling a technical ledger or a surveyor’s data sheet. The "Hard Cell" forces a total lack of transparency and layering, ensuring that the surfer’s focus is locked onto a singular, flat plane of information where nothing is hidden or decorative.

## Colors
Color is used as a functional filler within the grid. {colors.primary} is the essential skeleton of the interface, forming every line and border. {colors.neutral} is the "ink" of the cells, providing a clean canvas for the data. {colors.secondary} fills the "label" cells to distinguish them from the "value" cells, creating a systematic alternating pattern. {colors.tertiary} is used sparingly but aggressively to fill specific cells that contain high-priority surf windows, turning those boxes into high-visibility "warning" blocks.

## Typography
Typography must fight for space within its assigned cells. {typography.headline-lg} is used for the current tide height, stretching to fill the width of its border. {typography.body-md} carries the paddle-out text, wrapped tightly within a primary cell. {typography.label-sm} is the workhorse for the 5-day outlook table, where each day, time, and height is granted its own individual box, resulting in a dense, monospaced matrix of maritime data.

## Layout
The layout is a single, unbroken column of partitioned cells that spans the width of the screen. The tide chart is not a floating graphic but is embedded within its own large, rectangular cell. Environmental data like sunrise and sunset are paired in side-by-side cells that share a center spine. The 5-day outlook appears as a perfectly uniform grid, where every row and column is defined by a sharp {colors.primary} stroke, leaving no "leaked" space at the margins.
