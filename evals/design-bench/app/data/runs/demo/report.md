# Eval report — escape-from-center

Run: `runs/demo` · metric: escape-from-center · model: GEMINI_3_1_PRO · tool: unrecorded · eval: 5d7280c55ee4 (snapshot) · stitch-sdk: synthetic-fixtures

Adherence threshold: OKLab ΔE < 0.05 · permutations: 10,000.

Cells suffixed `+prompt` injected the DESIGN.md directly into the generation prompt; unsuffixed cells used the tool's design-system pipeline. A large gap between channels for the same arm means the design-system pipeline is flattening the prose treatment. Bold p-values < 0.05; with small n, non-significance means underpowered, not "no effect".

## Case: agent-slides — Agent Architecture — slide deck for a technical talk

### Token adherence

| cell | n | palette adherence | mean ΔE to palette | specified fonts used |
|---|---|---|---|---|
| no-design-md | 6 | — | — | — |
| tokens-only | 4 | 58% | 0.065 | 50% |
| description | 4 | 58% | 0.074 | 50% |
| object | 4 | 100% | 0.000 | 100% |
| object+prompt | 4 | 100% | 0.000 | 100% |

### Inherited prohibitions and requirements (stated only in the full-spec arm, nowhere else: forbid gradients, shadows, roundedCorners, darkBackground, iconFonts)

| cell | gradients | shadows | roundedCorners | darkBackground | iconFonts | mean violations |
|---|---|---|---|---|---|---|
| no-design-md | 100% | 100% | 100% | 100% | 100% | 5.0 |
| tokens-only | 50% | 50% | 50% | 50% | 50% | 2.5 |
| description | 50% | 50% | 50% | 50% | 50% | 2.5 |
| object | 0% | 0% | 0% | 0% | 0% | 0.0 |
| object+prompt | 0% | 0% | 0% | 0% | 0% | 0.0 |

### Consistency and distance from the generic center

Distance measured against 6 `no-design-md` samples; **excess distance** subtracts the control's own dispersion (0.129).

| cell | intra-arm dispersion ↓ | distance from control | excess distance ↑ |
|---|---|---|---|
| no-design-md | 0.129 | — | — |
| tokens-only | 0.534 | 0.442 | 0.313 |
| description | 0.535 | 0.436 | 0.307 |
| object | 0.000 | 0.768 | 0.640 |
| object+prompt | 0.000 | 0.768 | 0.640 |

### Significance vs the description baseline (permutation tests)

| cell | baseline | Δ dist-from-control (p) | Δ violations (p) | Δ dispersion (p) |
|---|---|---|---|---|
| tokens-only | description | 0.006 (1.000) | 0.00 (1.000) | -0.001 (1.000) |
| object | description | 0.333 (0.433) | -2.50 (0.433) | -0.535 (0.434) |
| object+prompt | description | 0.333 (0.424) | -2.50 (0.426) | -0.535 (0.422) |

## Case: auralis — Auralis — AI voice platform landing page

### Token adherence

| cell | n | palette adherence | mean ΔE to palette | specified fonts used |
|---|---|---|---|---|
| no-design-md | 6 | — | — | — |
| description | 4 | 59% | 0.073 | 50% |
| object | 4 | 79% | 0.037 | 100% |
| metaphor | 4 | 79% | 0.037 | 100% |

### Inherited prohibitions and requirements (stated only in the full-spec arm, nowhere else: forbid darkBackground; require gradients, roundedCorners, iconFonts)

| cell | darkBackground | missing-gradients | missing-roundedCorners | missing-iconFonts | mean violations |
|---|---|---|---|---|---|
| no-design-md | 100% | 0% | 0% | 0% | 1.0 |
| description | 50% | 0% | 0% | 0% | 0.5 |
| object | 0% | 0% | 0% | 0% | 0.0 |
| metaphor | 0% | 0% | 0% | 0% | 0.0 |

### Consistency and distance from the generic center

Distance measured against 6 `no-design-md` samples; **excess distance** subtracts the control's own dispersion (0.094).

| cell | intra-arm dispersion ↓ | distance from control | excess distance ↑ |
|---|---|---|---|
| no-design-md | 0.094 | — | — |
| description | 0.325 | 0.269 | 0.175 |
| object | 0.000 | 0.454 | 0.360 |
| metaphor | 0.000 | 0.454 | 0.360 |

### Significance vs the description baseline (permutation tests)

| cell | baseline | Δ dist-from-control (p) | Δ violations (p) | Δ dispersion (p) |
|---|---|---|---|---|
| object | description | 0.184 (0.431) | -0.50 (0.427) | -0.325 (0.424) |
| metaphor | description | 0.184 (0.438) | -0.50 (0.432) | -0.325 (0.425) |
