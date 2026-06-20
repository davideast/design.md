# Site map

The target structure, organized consumer-first: the case gallery is the front door, comparison is the spine, and measurement provenance is a ledger reached on demand rather than the landing page. Maker screens branch off to the side. This is the intended information architecture the briefs describe — it differs from the current routes, which are organized around runs; the mapping below records both.

```
/                                  home — the case gallery
│
├── /cases/agent-architecture      one case, seven treatments side by side
│   │
│   ├── …/object                   one treatment, all renderings (consistency)
│   │   └── …/object/7             one rendering at full size + field marks
│   │
│   ├── …/judge                    blind: unlabeled renderings, one verdict
│   │   └── …/judge/reveal         the reveal: labels, your pick, the words
│   │
│   ├── /cases/auralis             (same shape per case)
│   ├── /cases/dc-tracks
│   └── /cases/night-birding
│
├── /measurements                  the provenance ledger: every batch + hash
│   └── /measurements/new          configure and launch a batch
│
└── makers ─────────────────────────────────────────────
    ├── /cases/new                 start from a spark
    │   └── /concepts/:id          ideation: captures + conversation + commit
    └── /cases/:key  (draft)       authoring: gate, brief, treatments, agent
    └── /settings                  generation key + agent provider
```

## Brief → route

| Brief | Target route | Current route (code today) |
| --- | --- | --- |
| `home-gallery.md` | `/` | `/` (`indexPage`, runs index — to be replaced) |
| `comparison.md` | `/cases/:case` (reader view, treatment × tool) | `/run/:id` (`runPage` matrix) |
| `treatment-sheet.md` | `/cases/:case/:treatment` | `/run/:id/cell/:case/:cell` (`cellPage`) |
| `rendering-detail.md` | `/cases/:case/:treatment/:n` | `/run/:id/sample/:case/:cell/:idx` (`samplePage`) |
| `blind-judgment.md` | `/cases/:case/judge` | judging UI inside `/run/:id/sample/...` |
| `judgment-reveal.md` | `/cases/:case/judge/reveal` | (new — implicit in `samplePage` today) |
| `measurements.md` | `/measurements` | `/` (`indexPage`, demoted from front door) |
| `new-run.md` | `/measurements/new` | `/new-run` (`newRunPage`) |
| `new-case.md` | `/cases/new` | `/cases/new` (`newCasePage`) |
| `ideation.md` | `/concepts/:id` | `/concepts/:id` (`conceptPage`) |
| `case-authoring.md` | `/cases/:key` (draft) | `/cases/:key` (`caseDetailPage`) |
| `settings.md` | `/settings` | `/settings` (`settingsPage`) |

Not briefed: `/compare` (`comparePage`, cross-batch) — folds into the case comparison view once the data model settles.

## Notes

- `/cases/:key` serves two screens by state: a promoted case shows the reader comparison (`comparison.md`); a draft shows the maker authoring screen (`case-authoring.md`). The current code splits this inside `renderCaseDetail`.
- The reader's case route currently requires a run id (`/run/:id/...`) because results are addressed by batch. The target drops the batch from the reader's URL — a case shows its canonical (latest measured) batch, with other batches reachable through `/measurements`. That indirection is a data-model change, not just a view rewrite.
- POST routes (`/jobs`, `/cases/:key/promote`, `/concepts/:id/commit`, etc.) are actions, not screens, and are omitted from the tree.
