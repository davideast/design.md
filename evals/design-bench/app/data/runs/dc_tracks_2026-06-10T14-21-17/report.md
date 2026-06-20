# Eval report — escape-from-center

Run: `runs/dc_tracks_2026-06-10T14-21-17` · metric: escape-from-center · model: GEMINI_3_1_PRO · tool: unrecorded · eval: 16119bc6a53a (snapshot) · stitch-sdk: 0.3.5

Adherence threshold: OKLab ΔE < 0.05 · permutations: 10,000.

Cells suffixed `+prompt` injected the DESIGN.md directly into the generation prompt; unsuffixed cells used the tool's design-system pipeline. A large gap between channels for the same arm means the design-system pipeline is flattening the prose treatment. Bold p-values < 0.05; with small n, non-significance means underpowered, not "no effect".

## Case: dc-tracks — The Tracks of Washington DC — prestige editorial publication

### Token adherence

| cell | n | palette adherence | mean ΔE to palette | specified fonts used |
|---|---|---|---|---|
| no-design-md | 6 | — | — | — |
| tokens-only | 3 | 36% | 0.066 | 100% |
| tokens-only+prompt | 3 | 49% | 0.068 | 100% |
| description | 3 | 54% | 0.065 | 100% |
| description+prompt | 3 | 44% | 0.067 | 100% |
| object | 3 | 44% | 0.064 | 100% |
| object+prompt | 3 | 44% | 0.062 | 100% |
| constraint | 3 | 35% | 0.070 | 100% |
| constraint+prompt | 3 | 41% | 0.065 | 100% |
| metaphor | 3 | 38% | 0.073 | 100% |
| metaphor+prompt | 3 | 57% | 0.063 | 100% |
| full-spec | 3 | 49% | 0.059 | 100% |
| full-spec+prompt | 3 | 35% | 0.066 | 100% |

### Inherited prohibitions and requirements (stated only in the full-spec arm, nowhere else: forbid shadows, roundedCorners, darkBackground, iconFonts)

| cell | shadows | roundedCorners | darkBackground | iconFonts | mean violations |
|---|---|---|---|---|---|
| no-design-md | 83% | 33% | 17% | 100% | 2.3 |
| tokens-only | 0% | 33% | 0% | 100% | 1.3 |
| tokens-only+prompt | 100% | 67% | 0% | 100% | 2.7 |
| description | 67% | 33% | 33% | 100% | 2.3 |
| description+prompt | 100% | 0% | 0% | 100% | 2.0 |
| object | 100% | 67% | 33% | 100% | 3.0 |
| object+prompt | 33% | 33% | 0% | 100% | 1.7 |
| constraint | 67% | 33% | 0% | 100% | 2.0 |
| constraint+prompt | 33% | 33% | 0% | 100% | 1.7 |
| metaphor | 0% | 67% | 33% | 100% | 2.0 |
| metaphor+prompt | 33% | 100% | 67% | 100% | 3.0 |
| full-spec | 0% | 0% | 0% | 100% | 1.0 |
| full-spec+prompt | 67% | 33% | 0% | 100% | 2.0 |

### Consistency and distance from the generic center

Distance measured against 6 `no-design-md` samples; **excess distance** subtracts the control's own dispersion (0.328).

| cell | intra-arm dispersion ↓ | distance from control | excess distance ↑ |
|---|---|---|---|
| no-design-md | 0.328 | — | — |
| tokens-only | 0.139 | 0.506 | 0.178 |
| tokens-only+prompt | 0.302 | 0.491 | 0.163 |
| description | 0.252 | 0.409 | 0.081 |
| description+prompt | 0.215 | 0.480 | 0.152 |
| object | 0.191 | 0.426 | 0.098 |
| object+prompt | 0.122 | 0.483 | 0.155 |
| constraint | 0.164 | 0.450 | 0.122 |
| constraint+prompt | 0.227 | 0.441 | 0.113 |
| metaphor | 0.152 | 0.534 | 0.206 |
| metaphor+prompt | 0.263 | 0.515 | 0.187 |
| full-spec | 0.123 | 0.521 | 0.193 |
| full-spec+prompt | 0.178 | 0.408 | 0.080 |

### Significance vs the description baseline (permutation tests)

| cell | baseline | Δ dist-from-control (p) | Δ violations (p) | Δ dispersion (p) |
|---|---|---|---|---|
| tokens-only | description | 0.097 (0.098) | -1.00 (0.705) | -0.113 (0.596) |
| tokens-only+prompt | description+prompt | 0.011 (0.792) | 0.67 (0.393) | 0.087 (0.493) |
| object | description | 0.018 (0.601) | 0.67 (0.698) | -0.061 (0.694) |
| object+prompt | description+prompt | 0.003 (0.801) | -0.33 (1.000) | -0.093 (0.295) |
| constraint | description | 0.041 (0.300) | -0.33 (1.000) | -0.088 (0.306) |
| constraint+prompt | description+prompt | -0.039 (0.304) | -0.33 (1.000) | 0.011 (1.000) |
| metaphor | description | 0.125 (0.101) | -0.33 (1.000) | -0.099 (0.303) |
| metaphor+prompt | description+prompt | 0.036 (0.408) | 1.00 (0.399) | 0.047 (0.402) |
| full-spec | description | 0.112 (0.103) | -1.33 (0.405) | -0.129 (0.306) |
| full-spec+prompt | description+prompt | -0.072 (0.100) | 0.00 (1.000) | -0.037 (0.607) |
