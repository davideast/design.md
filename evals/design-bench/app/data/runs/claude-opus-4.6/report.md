# Eval report — escape-from-center

Run: `runs/claude-opus-4.6` · metric: escape-from-center · model: claude-opus-4.6 · tool: agent · eval: ba595bb2c4cf (snapshot) · stitch-sdk: unrecorded

Adherence threshold: OKLab ΔE < 0.05 · permutations: 10,000.

Cells suffixed `+prompt` injected the DESIGN.md directly into the generation prompt; unsuffixed cells used the tool's design-system pipeline. A large gap between channels for the same arm means the design-system pipeline is flattening the prose treatment. Bold p-values < 0.05; with small n, non-significance means underpowered, not "no effect".

## Case: agent-slides — Agent Architecture — slide deck for a technical talk

### Token adherence

| cell | n | palette adherence | mean ΔE to palette | specified fonts used |
|---|---|---|---|---|
| no-design-md | 1 | — | — | — |
| tokens-only+prompt | 1 | 99% | 0.002 | 100% |
| description+prompt | 1 | 95% | 0.006 | 100% |
| object+prompt | 1 | 100% | 0.000 | 100% |
| constraint+prompt | 1 | 100% | 0.000 | 100% |
| metaphor+prompt | 1 | 100% | 0.000 | 100% |
| full-spec+prompt | 1 | 100% | 0.000 | 100% |

### Inherited prohibitions and requirements (stated only in the full-spec arm, nowhere else: forbid gradients, shadows, roundedCorners, darkBackground, iconFonts)

| cell | gradients | shadows | roundedCorners | darkBackground | iconFonts | mean violations |
|---|---|---|---|---|---|---|
| no-design-md | 100% | 0% | 100% | 100% | 0% | 3.0 |
| tokens-only+prompt | 0% | 0% | 100% | 100% | 0% | 2.0 |
| description+prompt | 0% | 0% | 0% | 0% | 0% | 0.0 |
| object+prompt | 0% | 100% | 0% | 0% | 0% | 1.0 |
| constraint+prompt | 0% | 0% | 0% | 0% | 0% | 0.0 |
| metaphor+prompt | 0% | 0% | 100% | 100% | 0% | 2.0 |
| full-spec+prompt | 0% | 0% | 0% | 0% | 0% | 0.0 |

### Consistency and distance from the generic center

Distance measured against 1 `no-design-md` samples; **excess distance** subtracts the control's own dispersion (—).

| cell | intra-arm dispersion ↓ | distance from control | excess distance ↑ |
|---|---|---|---|
| no-design-md | — | — | — |
| tokens-only+prompt | — | 0.500 | — |
| description+prompt | — | 0.566 | — |
| object+prompt | — | 0.636 | — |
| constraint+prompt | — | 0.565 | — |
| metaphor+prompt | — | 0.499 | — |
| full-spec+prompt | — | 0.565 | — |

### Significance vs the description baseline (permutation tests)

| cell | baseline | Δ dist-from-control (p) | Δ violations (p) | Δ dispersion (p) |
|---|---|---|---|---|
| tokens-only+prompt | description+prompt | -0.067 (—) | 2.00 (—) | — (—) |
| object+prompt | description+prompt | 0.070 (—) | 1.00 (—) | — (—) |
| constraint+prompt | description+prompt | -0.002 (—) | 0.00 (—) | — (—) |
| metaphor+prompt | description+prompt | -0.067 (—) | 2.00 (—) | — (—) |
| full-spec+prompt | description+prompt | -0.002 (—) | 0.00 (—) | — (—) |

## Case: auralis — Auralis — AI voice platform landing page

### Token adherence

| cell | n | palette adherence | mean ΔE to palette | specified fonts used |
|---|---|---|---|---|
| no-design-md | 1 | — | — | — |
| tokens-only+prompt | 1 | 80% | 0.043 | 100% |
| description+prompt | 1 | 82% | 0.045 | 100% |
| object+prompt | 1 | 55% | 0.090 | 100% |
| constraint+prompt | 1 | 76% | 0.046 | 100% |
| metaphor+prompt | 1 | 53% | 0.089 | 100% |
| full-spec+prompt | 1 | 51% | 0.095 | 100% |

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
| tokens-only+prompt | — | 0.549 | — |
| description+prompt | — | 0.442 | — |
| object+prompt | — | 0.412 | — |
| constraint+prompt | — | 0.420 | — |
| metaphor+prompt | — | 0.460 | — |
| full-spec+prompt | — | 0.521 | — |

### Significance vs the description baseline (permutation tests)

| cell | baseline | Δ dist-from-control (p) | Δ violations (p) | Δ dispersion (p) |
|---|---|---|---|---|
| tokens-only+prompt | description+prompt | 0.107 (—) | 0.00 (—) | — (—) |
| object+prompt | description+prompt | -0.030 (—) | 0.00 (—) | — (—) |
| constraint+prompt | description+prompt | -0.022 (—) | 0.00 (—) | — (—) |
| metaphor+prompt | description+prompt | 0.019 (—) | 0.00 (—) | — (—) |
| full-spec+prompt | description+prompt | 0.079 (—) | -1.00 (—) | — (—) |

## Case: dc-tracks — The Tracks of Washington DC — prestige editorial publication

### Token adherence

| cell | n | palette adherence | mean ΔE to palette | specified fonts used |
|---|---|---|---|---|
| no-design-md | 1 | — | — | — |
| tokens-only+prompt | 1 | 100% | 0.000 | 100% |
| description+prompt | 1 | 100% | 0.000 | 100% |
| object+prompt | 1 | 100% | 0.000 | 100% |
| constraint+prompt | 1 | 100% | 0.000 | 100% |
| metaphor+prompt | 1 | 100% | 0.000 | 100% |
| full-spec+prompt | 1 | 100% | 0.000 | 100% |

### Inherited prohibitions and requirements (stated only in the full-spec arm, nowhere else: forbid shadows, roundedCorners, darkBackground, iconFonts)

| cell | shadows | roundedCorners | darkBackground | iconFonts | mean violations |
|---|---|---|---|---|---|
| no-design-md | 0% | 100% | 0% | 0% | 1.0 |
| tokens-only+prompt | 0% | 100% | 0% | 0% | 1.0 |
| description+prompt | 0% | 100% | 0% | 0% | 1.0 |
| object+prompt | 0% | 100% | 0% | 0% | 1.0 |
| constraint+prompt | 0% | 100% | 100% | 0% | 2.0 |
| metaphor+prompt | 0% | 0% | 100% | 0% | 1.0 |
| full-spec+prompt | 0% | 0% | 100% | 0% | 1.0 |

### Consistency and distance from the generic center

Distance measured against 1 `no-design-md` samples; **excess distance** subtracts the control's own dispersion (—).

| cell | intra-arm dispersion ↓ | distance from control | excess distance ↑ |
|---|---|---|---|
| no-design-md | — | — | — |
| tokens-only+prompt | — | 0.327 | — |
| description+prompt | — | 0.327 | — |
| object+prompt | — | 0.327 | — |
| constraint+prompt | — | 0.327 | — |
| metaphor+prompt | — | 0.398 | — |
| full-spec+prompt | — | 0.398 | — |

### Significance vs the description baseline (permutation tests)

| cell | baseline | Δ dist-from-control (p) | Δ violations (p) | Δ dispersion (p) |
|---|---|---|---|---|
| tokens-only+prompt | description+prompt | 0.000 (—) | 0.00 (—) | — (—) |
| object+prompt | description+prompt | 0.000 (—) | 0.00 (—) | — (—) |
| constraint+prompt | description+prompt | 0.000 (—) | 1.00 (—) | — (—) |
| metaphor+prompt | description+prompt | 0.071 (—) | 0.00 (—) | — (—) |
| full-spec+prompt | description+prompt | 0.071 (—) | 0.00 (—) | — (—) |

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
| no-design-md | 100% | 0% | 100% | 0% | 2.0 |
| tokens-only+prompt | 0% | 0% | 0% | 0% | 0.0 |
| description+prompt | 0% | 0% | 100% | 0% | 1.0 |
| object+prompt | 0% | 0% | 100% | 0% | 1.0 |
| constraint+prompt | 0% | 0% | 100% | 0% | 1.0 |
| metaphor+prompt | 100% | 0% | 100% | 0% | 2.0 |
| full-spec+prompt | 0% | 0% | 100% | 0% | 1.0 |

### Consistency and distance from the generic center

Distance measured against 1 `no-design-md` samples; **excess distance** subtracts the control's own dispersion (—).

| cell | intra-arm dispersion ↓ | distance from control | excess distance ↑ |
|---|---|---|---|
| no-design-md | — | — | — |
| tokens-only+prompt | — | 0.446 | — |
| description+prompt | — | 0.429 | — |
| object+prompt | — | 0.397 | — |
| constraint+prompt | — | 0.397 | — |
| metaphor+prompt | — | 0.326 | — |
| full-spec+prompt | — | 0.381 | — |

### Significance vs the description baseline (permutation tests)

| cell | baseline | Δ dist-from-control (p) | Δ violations (p) | Δ dispersion (p) |
|---|---|---|---|---|
| tokens-only+prompt | description+prompt | 0.018 (—) | -1.00 (—) | — (—) |
| object+prompt | description+prompt | -0.031 (—) | 0.00 (—) | — (—) |
| constraint+prompt | description+prompt | -0.031 (—) | 0.00 (—) | — (—) |
| metaphor+prompt | description+prompt | -0.103 (—) | 1.00 (—) | — (—) |
| full-spec+prompt | description+prompt | -0.048 (—) | 0.00 (—) | — (—) |

## Case: tea-house — Kettle & Leaf — neighborhood tea house site

### Token adherence

| cell | n | palette adherence | mean ΔE to palette | specified fonts used |
|---|---|---|---|---|
| no-design-md | 1 | — | — | — |
| tokens-only+prompt | 1 | 100% | 0.000 | 100% |
| description+prompt | 1 | 100% | 0.000 | 100% |
| object+prompt | 1 | 100% | 0.000 | 100% |
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
| tokens-only+prompt | — | 0.288 | — |
| description+prompt | — | 0.288 | — |
| object+prompt | — | 0.311 | — |
| constraint+prompt | — | 0.311 | — |
| metaphor+prompt | — | 0.311 | — |
| full-spec+prompt | — | 0.288 | — |

### Significance vs the description baseline (permutation tests)

| cell | baseline | Δ dist-from-control (p) | Δ violations (p) | Δ dispersion (p) |
|---|---|---|---|---|
| tokens-only+prompt | description+prompt | 0.000 (—) | 0.00 (—) | — (—) |
| object+prompt | description+prompt | 0.023 (—) | 0.00 (—) | — (—) |
| constraint+prompt | description+prompt | 0.023 (—) | 0.00 (—) | — (—) |
| metaphor+prompt | description+prompt | 0.023 (—) | 0.00 (—) | — (—) |
| full-spec+prompt | description+prompt | 0.000 (—) | 0.00 (—) | — (—) |
