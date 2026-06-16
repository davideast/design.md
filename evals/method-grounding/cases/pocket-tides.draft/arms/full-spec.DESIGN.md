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
Pocket Tides is a high-performance maritime instrument designed for the rugged, technical environment of Ocean Beach. It rejects the soft, consumer-grade aesthetics of modern weather apps in favor of a "Sea-Hardened" visual system built on high-contrast modularity, industrial rule-work, and mechanical precision.

## Design Principles
- **Instrument-Grade Clarity:** Every data point must be legible in a single glance under harsh glare.
- **Structural Integrity:** The interface should feel as though it were machined from a single block of material, with components "bolted" or "etched" into place.
- **Zero Ambiguity:** Use line-weights and stark color blocks instead of gradients or shadows to establish hierarchy.

## Visual Rules
- **The Border System:** Every functional module (The Chart, The Environment Stats, The Outlook Table) must be bounded by a 2px solid {colors.primary} border. Internal dividers within modules should use a 1px {colors.primary} rule.
- **The Palette:** Use {colors.neutral} for the main canvas. Use {colors.primary} for all structural lines and primary text. {colors.secondary} is for labels and secondary data. {colors.tertiary} is reserved solely for the "Paddle Out" recommendation and the "Current Status" indicator.
- **Typography:** Headlines in {typography.headline-lg} should always be uppercase to emphasize the industrial "stamped" feel. Data tables in the 5-day outlook must use {typography.label-sm} to maintain a technical, monospaced alignment.

## Component Specifications
- **Tide Chart:** A sharp, 2px {colors.primary} line on a {colors.neutral} background. No fills under the curve. The current time is marked by a vertical dashed rule.
- **5-Day Outlook:** A rigid grid where headers are filled with {colors.secondary} and white text, and data rows are {colors.neutral} with {colors.primary} text.
- **Paddle Out Window:** This section should be encased in a thick {colors.tertiary} border to act as a primary call-to-action.

## Do's and Don'ts
- **Do** use solid blocks of color for emphasis.
- **Do** align all elements to a strict 8px baseline grid.
- **Do** treat numerical data with a monospaced font ({typography.label-sm}).
- **Don't** use any rounded corners; all joints must be 90-degree angles.
- **Don't** use drop shadows, glows, or any effect that suggests depth.
- **Don't** use soft grays or pastel tones; keep the contrast ratio at its maximum.
