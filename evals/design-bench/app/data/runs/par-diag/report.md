# Method-grounding eval report

Run: `/Users/davideast/repos/davideast/design.md/evals/method-grounding/runs/par-diag` · model: GEMINI_3_1_PRO · eval: 50e2cc3f1a01 (snapshot) · stitch-sdk: 0.3.5 · adherence threshold: OKLab ΔE < 0.05 · permutations: 10,000

Cells suffixed `+prompt` injected the DESIGN.md directly into the generation prompt; unsuffixed cells used Stitch's design-system pipeline. A large gap between channels for the same arm means the design-system pipeline is flattening the prose treatment. Bold p-values < 0.05; with small n, non-significance means underpowered, not "no effect".

## Case: auralis — Auralis — AI voice platform landing page

### Token adherence

| cell | n | palette adherence | mean ΔE to palette | specified fonts used |
|---|---|---|---|---|
| no-design-md | 1 | — | — | — |

### Inherited prohibitions and requirements (stated only in the full-spec arm, nowhere else: forbid darkBackground; require gradients, roundedCorners, iconFonts)

| cell | darkBackground | missing-gradients | missing-roundedCorners | missing-iconFonts | mean violations |
|---|---|---|---|---|---|
| no-design-md | 100% | 0% | 0% | 0% | 1.0 |

### Consistency and distance from the generic center

Distance measured against 1 `no-design-md` samples; **excess distance** subtracts the control's own dispersion (—).

| cell | intra-arm dispersion ↓ | distance from control | excess distance ↑ |
|---|---|---|---|
| no-design-md | — | — | — |

### Significance vs the description baseline (permutation tests)

| cell | baseline | Δ dist-from-control (p) | Δ violations (p) | Δ dispersion (p) |
|---|---|---|---|---|
| — | — | no description baseline in this run | | |
