# Eval report — escape-from-center

Run: `runs/gemini-grid` · metric: escape-from-center · model: gemini-3-flash-preview · tool: gemini · eval: 5d7280c55ee4 (snapshot) · stitch-sdk: 0.3.5

Adherence threshold: OKLab ΔE < 0.05 · permutations: 10,000.

Cells suffixed `+prompt` injected the DESIGN.md directly into the generation prompt; unsuffixed cells used the tool's design-system pipeline. A large gap between channels for the same arm means the design-system pipeline is flattening the prose treatment. Bold p-values < 0.05; with small n, non-significance means underpowered, not "no effect".

## Case: agent-slides — Agent Architecture — slide deck for a technical talk

### Token adherence

| cell | n | palette adherence | mean ΔE to palette | specified fonts used |
|---|---|---|---|---|
| no-design-md | 2 | — | — | — |
| tokens-only+prompt | 1 | 100% | 0.000 | 100% |
| description+prompt | 1 | 71% | 0.045 | 100% |
| object+prompt | 1 | 80% | 0.032 | 100% |
| metaphor+prompt | 1 | 78% | 0.035 | 100% |

### Inherited prohibitions and requirements (stated only in the full-spec arm, nowhere else: forbid gradients, shadows, roundedCorners, darkBackground, iconFonts)

| cell | gradients | shadows | roundedCorners | darkBackground | iconFonts | mean violations |
|---|---|---|---|---|---|---|
| no-design-md | 0% | 0% | 100% | 0% | 0% | 1.0 |
| tokens-only+prompt | 0% | 0% | 0% | 0% | 0% | 0.0 |
| description+prompt | 0% | 100% | 0% | 0% | 0% | 1.0 |
| object+prompt | 0% | 100% | 0% | 100% | 0% | 2.0 |
| metaphor+prompt | 0% | 100% | 0% | 0% | 0% | 1.0 |

### Consistency and distance from the generic center

Distance measured against 2 `no-design-md` samples; **excess distance** subtracts the control's own dispersion (0.252).

| cell | intra-arm dispersion ↓ | distance from control | excess distance ↑ |
|---|---|---|---|
| no-design-md | 0.252 | — | — |
| tokens-only+prompt | — | 0.362 | 0.110 |
| description+prompt | — | 0.466 | 0.214 |
| object+prompt | — | 0.486 | 0.234 |
| metaphor+prompt | — | 0.514 | 0.262 |

### Significance vs the description baseline (permutation tests)

| cell | baseline | Δ dist-from-control (p) | Δ violations (p) | Δ dispersion (p) |
|---|---|---|---|---|
| tokens-only+prompt | description+prompt | -0.104 (—) | -1.00 (—) | — (—) |
| object+prompt | description+prompt | 0.020 (—) | 1.00 (—) | — (—) |
| metaphor+prompt | description+prompt | 0.048 (—) | 0.00 (—) | — (—) |

## Case: auralis — Auralis — AI voice platform landing page

### Token adherence

| cell | n | palette adherence | mean ΔE to palette | specified fonts used |
|---|---|---|---|---|
| no-design-md | 2 | — | — | — |
| tokens-only+prompt | 1 | 67% | 0.066 | 0% |
| description+prompt | 1 | 82% | 0.037 | 100% |
| object+prompt | 1 | 62% | 0.060 | 0% |
| metaphor+prompt | 1 | 57% | 0.075 | 100% |

### Inherited prohibitions and requirements (stated only in the full-spec arm, nowhere else: forbid darkBackground; require gradients, roundedCorners, iconFonts)

| cell | darkBackground | missing-gradients | missing-roundedCorners | missing-iconFonts | mean violations |
|---|---|---|---|---|---|
| no-design-md | 100% | 0% | 0% | 100% | 2.0 |
| tokens-only+prompt | 0% | 0% | 0% | 100% | 1.0 |
| description+prompt | 0% | 0% | 0% | 100% | 1.0 |
| object+prompt | 0% | 0% | 0% | 100% | 1.0 |
| metaphor+prompt | 0% | 0% | 0% | 100% | 1.0 |

### Consistency and distance from the generic center

Distance measured against 2 `no-design-md` samples; **excess distance** subtracts the control's own dispersion (0.093).

| cell | intra-arm dispersion ↓ | distance from control | excess distance ↑ |
|---|---|---|---|
| no-design-md | 0.093 | — | — |
| tokens-only+prompt | — | 0.367 | 0.274 |
| description+prompt | — | 0.330 | 0.237 |
| object+prompt | — | 0.310 | 0.216 |
| metaphor+prompt | — | 0.389 | 0.296 |

### Significance vs the description baseline (permutation tests)

| cell | baseline | Δ dist-from-control (p) | Δ violations (p) | Δ dispersion (p) |
|---|---|---|---|---|
| tokens-only+prompt | description+prompt | 0.037 (—) | 0.00 (—) | — (—) |
| object+prompt | description+prompt | -0.020 (—) | 0.00 (—) | — (—) |
| metaphor+prompt | description+prompt | 0.060 (—) | 0.00 (—) | — (—) |
