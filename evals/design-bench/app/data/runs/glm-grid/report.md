# Eval report — escape-from-center

Run: `runs/glm-grid` · metric: escape-from-center · model: z-ai/glm-5.2 · tool: openrouter · eval: ba595bb2c4cf (snapshot) · stitch-sdk: 0.3.5

Adherence threshold: OKLab ΔE < 0.05 · permutations: 10,000.

Cells suffixed `+prompt` injected the DESIGN.md directly into the generation prompt; unsuffixed cells used the tool's design-system pipeline. A large gap between channels for the same arm means the design-system pipeline is flattening the prose treatment. Bold p-values < 0.05; with small n, non-significance means underpowered, not "no effect".

## Case: agent-slides — Agent Architecture — slide deck for a technical talk

### Token adherence

| cell | n | palette adherence | mean ΔE to palette | specified fonts used |
|---|---|---|---|---|
| no-design-md | 1 | — | — | — |
| tokens-only+prompt | 1 | 92% | 0.008 | 100% |
| description+prompt | 1 | 93% | 0.010 | 100% |
| object+prompt | 1 | 67% | 0.061 | 100% |
| metaphor+prompt | 1 | 97% | 0.004 | 100% |

### Inherited prohibitions and requirements (stated only in the full-spec arm, nowhere else: forbid gradients, shadows, roundedCorners, darkBackground, iconFonts)

| cell | gradients | shadows | roundedCorners | darkBackground | iconFonts | mean violations |
|---|---|---|---|---|---|---|
| no-design-md | 0% | 100% | 100% | 0% | 0% | 2.0 |
| tokens-only+prompt | 100% | 100% | 0% | 0% | 0% | 2.0 |
| description+prompt | 0% | 100% | 0% | 0% | 0% | 1.0 |
| object+prompt | 100% | 100% | 0% | 100% | 0% | 3.0 |
| metaphor+prompt | 100% | 100% | 0% | 100% | 0% | 3.0 |

### Consistency and distance from the generic center

Distance measured against 1 `no-design-md` samples; **excess distance** subtracts the control's own dispersion (—).

| cell | intra-arm dispersion ↓ | distance from control | excess distance ↑ |
|---|---|---|---|
| no-design-md | — | — | — |
| tokens-only+prompt | — | 0.414 | — |
| description+prompt | — | 0.284 | — |
| object+prompt | — | 0.379 | — |
| metaphor+prompt | — | 0.419 | — |

### Significance vs the description baseline (permutation tests)

| cell | baseline | Δ dist-from-control (p) | Δ violations (p) | Δ dispersion (p) |
|---|---|---|---|---|
| tokens-only+prompt | description+prompt | 0.130 (—) | 1.00 (—) | — (—) |
| object+prompt | description+prompt | 0.095 (—) | 2.00 (—) | — (—) |
| metaphor+prompt | description+prompt | 0.135 (—) | 2.00 (—) | — (—) |

## Case: auralis — Auralis — AI voice platform landing page

### Token adherence

| cell | n | palette adherence | mean ΔE to palette | specified fonts used |
|---|---|---|---|---|
| no-design-md | 1 | — | — | — |
| tokens-only+prompt | 1 | 75% | 0.048 | 100% |
| description+prompt | 1 | 71% | 0.055 | 100% |
| object+prompt | 1 | 86% | 0.027 | 100% |
| metaphor+prompt | 1 | 75% | 0.047 | 100% |

### Inherited prohibitions and requirements (stated only in the full-spec arm, nowhere else: forbid darkBackground; require gradients, roundedCorners, iconFonts)

| cell | darkBackground | missing-gradients | missing-roundedCorners | missing-iconFonts | mean violations |
|---|---|---|---|---|---|
| no-design-md | 0% | 0% | 0% | 100% | 1.0 |
| tokens-only+prompt | 0% | 0% | 0% | 100% | 1.0 |
| description+prompt | 100% | 0% | 0% | 100% | 2.0 |
| object+prompt | 0% | 0% | 0% | 100% | 1.0 |
| metaphor+prompt | 0% | 0% | 0% | 100% | 1.0 |

### Consistency and distance from the generic center

Distance measured against 1 `no-design-md` samples; **excess distance** subtracts the control's own dispersion (—).

| cell | intra-arm dispersion ↓ | distance from control | excess distance ↑ |
|---|---|---|---|
| no-design-md | — | — | — |
| tokens-only+prompt | — | 0.411 | — |
| description+prompt | — | 0.421 | — |
| object+prompt | — | 0.512 | — |
| metaphor+prompt | — | 0.429 | — |

### Significance vs the description baseline (permutation tests)

| cell | baseline | Δ dist-from-control (p) | Δ violations (p) | Δ dispersion (p) |
|---|---|---|---|---|
| tokens-only+prompt | description+prompt | -0.010 (—) | -1.00 (—) | — (—) |
| object+prompt | description+prompt | 0.091 (—) | -1.00 (—) | — (—) |
| metaphor+prompt | description+prompt | 0.008 (—) | -1.00 (—) | — (—) |

## Case: dc-tracks — The Tracks of Washington DC — prestige editorial publication

### Token adherence

| cell | n | palette adherence | mean ΔE to palette | specified fonts used |
|---|---|---|---|---|
| no-design-md | 1 | — | — | — |
| tokens-only+prompt | 1 | 88% | 0.010 | 100% |
| description+prompt | 1 | 100% | 0.000 | 100% |
| object+prompt | 1 | 100% | 0.000 | 100% |
| metaphor+prompt | 1 | 100% | 0.000 | 100% |

### Inherited prohibitions and requirements (stated only in the full-spec arm, nowhere else: forbid shadows, roundedCorners, darkBackground, iconFonts)

| cell | shadows | roundedCorners | darkBackground | iconFonts | mean violations |
|---|---|---|---|---|---|
| no-design-md | 0% | 100% | 0% | 0% | 1.0 |
| tokens-only+prompt | 100% | 100% | 0% | 0% | 2.0 |
| description+prompt | 0% | 0% | 0% | 0% | 0.0 |
| object+prompt | 0% | 100% | 100% | 0% | 2.0 |
| metaphor+prompt | 0% | 100% | 0% | 0% | 1.0 |

### Consistency and distance from the generic center

Distance measured against 1 `no-design-md` samples; **excess distance** subtracts the control's own dispersion (—).

| cell | intra-arm dispersion ↓ | distance from control | excess distance ↑ |
|---|---|---|---|
| no-design-md | — | — | — |
| tokens-only+prompt | — | 0.488 | — |
| description+prompt | — | 0.507 | — |
| object+prompt | — | 0.451 | — |
| metaphor+prompt | — | 0.481 | — |

### Significance vs the description baseline (permutation tests)

| cell | baseline | Δ dist-from-control (p) | Δ violations (p) | Δ dispersion (p) |
|---|---|---|---|---|
| tokens-only+prompt | description+prompt | -0.019 (—) | 2.00 (—) | — (—) |
| object+prompt | description+prompt | -0.057 (—) | 2.00 (—) | — (—) |
| metaphor+prompt | description+prompt | -0.026 (—) | 1.00 (—) | — (—) |

## Case: night-birding — Urban Nocturnal Field Guide

### Token adherence

| cell | n | palette adherence | mean ΔE to palette | specified fonts used |
|---|---|---|---|---|
| no-design-md | 1 | — | — | — |
| tokens-only+prompt | 1 | 100% | 0.000 | — |
| description+prompt | 1 | 100% | 0.000 | — |
| object+prompt | 1 | 100% | 0.000 | — |
| metaphor+prompt | 1 | 100% | 0.000 | — |

### Inherited prohibitions and requirements (stated only in the full-spec arm, nowhere else: forbid gradients, shadows, roundedCorners; require boldUses)

| cell | gradients | shadows | roundedCorners | missing-boldUses | mean violations |
|---|---|---|---|---|---|
| no-design-md | 100% | 100% | 100% | 100% | 4.0 |
| tokens-only+prompt | 0% | 0% | 0% | 0% | 0.0 |
| description+prompt | 0% | 0% | 0% | 0% | 0.0 |
| object+prompt | 100% | 100% | 0% | 0% | 2.0 |
| metaphor+prompt | 100% | 100% | 100% | 0% | 3.0 |

### Consistency and distance from the generic center

Distance measured against 1 `no-design-md` samples; **excess distance** subtracts the control's own dispersion (—).

| cell | intra-arm dispersion ↓ | distance from control | excess distance ↑ |
|---|---|---|---|
| no-design-md | — | — | — |
| tokens-only+prompt | — | 0.698 | — |
| description+prompt | — | 0.701 | — |
| object+prompt | — | 0.539 | — |
| metaphor+prompt | — | 0.497 | — |

### Significance vs the description baseline (permutation tests)

| cell | baseline | Δ dist-from-control (p) | Δ violations (p) | Δ dispersion (p) |
|---|---|---|---|---|
| tokens-only+prompt | description+prompt | -0.003 (—) | 0.00 (—) | — (—) |
| object+prompt | description+prompt | -0.162 (—) | 2.00 (—) | — (—) |
| metaphor+prompt | description+prompt | -0.204 (—) | 3.00 (—) | — (—) |

## Case: tea-house — Kettle & Leaf — neighborhood tea house site

### Token adherence

| cell | n | palette adherence | mean ΔE to palette | specified fonts used |
|---|---|---|---|---|
| no-design-md | 1 | — | — | — |
| tokens-only+prompt | 1 | 100% | 0.000 | 100% |
| object+prompt | 1 | 100% | 0.000 | 100% |
| metaphor+prompt | 1 | 100% | 0.000 | 100% |

### Inherited prohibitions and requirements (stated only in the full-spec arm, nowhere else: forbid shadows, darkBackground)

| cell | shadows | darkBackground | mean violations |
|---|---|---|---|
| no-design-md | 0% | 0% | 0.0 |
| tokens-only+prompt | 0% | 0% | 0.0 |
| object+prompt | 0% | 0% | 0.0 |
| metaphor+prompt | 0% | 0% | 0.0 |

### Consistency and distance from the generic center

Distance measured against 1 `no-design-md` samples; **excess distance** subtracts the control's own dispersion (—).

| cell | intra-arm dispersion ↓ | distance from control | excess distance ↑ |
|---|---|---|---|
| no-design-md | — | — | — |
| tokens-only+prompt | — | 0.407 | — |
| object+prompt | — | 0.397 | — |
| metaphor+prompt | — | 0.325 | — |

### Significance vs the description baseline (permutation tests)

| cell | baseline | Δ dist-from-control (p) | Δ violations (p) | Δ dispersion (p) |
|---|---|---|---|---|
| — | — | no description baseline in this run | | |
