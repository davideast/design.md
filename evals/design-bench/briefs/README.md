# Screen briefs

One brief per screen, for generation in Stitch. The DESIGN.md already lives in the Stitch project — these briefs carry content only, no aesthetics, so the direction document alone shapes how each screen looks. That split is the project's own method, applied to itself.

## Inventory

Reader screens (the primary audience — browse, compare, learn, judge):

| Brief | Screen | Replaces (current code) |
| --- | --- | --- |
| [home-gallery.md](home-gallery.md) | The front door: all cases as worlds, each with its headline claim | `casesPage` + `indexPage` as entry point |
| [comparison.md](comparison.md) | One case across two axes (treatment × tool) — the pivot, stacked provider bands, side-by-side provider mode — the core screen | `runPage` matrix |
| [treatment-sheet.md](treatment-sheet.md) | All renderings of one treatment — consistency made visible | `cellPage` |
| [rendering-detail.md](rendering-detail.md) | One rendering at full size: the words it received, its field marks, its distance | `samplePage` |
| [blind-judgment.md](blind-judgment.md) | Unlabeled renderings, one verdict | judging flow inside `samplePage` |
| [judgment-reveal.md](judgment-reveal.md) | The reveal: labels, the reader's pick, the words that did it | (new — currently implicit) |
| [measurements.md](measurements.md) | The provenance ledger: every batch, model, definitions hash | `indexPage` (demoted from front door) |

Maker screens (secondary — author, launch, configure):

| Brief | Screen | Replaces (current code) |
| --- | --- | --- |
| [new-case.md](new-case.md) | One spark input; expert path collapsed | `newCasePage` |
| [ideation.md](ideation.md) | Concept conversation: captures left, agent right, commit | `conceptPage` |
| [case-authoring.md](case-authoring.md) | Draft case: gate, brief, treatments, editing agent | `caseDetailPage` |
| [new-run.md](new-run.md) | Configure and launch a measurement batch | `newRunPage` |
| [settings.md](settings.md) | Generation key and agent provider | `settingsPage` |

Not generated: the compare-across-batches view (`comparePage`) — fold into the comparison page once the data model settles.

## Ground rules

- Every number a screen states must be a claim a first-time reader can follow; values marked "mock" in a brief must be replaced with measured data before shipping.
- Real copy comes from real cases (Agent Architecture, Auralis, DC Tracks, Urban Nocturnal Field Guide) and real batches (definitions hashes 5d7280c55ee4, 50e2cc3f1a01, 16119bc6a53a).
- The generated screens are visual north stars, not the implementation — the viewer is server-rendered and will consume DESIGN.md directly. Gate each generated screen with `src/fingerprint.ts` (expect: 0 gradients, 0 shadows, 0 rounded corners, fonts = Source Serif 4 + IBM Plex Mono only, no icon fonts — watch for Stitch injecting Material Symbols).
