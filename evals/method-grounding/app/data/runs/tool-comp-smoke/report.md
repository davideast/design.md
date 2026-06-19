# Eval report — fidelity-to-direction

Run: `runs/tool-comp-smoke` · metric: fidelity-to-direction · model: GEMINI_3_1_PRO · tool: stitch · eval: 9255ea5d23ee (snapshot) · stitch-sdk: 0.3.5

Fidelity measured as the share of color use within OKLab ΔE < 0.05 of the handed palette, plus mean distance to it and whether the specified fonts appear. Cells are ranked most-faithful first; the handed direction is named per row.

## Case: agent-slides — Agent Architecture — slide deck for a technical talk

| cell | tool | handed direction | n | palette adherence ↑ | mean ΔE to palette ↓ | specified fonts used ↑ |
|---|---|---|---|---|---|---|
| gemini+prompt | gemini | full-spec | 2 | 83% | 0.029 | 100% |
| stitch+prompt | stitch | full-spec | 2 | 49% | 0.076 | 100% |
