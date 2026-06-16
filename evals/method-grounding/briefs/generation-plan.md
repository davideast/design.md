# Screen generation order plan

The order is chosen to **de-risk the design system cheaply**: generate one screen from each *untested layout archetype* first, review and tighten the DESIGN.md if any drifts generic, then fill in the rest of each family. Generating all ten remaining screens before checking would risk discovering — across nine of them at once — that, say, the form register slides into generic SaaS.

## Already generated (proofing design system, project `Design Bench — proofing`)

- **Home** (`home-gallery.md`) — gallery of cards. Held the direction.
- **Comparison, direction mode** (`comparison.md`) — the comparison spread + stacked provider bands. Held the direction (0 gradients/shadows/rounded).
- **Treatment sheet** (`treatment-sheet.md`) — grid of equal cells. Held the direction.

Note: `home-gallery.md` and `treatment-sheet.md` got small tool-attribution edits in the audit, so their generated screens are slightly behind the briefs — cosmetic, low priority to regenerate. A stale "Agent Architecture Case Study" screen (from the retired single-axis brief) should be deleted from the project.

## The loop, per screen

1. Content-only prompt from the brief + the proofing design system attached (the DESIGN.md does all visual work).
2. Fingerprint the result: expect **0 gradients, 0 shadows, 0 rounded, IBM Plex Sans + Mono only**. Watch the known deviation — Stitch keeps injecting 7–12 icons our spec doesn't ask for.
3. Render full-page via the Chrome MCP and review.

## Round 1 — archetype probes (generate, then review together)

Four screens, each the first of a layout family we haven't tested. Generating these four and reviewing as a set tells us where the design system needs tightening before we commit to the rest.

1. **`rendering-detail.md`** — *single dominant artifact + metadata.* Tests "the artifact is the largest object; certification follows" at its extreme, and the field-marks readout. Highest reader value of the untested screens.
2. **`measurements.md`** — *data ledger / dense table.* Tests rows of mono-heavy provenance (experiment · tool · metric · hash) — can the proofing register carry a table without becoming a dashboard?
3. **`new-run.md`** — *configuration form with branching.* The riskiest for genericness: forms slide to generic SaaS fastest. Also tests the experiment-first branching surface.
4. **`ideation.md`** — *conversational two-pane.* Tests the agent chat panel beside captured documents — a layout family (live panel) the proofing aesthetic has never had to hold.

**Review gate:** fingerprint all four, render all four, judge. If any archetype drifts generic, tighten the DESIGN.md (likely candidates: a forms/controls clause, a table clause, an agent-panel clause) and re-probe that one before proceeding. Also decide here whether to add an explicit "no icon vocabulary" reinforcement, given Stitch's repeated icon injection.

## Round 2 — fill the families (once archetypes are validated)

In reader-journey order, each leaning on a probe already validated:

5. **`comparison.md` — tool mode** (second state): providers side by side for one fixed treatment, scored by fidelity. Completes the comparison page; the genuine cross-provider view.
6. **`blind-judgment.md`** — *selection / verdict.* Tests the violet selection mark and the game-like flow.
7. **`judgment-reveal.md`** — pairs with blind judgment; reveal + running tally.
8. **`settings.md`** — form family, validated by `new-run`; lists of tool keys.
9. **`new-case.md`** — simplest: one spark input + expert fold.
10. **`case-authoring.md`** — two-pane + agent panel, validated by `ideation`; the densest maker screen (gate + documents + chat).

## Notes

- All renderings on these screens are placeholders until real generated screens are wired in — so "evidence leads" is only fully tested once real artifacts fill the cells.
- Each generation is one Stitch round-trip (content-only prompt + proofing design system); the DESIGN.md is the constant under test, exactly as the bench's own thesis requires.
