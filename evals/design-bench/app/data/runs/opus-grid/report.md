# Eval report — escape-from-center

Run: `runs/opus-grid` · metric: escape-from-center · model: anthropic/claude-opus-4.8 · tool: openrouter · eval: ba595bb2c4cf (snapshot) · stitch-sdk: 0.3.5

Adherence threshold: OKLab ΔE < 0.05 · permutations: 10,000.

Cells suffixed `+prompt` injected the DESIGN.md directly into the generation prompt; unsuffixed cells used the tool's design-system pipeline. A large gap between channels for the same arm means the design-system pipeline is flattening the prose treatment. Bold p-values < 0.05; with small n, non-significance means underpowered, not "no effect".

## Case: agent-slides — Agent Architecture — slide deck for a technical talk

### Token adherence

| cell | n | palette adherence | mean ΔE to palette | specified fonts used |
|---|---|---|---|---|
| no-design-md | 1 | — | — | — |
| tokens-only+prompt | 1 | 90% | 0.007 | 100% |
| description+prompt | 1 | 100% | 0.000 | 100% |
| object+prompt | 1 | 67% | 0.052 | 100% |
| metaphor+prompt | 1 | 100% | 0.000 | 100% |

### Inherited prohibitions and requirements (stated only in the full-spec arm, nowhere else: forbid gradients, shadows, roundedCorners, darkBackground, iconFonts)

| cell | gradients | shadows | roundedCorners | darkBackground | iconFonts | mean violations |
|---|---|---|---|---|---|---|
| no-design-md | 0% | 100% | 0% | 100% | 0% | 2.0 |
| tokens-only+prompt | 0% | 0% | 0% | 0% | 0% | 0.0 |
| description+prompt | 0% | 100% | 0% | 0% | 0% | 1.0 |
| object+prompt | 0% | 100% | 0% | 0% | 0% | 1.0 |
| metaphor+prompt | 0% | 0% | 0% | 0% | 0% | 0.0 |

### Consistency and distance from the generic center

Distance measured against 1 `no-design-md` samples; **excess distance** subtracts the control's own dispersion (—).

| cell | intra-arm dispersion ↓ | distance from control | excess distance ↑ |
|---|---|---|---|
| no-design-md | — | — | — |
| tokens-only+prompt | — | 0.360 | — |
| description+prompt | — | 0.274 | — |
| object+prompt | — | 0.264 | — |
| metaphor+prompt | — | 0.369 | — |

### Significance vs the description baseline (permutation tests)

| cell | baseline | Δ dist-from-control (p) | Δ violations (p) | Δ dispersion (p) |
|---|---|---|---|---|
| tokens-only+prompt | description+prompt | 0.086 (—) | -1.00 (—) | — (—) |
| object+prompt | description+prompt | -0.010 (—) | 0.00 (—) | — (—) |
| metaphor+prompt | description+prompt | 0.095 (—) | -1.00 (—) | — (—) |

## Case: auralis — Auralis — AI voice platform landing page

### Token adherence

| cell | n | palette adherence | mean ΔE to palette | specified fonts used |
|---|---|---|---|---|
| no-design-md | 1 | — | — | — |
| tokens-only+prompt | 1 | 63% | 0.069 | 100% |
| description+prompt | 1 | 83% | 0.041 | 100% |
| object+prompt | 1 | 70% | 0.052 | 100% |
| metaphor+prompt | 1 | 71% | 0.049 | 100% |

### Inherited prohibitions and requirements (stated only in the full-spec arm, nowhere else: forbid darkBackground; require gradients, roundedCorners, iconFonts)

| cell | darkBackground | missing-gradients | missing-roundedCorners | missing-iconFonts | mean violations |
|---|---|---|---|---|---|
| no-design-md | 100% | 0% | 0% | 100% | 2.0 |
| tokens-only+prompt | 0% | 0% | 0% | 100% | 1.0 |
| description+prompt | 0% | 0% | 100% | 100% | 2.0 |
| object+prompt | 0% | 0% | 100% | 100% | 2.0 |
| metaphor+prompt | 0% | 0% | 100% | 100% | 2.0 |

### Consistency and distance from the generic center

Distance measured against 1 `no-design-md` samples; **excess distance** subtracts the control's own dispersion (—).

| cell | intra-arm dispersion ↓ | distance from control | excess distance ↑ |
|---|---|---|---|
| no-design-md | — | — | — |
| tokens-only+prompt | — | 0.426 | — |
| description+prompt | — | 0.534 | — |
| object+prompt | — | 0.451 | — |
| metaphor+prompt | — | 0.461 | — |

### Significance vs the description baseline (permutation tests)

| cell | baseline | Δ dist-from-control (p) | Δ violations (p) | Δ dispersion (p) |
|---|---|---|---|---|
| tokens-only+prompt | description+prompt | -0.108 (—) | -1.00 (—) | — (—) |
| object+prompt | description+prompt | -0.082 (—) | 0.00 (—) | — (—) |
| metaphor+prompt | description+prompt | -0.073 (—) | 0.00 (—) | — (—) |

## Case: dc-tracks — The Tracks of Washington DC — prestige editorial publication

### Token adherence

| cell | n | palette adherence | mean ΔE to palette | specified fonts used |
|---|---|---|---|---|
| no-design-md | 1 | — | — | — |
| tokens-only+prompt | 1 | 81% | 0.022 | 100% |
| description+prompt | 1 | 72% | 0.025 | 100% |
| object+prompt | 1 | 100% | 0.000 | 100% |
| metaphor+prompt | 1 | 78% | 0.020 | 100% |

### Inherited prohibitions and requirements (stated only in the full-spec arm, nowhere else: forbid shadows, roundedCorners, darkBackground, iconFonts)

| cell | shadows | roundedCorners | darkBackground | iconFonts | mean violations |
|---|---|---|---|---|---|
| no-design-md | 0% | 0% | 0% | 0% | 0.0 |
| tokens-only+prompt | 0% | 100% | 100% | 0% | 2.0 |
| description+prompt | 0% | 100% | 0% | 0% | 1.0 |
| object+prompt | 0% | 0% | 0% | 0% | 0.0 |
| metaphor+prompt | 0% | 0% | 0% | 0% | 0.0 |

### Consistency and distance from the generic center

Distance measured against 1 `no-design-md` samples; **excess distance** subtracts the control's own dispersion (—).

| cell | intra-arm dispersion ↓ | distance from control | excess distance ↑ |
|---|---|---|---|
| no-design-md | — | — | — |
| tokens-only+prompt | — | 0.310 | — |
| description+prompt | — | 0.335 | — |
| object+prompt | — | 0.356 | — |
| metaphor+prompt | — | 0.267 | — |

### Significance vs the description baseline (permutation tests)

| cell | baseline | Δ dist-from-control (p) | Δ violations (p) | Δ dispersion (p) |
|---|---|---|---|---|
| tokens-only+prompt | description+prompt | -0.026 (—) | 1.00 (—) | — (—) |
| object+prompt | description+prompt | 0.020 (—) | -1.00 (—) | — (—) |
| metaphor+prompt | description+prompt | -0.069 (—) | -1.00 (—) | — (—) |

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
| no-design-md | 0% | 0% | 0% | 0% | 0.0 |
| tokens-only+prompt | 0% | 0% | 0% | 0% | 0.0 |
| description+prompt | 0% | 0% | 0% | 0% | 0.0 |
| object+prompt | 0% | 0% | 0% | 0% | 0.0 |
| metaphor+prompt | 0% | 0% | 0% | 0% | 0.0 |

### Consistency and distance from the generic center

Distance measured against 1 `no-design-md` samples; **excess distance** subtracts the control's own dispersion (—).

| cell | intra-arm dispersion ↓ | distance from control | excess distance ↑ |
|---|---|---|---|
| no-design-md | — | — | — |
| tokens-only+prompt | — | 0.257 | — |
| description+prompt | — | 0.309 | — |
| object+prompt | — | 0.317 | — |
| metaphor+prompt | — | 0.289 | — |

### Significance vs the description baseline (permutation tests)

| cell | baseline | Δ dist-from-control (p) | Δ violations (p) | Δ dispersion (p) |
|---|---|---|---|---|
| tokens-only+prompt | description+prompt | -0.052 (—) | 0.00 (—) | — (—) |
| object+prompt | description+prompt | 0.008 (—) | 0.00 (—) | — (—) |
| metaphor+prompt | description+prompt | -0.020 (—) | 0.00 (—) | — (—) |

## Case: tea-house — Kettle & Leaf — neighborhood tea house site

### Token adherence

| cell | n | palette adherence | mean ΔE to palette | specified fonts used |
|---|---|---|---|---|
| no-design-md | 1 | — | — | — |
| tokens-only+prompt | 1 | 80% | 0.019 | 100% |
| description+prompt | 1 | 100% | 0.000 | 100% |
| object+prompt | 1 | 100% | 0.000 | 100% |
| metaphor+prompt | 1 | 100% | 0.000 | 100% |

### Inherited prohibitions and requirements (stated only in the full-spec arm, nowhere else: forbid shadows, darkBackground)

| cell | shadows | darkBackground | mean violations |
|---|---|---|---|
| no-design-md | 0% | 0% | 0.0 |
| tokens-only+prompt | 0% | 0% | 0.0 |
| description+prompt | 0% | 0% | 0.0 |
| object+prompt | 0% | 0% | 0.0 |
| metaphor+prompt | 0% | 0% | 0.0 |

### Consistency and distance from the generic center

Distance measured against 1 `no-design-md` samples; **excess distance** subtracts the control's own dispersion (—).

| cell | intra-arm dispersion ↓ | distance from control | excess distance ↑ |
|---|---|---|---|
| no-design-md | — | — | — |
| tokens-only+prompt | — | 0.272 | — |
| description+prompt | — | 0.291 | — |
| object+prompt | — | 0.250 | — |
| metaphor+prompt | — | 0.321 | — |

### Significance vs the description baseline (permutation tests)

| cell | baseline | Δ dist-from-control (p) | Δ violations (p) | Δ dispersion (p) |
|---|---|---|---|---|
| tokens-only+prompt | description+prompt | -0.019 (—) | 0.00 (—) | — (—) |
| object+prompt | description+prompt | -0.041 (—) | 0.00 (—) | — (—) |
| metaphor+prompt | description+prompt | 0.031 (—) | 0.00 (—) | — (—) |
