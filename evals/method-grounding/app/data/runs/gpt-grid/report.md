# Eval report — escape-from-center

Run: `runs/gpt-grid` · metric: escape-from-center · model: openai/gpt-5.5 · tool: openrouter · eval: ba595bb2c4cf (snapshot) · stitch-sdk: 0.3.5

Adherence threshold: OKLab ΔE < 0.05 · permutations: 10,000.

Cells suffixed `+prompt` injected the DESIGN.md directly into the generation prompt; unsuffixed cells used the tool's design-system pipeline. A large gap between channels for the same arm means the design-system pipeline is flattening the prose treatment. Bold p-values < 0.05; with small n, non-significance means underpowered, not "no effect".

## Case: agent-slides — Agent Architecture — slide deck for a technical talk

### Token adherence

| cell | n | palette adherence | mean ΔE to palette | specified fonts used |
|---|---|---|---|---|
| no-design-md | 1 | — | — | — |
| tokens-only+prompt | 1 | 100% | 0.000 | 100% |
| description+prompt | 1 | 100% | 0.000 | 100% |
| object+prompt | 1 | 100% | 0.000 | 100% |
| metaphor+prompt | 1 | 100% | 0.000 | 100% |

### Inherited prohibitions and requirements (stated only in the full-spec arm, nowhere else: forbid gradients, shadows, roundedCorners, darkBackground, iconFonts)

| cell | gradients | shadows | roundedCorners | darkBackground | iconFonts | mean violations |
|---|---|---|---|---|---|---|
| no-design-md | 100% | 100% | 0% | 100% | 0% | 3.0 |
| tokens-only+prompt | 0% | 0% | 0% | 0% | 0% | 0.0 |
| description+prompt | 0% | 0% | 0% | 100% | 0% | 1.0 |
| object+prompt | 0% | 0% | 0% | 0% | 0% | 0.0 |
| metaphor+prompt | 0% | 0% | 0% | 0% | 0% | 0.0 |

### Consistency and distance from the generic center

Distance measured against 1 `no-design-md` samples; **excess distance** subtracts the control's own dispersion (—).

| cell | intra-arm dispersion ↓ | distance from control | excess distance ↑ |
|---|---|---|---|
| no-design-md | — | — | — |
| tokens-only+prompt | — | 0.565 | — |
| description+prompt | — | 0.565 | — |
| object+prompt | — | 0.565 | — |
| metaphor+prompt | — | 0.565 | — |

### Significance vs the description baseline (permutation tests)

| cell | baseline | Δ dist-from-control (p) | Δ violations (p) | Δ dispersion (p) |
|---|---|---|---|---|
| tokens-only+prompt | description+prompt | 0.000 (—) | -1.00 (—) | — (—) |
| object+prompt | description+prompt | 0.000 (—) | -1.00 (—) | — (—) |
| metaphor+prompt | description+prompt | 0.000 (—) | -1.00 (—) | — (—) |

## Case: auralis — Auralis — AI voice platform landing page

### Token adherence

| cell | n | palette adherence | mean ΔE to palette | specified fonts used |
|---|---|---|---|---|
| no-design-md | 1 | — | — | — |
| tokens-only+prompt | 1 | 100% | 0.000 | 100% |
| description+prompt | 1 | 96% | 0.006 | 100% |
| object+prompt | 1 | 83% | 0.036 | 100% |
| metaphor+prompt | 1 | 79% | 0.044 | 100% |

### Inherited prohibitions and requirements (stated only in the full-spec arm, nowhere else: forbid darkBackground; require gradients, roundedCorners, iconFonts)

| cell | darkBackground | missing-gradients | missing-roundedCorners | missing-iconFonts | mean violations |
|---|---|---|---|---|---|
| no-design-md | 0% | 0% | 0% | 100% | 1.0 |
| tokens-only+prompt | 0% | 0% | 0% | 100% | 1.0 |
| description+prompt | 0% | 0% | 0% | 100% | 1.0 |
| object+prompt | 0% | 0% | 0% | 100% | 1.0 |
| metaphor+prompt | 0% | 0% | 0% | 100% | 1.0 |

### Consistency and distance from the generic center

Distance measured against 1 `no-design-md` samples; **excess distance** subtracts the control's own dispersion (—).

| cell | intra-arm dispersion ↓ | distance from control | excess distance ↑ |
|---|---|---|---|
| no-design-md | — | — | — |
| tokens-only+prompt | — | 0.475 | — |
| description+prompt | — | 0.517 | — |
| object+prompt | — | 0.571 | — |
| metaphor+prompt | — | 0.614 | — |

### Significance vs the description baseline (permutation tests)

| cell | baseline | Δ dist-from-control (p) | Δ violations (p) | Δ dispersion (p) |
|---|---|---|---|---|
| tokens-only+prompt | description+prompt | -0.042 (—) | 0.00 (—) | — (—) |
| object+prompt | description+prompt | 0.054 (—) | 0.00 (—) | — (—) |
| metaphor+prompt | description+prompt | 0.097 (—) | 0.00 (—) | — (—) |

## Case: dc-tracks — The Tracks of Washington DC — prestige editorial publication

### Token adherence

| cell | n | palette adherence | mean ΔE to palette | specified fonts used |
|---|---|---|---|---|
| no-design-md | 1 | — | — | — |
| tokens-only+prompt | 1 | 100% | 0.000 | 100% |
| description+prompt | 1 | 100% | 0.000 | 100% |
| object+prompt | 1 | 100% | 0.000 | 100% |
| metaphor+prompt | 1 | 100% | 0.000 | 100% |

### Inherited prohibitions and requirements (stated only in the full-spec arm, nowhere else: forbid shadows, roundedCorners, darkBackground, iconFonts)

| cell | shadows | roundedCorners | darkBackground | iconFonts | mean violations |
|---|---|---|---|---|---|
| no-design-md | 100% | 100% | 0% | 0% | 2.0 |
| tokens-only+prompt | 0% | 100% | 0% | 0% | 1.0 |
| description+prompt | 0% | 100% | 0% | 0% | 1.0 |
| object+prompt | 100% | 0% | 0% | 0% | 1.0 |
| metaphor+prompt | 0% | 0% | 0% | 0% | 0.0 |

### Consistency and distance from the generic center

Distance measured against 1 `no-design-md` samples; **excess distance** subtracts the control's own dispersion (—).

| cell | intra-arm dispersion ↓ | distance from control | excess distance ↑ |
|---|---|---|---|
| no-design-md | — | — | — |
| tokens-only+prompt | — | 0.586 | — |
| description+prompt | — | 0.536 | — |
| object+prompt | — | 0.558 | — |
| metaphor+prompt | — | 0.621 | — |

### Significance vs the description baseline (permutation tests)

| cell | baseline | Δ dist-from-control (p) | Δ violations (p) | Δ dispersion (p) |
|---|---|---|---|---|
| tokens-only+prompt | description+prompt | 0.051 (—) | 0.00 (—) | — (—) |
| object+prompt | description+prompt | 0.022 (—) | 0.00 (—) | — (—) |
| metaphor+prompt | description+prompt | 0.085 (—) | -1.00 (—) | — (—) |

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
| no-design-md | 100% | 100% | 100% | 0% | 3.0 |
| tokens-only+prompt | 0% | 0% | 0% | 0% | 0.0 |
| description+prompt | 0% | 0% | 0% | 0% | 0.0 |
| object+prompt | 100% | 0% | 0% | 0% | 1.0 |
| metaphor+prompt | 100% | 0% | 0% | 0% | 1.0 |

### Consistency and distance from the generic center

Distance measured against 1 `no-design-md` samples; **excess distance** subtracts the control's own dispersion (—).

| cell | intra-arm dispersion ↓ | distance from control | excess distance ↑ |
|---|---|---|---|
| no-design-md | — | — | — |
| tokens-only+prompt | — | 0.610 | — |
| description+prompt | — | 0.624 | — |
| object+prompt | — | 0.536 | — |
| metaphor+prompt | — | 0.539 | — |

### Significance vs the description baseline (permutation tests)

| cell | baseline | Δ dist-from-control (p) | Δ violations (p) | Δ dispersion (p) |
|---|---|---|---|---|
| tokens-only+prompt | description+prompt | -0.014 (—) | 0.00 (—) | — (—) |
| object+prompt | description+prompt | -0.088 (—) | 1.00 (—) | — (—) |
| metaphor+prompt | description+prompt | -0.085 (—) | 1.00 (—) | — (—) |

## Case: tea-house — Kettle & Leaf — neighborhood tea house site

### Token adherence

| cell | n | palette adherence | mean ΔE to palette | specified fonts used |
|---|---|---|---|---|
| no-design-md | 1 | — | — | — |
| tokens-only+prompt | 1 | 100% | 0.000 | 100% |
| description+prompt | 1 | 100% | 0.000 | 100% |
| object+prompt | 1 | 100% | 0.000 | 100% |
| metaphor+prompt | 1 | 100% | 0.000 | 100% |

### Inherited prohibitions and requirements (stated only in the full-spec arm, nowhere else: forbid shadows, darkBackground)

| cell | shadows | darkBackground | mean violations |
|---|---|---|---|
| no-design-md | 100% | 0% | 1.0 |
| tokens-only+prompt | 0% | 0% | 0.0 |
| description+prompt | 0% | 0% | 0.0 |
| object+prompt | 0% | 0% | 0.0 |
| metaphor+prompt | 0% | 0% | 0.0 |

### Consistency and distance from the generic center

Distance measured against 1 `no-design-md` samples; **excess distance** subtracts the control's own dispersion (—).

| cell | intra-arm dispersion ↓ | distance from control | excess distance ↑ |
|---|---|---|---|
| no-design-md | — | — | — |
| tokens-only+prompt | — | 0.681 | — |
| description+prompt | — | 0.669 | — |
| object+prompt | — | 0.688 | — |
| metaphor+prompt | — | 0.645 | — |

### Significance vs the description baseline (permutation tests)

| cell | baseline | Δ dist-from-control (p) | Δ violations (p) | Δ dispersion (p) |
|---|---|---|---|---|
| tokens-only+prompt | description+prompt | 0.012 (—) | 0.00 (—) | — (—) |
| object+prompt | description+prompt | 0.019 (—) | 0.00 (—) | — (—) |
| metaphor+prompt | description+prompt | -0.024 (—) | 0.00 (—) | — (—) |
