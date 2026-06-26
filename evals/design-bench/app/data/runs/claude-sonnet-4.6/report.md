# Eval report — escape-from-center

Run: `runs/claude-sonnet-4.6` · metric: escape-from-center · model: claude-sonnet-4.6 · tool: agent · eval: ba595bb2c4cf (snapshot) · stitch-sdk: unrecorded

Adherence threshold: OKLab ΔE < 0.05 · permutations: 10,000.

Cells suffixed `+prompt` injected the DESIGN.md directly into the generation prompt; unsuffixed cells used the tool's design-system pipeline. A large gap between channels for the same arm means the design-system pipeline is flattening the prose treatment. Bold p-values < 0.05; with small n, non-significance means underpowered, not "no effect".

## Case: agent-slides — Agent Architecture — slide deck for a technical talk

### Token adherence

| cell | n | palette adherence | mean ΔE to palette | specified fonts used |
|---|---|---|---|---|
| no-design-md | 1 | — | — | — |
| tokens-only+prompt | 1 | 91% | 0.016 | 100% |
| description+prompt | 1 | 85% | 0.020 | 100% |
| object+prompt | 1 | 63% | 0.035 | 100% |
| constraint+prompt | 1 | 71% | 0.022 | 100% |
| metaphor+prompt | 1 | 72% | 0.026 | 100% |
| full-spec+prompt | 1 | 90% | 0.015 | 100% |

### Inherited prohibitions and requirements (stated only in the full-spec arm, nowhere else: forbid gradients, shadows, roundedCorners, darkBackground, iconFonts)

| cell | gradients | shadows | roundedCorners | darkBackground | iconFonts | mean violations |
|---|---|---|---|---|---|---|
| no-design-md | 100% | 0% | 100% | 100% | 0% | 3.0 |
| tokens-only+prompt | 0% | 0% | 0% | 0% | 0% | 0.0 |
| description+prompt | 0% | 0% | 0% | 0% | 0% | 0.0 |
| object+prompt | 100% | 0% | 0% | 0% | 0% | 1.0 |
| constraint+prompt | 0% | 100% | 100% | 0% | 0% | 2.0 |
| metaphor+prompt | 0% | 0% | 0% | 0% | 0% | 0.0 |
| full-spec+prompt | 0% | 100% | 100% | 0% | 0% | 2.0 |

### Consistency and distance from the generic center

Distance measured against 1 `no-design-md` samples; **excess distance** subtracts the control's own dispersion (—).

| cell | intra-arm dispersion ↓ | distance from control | excess distance ↑ |
|---|---|---|---|
| no-design-md | — | — | — |
| tokens-only+prompt | — | 0.523 | — |
| description+prompt | — | 0.524 | — |
| object+prompt | — | 0.449 | — |
| constraint+prompt | — | 0.536 | — |
| metaphor+prompt | — | 0.528 | — |
| full-spec+prompt | — | 0.609 | — |

### Significance vs the description baseline (permutation tests)

| cell | baseline | Δ dist-from-control (p) | Δ violations (p) | Δ dispersion (p) |
|---|---|---|---|---|
| tokens-only+prompt | description+prompt | -0.001 (—) | 0.00 (—) | — (—) |
| object+prompt | description+prompt | -0.076 (—) | 1.00 (—) | — (—) |
| constraint+prompt | description+prompt | 0.012 (—) | 2.00 (—) | — (—) |
| metaphor+prompt | description+prompt | 0.004 (—) | 0.00 (—) | — (—) |
| full-spec+prompt | description+prompt | 0.085 (—) | 2.00 (—) | — (—) |

## Case: auralis — Auralis — AI voice platform landing page

### Token adherence

| cell | n | palette adherence | mean ΔE to palette | specified fonts used |
|---|---|---|---|---|
| no-design-md | 1 | — | — | — |
| tokens-only+prompt | 1 | 69% | 0.064 | 100% |
| description+prompt | 1 | 67% | 0.065 | 100% |
| object+prompt | 1 | 66% | 0.066 | 100% |
| constraint+prompt | 1 | 74% | 0.050 | 100% |
| metaphor+prompt | 1 | 73% | 0.052 | 100% |
| full-spec+prompt | 1 | 63% | 0.069 | 100% |

### Inherited prohibitions and requirements (stated only in the full-spec arm, nowhere else: forbid darkBackground; require gradients, roundedCorners, iconFonts)

| cell | darkBackground | missing-gradients | missing-roundedCorners | missing-iconFonts | mean violations |
|---|---|---|---|---|---|
| no-design-md | 0% | 0% | 0% | 100% | 1.0 |
| tokens-only+prompt | 0% | 0% | 0% | 100% | 1.0 |
| description+prompt | 0% | 0% | 0% | 100% | 1.0 |
| object+prompt | 0% | 0% | 0% | 100% | 1.0 |
| constraint+prompt | 0% | 0% | 0% | 100% | 1.0 |
| metaphor+prompt | 0% | 0% | 0% | 100% | 1.0 |
| full-spec+prompt | 0% | 0% | 0% | 0% | 0.0 |

### Consistency and distance from the generic center

Distance measured against 1 `no-design-md` samples; **excess distance** subtracts the control's own dispersion (—).

| cell | intra-arm dispersion ↓ | distance from control | excess distance ↑ |
|---|---|---|---|
| no-design-md | — | — | — |
| tokens-only+prompt | — | 0.325 | — |
| description+prompt | — | 0.289 | — |
| object+prompt | — | 0.311 | — |
| constraint+prompt | — | 0.337 | — |
| metaphor+prompt | — | 0.356 | — |
| full-spec+prompt | — | 0.458 | — |

### Significance vs the description baseline (permutation tests)

| cell | baseline | Δ dist-from-control (p) | Δ violations (p) | Δ dispersion (p) |
|---|---|---|---|---|
| tokens-only+prompt | description+prompt | 0.036 (—) | 0.00 (—) | — (—) |
| object+prompt | description+prompt | 0.022 (—) | 0.00 (—) | — (—) |
| constraint+prompt | description+prompt | 0.048 (—) | 0.00 (—) | — (—) |
| metaphor+prompt | description+prompt | 0.067 (—) | 0.00 (—) | — (—) |
| full-spec+prompt | description+prompt | 0.169 (—) | -1.00 (—) | — (—) |

## Case: dc-tracks — The Tracks of Washington DC — prestige editorial publication

### Token adherence

| cell | n | palette adherence | mean ΔE to palette | specified fonts used |
|---|---|---|---|---|
| no-design-md | 1 | — | — | — |
| tokens-only+prompt | 1 | 87% | 0.014 | 100% |
| description+prompt | 1 | 86% | 0.014 | 100% |
| object+prompt | 1 | 83% | 0.020 | 100% |
| constraint+prompt | 1 | 86% | 0.016 | 100% |
| metaphor+prompt | 1 | 84% | 0.018 | 100% |
| full-spec+prompt | 1 | 85% | 0.016 | 100% |

### Inherited prohibitions and requirements (stated only in the full-spec arm, nowhere else: forbid shadows, roundedCorners, darkBackground, iconFonts)

| cell | shadows | roundedCorners | darkBackground | iconFonts | mean violations |
|---|---|---|---|---|---|
| no-design-md | 0% | 100% | 0% | 0% | 1.0 |
| tokens-only+prompt | 100% | 100% | 0% | 0% | 2.0 |
| description+prompt | 100% | 0% | 0% | 0% | 1.0 |
| object+prompt | 0% | 0% | 0% | 0% | 0.0 |
| constraint+prompt | 100% | 0% | 0% | 0% | 1.0 |
| metaphor+prompt | 100% | 0% | 0% | 0% | 1.0 |
| full-spec+prompt | 100% | 100% | 100% | 0% | 3.0 |

### Consistency and distance from the generic center

Distance measured against 1 `no-design-md` samples; **excess distance** subtracts the control's own dispersion (—).

| cell | intra-arm dispersion ↓ | distance from control | excess distance ↑ |
|---|---|---|---|
| no-design-md | — | — | — |
| tokens-only+prompt | — | 0.438 | — |
| description+prompt | — | 0.498 | — |
| object+prompt | — | 0.425 | — |
| constraint+prompt | — | 0.531 | — |
| metaphor+prompt | — | 0.535 | — |
| full-spec+prompt | — | 0.496 | — |

### Significance vs the description baseline (permutation tests)

| cell | baseline | Δ dist-from-control (p) | Δ violations (p) | Δ dispersion (p) |
|---|---|---|---|---|
| tokens-only+prompt | description+prompt | -0.060 (—) | 1.00 (—) | — (—) |
| object+prompt | description+prompt | -0.072 (—) | -1.00 (—) | — (—) |
| constraint+prompt | description+prompt | 0.033 (—) | 0.00 (—) | — (—) |
| metaphor+prompt | description+prompt | 0.037 (—) | 0.00 (—) | — (—) |
| full-spec+prompt | description+prompt | -0.001 (—) | 2.00 (—) | — (—) |

## Case: night-birding — Urban Nocturnal Field Guide

### Token adherence

| cell | n | palette adherence | mean ΔE to palette | specified fonts used |
|---|---|---|---|---|
| no-design-md | 1 | — | — | — |
| tokens-only+prompt | 1 | 100% | 0.000 | — |
| description+prompt | 1 | 100% | 0.000 | — |
| object+prompt | 1 | 100% | 0.000 | — |
| constraint+prompt | 1 | 100% | 0.000 | — |
| metaphor+prompt | 1 | 100% | 0.000 | — |
| full-spec+prompt | 1 | 100% | 0.000 | — |

### Inherited prohibitions and requirements (stated only in the full-spec arm, nowhere else: forbid gradients, shadows, roundedCorners; require boldUses)

| cell | gradients | shadows | roundedCorners | missing-boldUses | mean violations |
|---|---|---|---|---|---|
| no-design-md | 100% | 100% | 100% | 0% | 3.0 |
| tokens-only+prompt | 0% | 0% | 0% | 0% | 0.0 |
| description+prompt | 0% | 0% | 0% | 0% | 0.0 |
| object+prompt | 0% | 0% | 0% | 0% | 0.0 |
| constraint+prompt | 0% | 0% | 0% | 0% | 0.0 |
| metaphor+prompt | 100% | 0% | 0% | 0% | 1.0 |
| full-spec+prompt | 0% | 0% | 100% | 0% | 1.0 |

### Consistency and distance from the generic center

Distance measured against 1 `no-design-md` samples; **excess distance** subtracts the control's own dispersion (—).

| cell | intra-arm dispersion ↓ | distance from control | excess distance ↑ |
|---|---|---|---|
| no-design-md | — | — | — |
| tokens-only+prompt | — | 0.635 | — |
| description+prompt | — | 0.661 | — |
| object+prompt | — | 0.658 | — |
| constraint+prompt | — | 0.658 | — |
| metaphor+prompt | — | 0.569 | — |
| full-spec+prompt | — | 0.643 | — |

### Significance vs the description baseline (permutation tests)

| cell | baseline | Δ dist-from-control (p) | Δ violations (p) | Δ dispersion (p) |
|---|---|---|---|---|
| tokens-only+prompt | description+prompt | -0.026 (—) | 0.00 (—) | — (—) |
| object+prompt | description+prompt | -0.004 (—) | 0.00 (—) | — (—) |
| constraint+prompt | description+prompt | -0.004 (—) | 0.00 (—) | — (—) |
| metaphor+prompt | description+prompt | -0.092 (—) | 1.00 (—) | — (—) |
| full-spec+prompt | description+prompt | -0.018 (—) | 1.00 (—) | — (—) |

## Case: tea-house — Kettle & Leaf — neighborhood tea house site

### Token adherence

| cell | n | palette adherence | mean ΔE to palette | specified fonts used |
|---|---|---|---|---|
| no-design-md | 1 | — | — | — |
| tokens-only+prompt | 1 | 100% | 0.000 | 100% |
| description+prompt | 1 | 100% | 0.000 | 100% |
| object+prompt | 1 | 88% | 0.011 | 100% |
| constraint+prompt | 1 | 100% | 0.000 | 100% |
| metaphor+prompt | 1 | 100% | 0.000 | 100% |
| full-spec+prompt | 1 | 100% | 0.000 | 100% |

### Inherited prohibitions and requirements (stated only in the full-spec arm, nowhere else: forbid shadows, darkBackground)

| cell | shadows | darkBackground | mean violations |
|---|---|---|---|
| no-design-md | 0% | 0% | 0.0 |
| tokens-only+prompt | 0% | 0% | 0.0 |
| description+prompt | 0% | 0% | 0.0 |
| object+prompt | 0% | 0% | 0.0 |
| constraint+prompt | 0% | 0% | 0.0 |
| metaphor+prompt | 0% | 0% | 0.0 |
| full-spec+prompt | 0% | 0% | 0.0 |

### Consistency and distance from the generic center

Distance measured against 1 `no-design-md` samples; **excess distance** subtracts the control's own dispersion (—).

| cell | intra-arm dispersion ↓ | distance from control | excess distance ↑ |
|---|---|---|---|
| no-design-md | — | — | — |
| tokens-only+prompt | — | 0.346 | — |
| description+prompt | — | 0.346 | — |
| object+prompt | — | 0.347 | — |
| constraint+prompt | — | 0.346 | — |
| metaphor+prompt | — | 0.332 | — |
| full-spec+prompt | — | 0.418 | — |

### Significance vs the description baseline (permutation tests)

| cell | baseline | Δ dist-from-control (p) | Δ violations (p) | Δ dispersion (p) |
|---|---|---|---|---|
| tokens-only+prompt | description+prompt | 0.000 (—) | 0.00 (—) | — (—) |
| object+prompt | description+prompt | 0.001 (—) | 0.00 (—) | — (—) |
| constraint+prompt | description+prompt | 0.000 (—) | 0.00 (—) | — (—) |
| metaphor+prompt | description+prompt | -0.014 (—) | 0.00 (—) | — (—) |
| full-spec+prompt | description+prompt | 0.071 (—) | 0.00 (—) | — (—) |
