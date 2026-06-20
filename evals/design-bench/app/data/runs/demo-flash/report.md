# Method-grounding eval report

Run: `runs/demo-flash` · model: GEMINI_3_FLASH · eval: 50e2cc3f1a01 (snapshot) · stitch-sdk: synthetic-fixtures · adherence threshold: OKLab ΔE < 0.05 · permutations: 10,000

Cells suffixed `+prompt` injected the DESIGN.md directly into the generation prompt; unsuffixed cells used Stitch's design-system pipeline. A large gap between channels for the same arm means the design-system pipeline is flattening the prose treatment. Bold p-values < 0.05; with small n, non-significance means underpowered, not "no effect".

## Case: auralis — Auralis — AI voice platform landing page

### Token adherence

| cell | n | palette adherence | mean ΔE to palette | specified fonts used |
|---|---|---|---|---|
| no-design-md | 4 | — | — | — |
| description | 3 | 52% | 0.085 | 33% |
| object | 3 | 79% | 0.037 | 100% |
| metaphor | 3 | 79% | 0.037 | 100% |

### Inherited prohibitions and requirements (stated only in the full-spec arm, nowhere else: forbid darkBackground; require gradients, roundedCorners, iconFonts)

| cell | darkBackground | missing-gradients | missing-roundedCorners | missing-iconFonts | mean violations |
|---|---|---|---|---|---|
| no-design-md | 100% | 0% | 0% | 0% | 1.0 |
| description | 67% | 0% | 0% | 0% | 0.7 |
| object | 0% | 0% | 0% | 0% | 0.0 |
| metaphor | 0% | 0% | 0% | 0% | 0.0 |

### Consistency and distance from the generic center

Distance measured against 4 `no-design-md` samples; **excess distance** subtracts the control's own dispersion (0.112).

| cell | intra-arm dispersion ↓ | distance from control | excess distance ↑ |
|---|---|---|---|
| no-design-md | 0.112 | — | — |
| description | 0.345 | 0.209 | 0.097 |
| object | 0.000 | 0.453 | 0.341 |
| metaphor | 0.000 | 0.453 | 0.341 |

### Significance vs the description baseline (permutation tests)

| cell | baseline | Δ dist-from-control (p) | Δ violations (p) | Δ dispersion (p) |
|---|---|---|---|---|
| object | description | 0.244 (0.399) | -0.67 (0.400) | -0.345 (0.395) |
| metaphor | description | 0.244 (0.401) | -0.67 (0.406) | -0.345 (0.401) |
