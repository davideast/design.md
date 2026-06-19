# Eval report — escape-from-center

Run: `runs/stitch-new` · metric: escape-from-center · model: GEMINI_3_1_PRO · tool: stitch · eval: f52128f64edc (snapshot) · stitch-sdk: 0.3.5

Adherence threshold: OKLab ΔE < 0.05 · permutations: 10,000.

Cells suffixed `+prompt` injected the DESIGN.md directly into the generation prompt; unsuffixed cells used the tool's design-system pipeline. A large gap between channels for the same arm means the design-system pipeline is flattening the prose treatment. Bold p-values < 0.05; with small n, non-significance means underpowered, not "no effect".

## Case: dc-tracks — The Tracks of Washington DC — prestige editorial publication

### Token adherence

| cell | n | palette adherence | mean ΔE to palette | specified fonts used |
|---|---|---|---|---|
| no-design-md | 2 | — | — | — |
| tokens-only | 1 | 31% | 0.066 | 100% |
| object | 1 | 54% | 0.068 | 100% |

### Inherited prohibitions and requirements (stated only in the full-spec arm, nowhere else: forbid shadows, roundedCorners, darkBackground, iconFonts)

| cell | shadows | roundedCorners | darkBackground | iconFonts | mean violations |
|---|---|---|---|---|---|
| no-design-md | 100% | 100% | 50% | 100% | 3.5 |
| tokens-only | 0% | 0% | 0% | 100% | 1.0 |
| object | 100% | 0% | 0% | 100% | 2.0 |

### Consistency and distance from the generic center

Distance measured against 2 `no-design-md` samples; **excess distance** subtracts the control's own dispersion (0.383).

| cell | intra-arm dispersion ↓ | distance from control | excess distance ↑ |
|---|---|---|---|
| no-design-md | 0.383 | — | — |
| tokens-only | — | 0.541 | 0.158 |
| object | — | 0.451 | 0.067 |

### Significance vs the description baseline (permutation tests)

| cell | baseline | Δ dist-from-control (p) | Δ violations (p) | Δ dispersion (p) |
|---|---|---|---|---|
| — | — | no description baseline in this run | | |

## Case: night-birding — Urban Nocturnal Field Guide

### Token adherence

| cell | n | palette adherence | mean ΔE to palette | specified fonts used |
|---|---|---|---|---|
| no-design-md | 2 | — | — | — |
| description | 1 | 50% | 0.063 | — |
| object | 1 | 63% | 0.063 | — |
| metaphor | 1 | 94% | 0.014 | — |

### Inherited prohibitions and requirements (stated only in the full-spec arm, nowhere else: forbid gradients, shadows, roundedCorners; require boldUses)

| cell | gradients | shadows | roundedCorners | missing-boldUses | mean violations |
|---|---|---|---|---|---|
| no-design-md | 100% | 100% | 100% | 0% | 3.0 |
| description | 0% | 0% | 0% | 0% | 0.0 |
| object | 0% | 0% | 0% | 0% | 0.0 |
| metaphor | 0% | 100% | 0% | 0% | 1.0 |

### Consistency and distance from the generic center

Distance measured against 2 `no-design-md` samples; **excess distance** subtracts the control's own dispersion (0.000).

| cell | intra-arm dispersion ↓ | distance from control | excess distance ↑ |
|---|---|---|---|
| no-design-md | 0.000 | — | — |
| description | — | 0.582 | 0.582 |
| object | — | 0.610 | 0.610 |
| metaphor | — | 0.648 | 0.648 |

### Significance vs the description baseline (permutation tests)

| cell | baseline | Δ dist-from-control (p) | Δ violations (p) | Δ dispersion (p) |
|---|---|---|---|---|
| object | description | 0.027 (—) | 0.00 (—) | — (—) |
| metaphor | description | 0.066 (—) | 1.00 (—) | — (—) |

## Case: tea-house — Kettle & Leaf — neighborhood tea house site

### Token adherence

| cell | n | palette adherence | mean ΔE to palette | specified fonts used |
|---|---|---|---|---|
| no-design-md | 2 | — | — | — |
| tokens-only | 1 | 63% | 0.056 | 100% |
| description | 1 | 60% | 0.067 | 100% |
| object | 1 | 63% | 0.054 | 100% |
| metaphor | 1 | 43% | 0.075 | 100% |

### Inherited prohibitions and requirements (stated only in the full-spec arm, nowhere else: forbid shadows, darkBackground)

| cell | shadows | darkBackground | mean violations |
|---|---|---|---|
| no-design-md | 100% | 0% | 1.0 |
| tokens-only | 0% | 0% | 0.0 |
| description | 0% | 0% | 0.0 |
| object | 0% | 0% | 0.0 |
| metaphor | 0% | 0% | 0.0 |

### Consistency and distance from the generic center

Distance measured against 2 `no-design-md` samples; **excess distance** subtracts the control's own dispersion (0.180).

| cell | intra-arm dispersion ↓ | distance from control | excess distance ↑ |
|---|---|---|---|
| no-design-md | 0.180 | — | — |
| tokens-only | — | 0.652 | 0.472 |
| description | — | 0.542 | 0.363 |
| object | — | 0.631 | 0.451 |
| metaphor | — | 0.657 | 0.477 |

### Significance vs the description baseline (permutation tests)

| cell | baseline | Δ dist-from-control (p) | Δ violations (p) | Δ dispersion (p) |
|---|---|---|---|---|
| tokens-only | description | 0.110 (—) | 0.00 (—) | — (—) |
| object | description | 0.088 (—) | 0.00 (—) | — (—) |
| metaphor | description | 0.115 (—) | 0.00 (—) | — (—) |
