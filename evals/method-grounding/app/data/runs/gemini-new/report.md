# Eval report — escape-from-center

Run: `runs/gemini-new` · metric: escape-from-center · model: gemini-3-flash-preview · tool: gemini · eval: f52128f64edc (snapshot) · stitch-sdk: 0.3.5

Adherence threshold: OKLab ΔE < 0.05 · permutations: 10,000.

Cells suffixed `+prompt` injected the DESIGN.md directly into the generation prompt; unsuffixed cells used the tool's design-system pipeline. A large gap between channels for the same arm means the design-system pipeline is flattening the prose treatment. Bold p-values < 0.05; with small n, non-significance means underpowered, not "no effect".

## Case: dc-tracks — The Tracks of Washington DC — prestige editorial publication

### Token adherence

| cell | n | palette adherence | mean ΔE to palette | specified fonts used |
|---|---|---|---|---|
| no-design-md | 1 | — | — | — |
| tokens-only+prompt | 1 | 78% | 0.067 | 100% |
| description+prompt | 1 | 100% | 0.000 | 100% |
| object+prompt | 1 | 64% | 0.105 | 100% |
| metaphor+prompt | 1 | 100% | 0.000 | 100% |

### Inherited prohibitions and requirements (stated only in the full-spec arm, nowhere else: forbid shadows, roundedCorners, darkBackground, iconFonts)

| cell | shadows | roundedCorners | darkBackground | iconFonts | mean violations |
|---|---|---|---|---|---|
| no-design-md | 100% | 100% | 0% | 0% | 2.0 |
| tokens-only+prompt | 0% | 100% | 0% | 0% | 1.0 |
| description+prompt | 0% | 100% | 100% | 0% | 2.0 |
| object+prompt | 0% | 0% | 0% | 0% | 0.0 |
| metaphor+prompt | 100% | 0% | 0% | 0% | 1.0 |

### Consistency and distance from the generic center

Distance measured against 1 `no-design-md` samples; **excess distance** subtracts the control's own dispersion (—).

| cell | intra-arm dispersion ↓ | distance from control | excess distance ↑ |
|---|---|---|---|
| no-design-md | — | — | — |
| tokens-only+prompt | — | 0.399 | — |
| description+prompt | — | 0.570 | — |
| object+prompt | — | 0.534 | — |
| metaphor+prompt | — | 0.487 | — |

### Significance vs the description baseline (permutation tests)

| cell | baseline | Δ dist-from-control (p) | Δ violations (p) | Δ dispersion (p) |
|---|---|---|---|---|
| tokens-only+prompt | description+prompt | -0.171 (—) | -1.00 (—) | — (—) |
| object+prompt | description+prompt | -0.037 (—) | -2.00 (—) | — (—) |
| metaphor+prompt | description+prompt | -0.083 (—) | -1.00 (—) | — (—) |

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
| object+prompt | 100% | 0% | 0% | 0% | 1.0 |
| metaphor+prompt | 0% | 0% | 0% | 0% | 0.0 |

### Consistency and distance from the generic center

Distance measured against 1 `no-design-md` samples; **excess distance** subtracts the control's own dispersion (—).

| cell | intra-arm dispersion ↓ | distance from control | excess distance ↑ |
|---|---|---|---|
| no-design-md | — | — | — |
| tokens-only+prompt | — | 0.288 | — |
| description+prompt | — | 0.322 | — |
| object+prompt | — | 0.437 | — |
| metaphor+prompt | — | 0.302 | — |

### Significance vs the description baseline (permutation tests)

| cell | baseline | Δ dist-from-control (p) | Δ violations (p) | Δ dispersion (p) |
|---|---|---|---|---|
| tokens-only+prompt | description+prompt | -0.034 (—) | 0.00 (—) | — (—) |
| object+prompt | description+prompt | 0.115 (—) | 1.00 (—) | — (—) |
| metaphor+prompt | description+prompt | -0.020 (—) | 0.00 (—) | — (—) |

## Case: tea-house — Kettle & Leaf — neighborhood tea house site

### Token adherence

| cell | n | palette adherence | mean ΔE to palette | specified fonts used |
|---|---|---|---|---|
| no-design-md | 1 | — | — | — |
| tokens-only+prompt | 1 | 100% | 0.002 | 100% |
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
| tokens-only+prompt | — | 0.238 | — |
| description+prompt | — | 0.278 | — |
| object+prompt | — | 0.272 | — |
| metaphor+prompt | — | 0.311 | — |

### Significance vs the description baseline (permutation tests)

| cell | baseline | Δ dist-from-control (p) | Δ violations (p) | Δ dispersion (p) |
|---|---|---|---|---|
| tokens-only+prompt | description+prompt | -0.040 (—) | 0.00 (—) | — (—) |
| object+prompt | description+prompt | -0.006 (—) | 0.00 (—) | — (—) |
| metaphor+prompt | description+prompt | 0.033 (—) | 0.00 (—) | — (—) |
