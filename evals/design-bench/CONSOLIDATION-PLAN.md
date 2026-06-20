# Design Bench — consolidation plan

## Why this is needed
1. **Two viewers.** The default `dev` script (`method-grounding-eval` → `bun run src/viewer.ts`) runs the *old* hand-rolled server viewer. The new Astro viewer lives separately in `app/` and isn't the default entry — so a clone runs the old design.
2. **The Astro app can't build on a clone.** Its data layer hard-reads `../runs/**/report.json` at module load (`app/src/lib/runs.ts:14`), and `runs/` is gitignored. No `runs/` → build throws → fallback to the old viewer. It also assumes the exact `method-grounding/app` layout via `resolve(process.cwd(), "..", "runs")`.
3. **`method-grounding/` nesting** is vestigial — the project is "Design Bench"; method-grounding is one experiment, not the home.

## Decisions (locked)
- **Layout:** rename to `evals/design-bench/` (drop the `method-grounding` directory; `evals/` stays a container).
- **Interactive features preserved:** the live ideation/authoring agent sessions + generation jobs move into the Astro app → it becomes **hybrid SSR**, not static-only.
- **Data decoupling:** the app reads a **committed `data/` snapshot** (small `report.json`/`config.json` + the already-committed `public/samples/`), not `../runs`. `runs/` stays gitignored (raw data transferred/zipped separately).

## Hosting model — DECIDED: A
**A — deployed = static browse; interactive = local.** The Hosting build pre-renders the
browse/matrix pages (static, `design-bench.web.app`); the agent/job features run via
`astro dev`/node locally. Keeps Hosting static, zero extra infra. (Rejected B: SSR in
production via Cloud Functions/Run.) Implication for Phase 2: browse pages `prerender = true`;
maker endpoints `prerender = false` and only run under `astro dev`/node, not in the static deploy.

## Target structure
```
evals/design-bench/
  app/            Astro hybrid app (browse = prerendered, maker = SSR endpoints)
    data/         committed snapshot the build reads (report.json/config.json)
    public/samples/   committed render iframes (already exist)
  src/            eval harness (generate / measure / tools / agent / experiments / metrics / cases)
  cases/  briefs/  concepts/  design/  DESIGN.md
  runs/           gitignored raw generation output (snapshot source)
```

## Phases

### Phase 1 — Decouple the app from `runs/` (the actual clone fix)
- Add a committed `app/data/` with the per-run `report.json` + `config.json` the viewer reads (tiny JSON; `public/samples/` already committed).
- Add `app/scripts/snapshot.ts`: copy the needed `report.json`/`config.json` from `runs/` → `app/data/`, then run `copy-samples`. One command refreshes committed inputs after any generation.
- Rewrite the data layer (`runs.ts`, `bench.ts`, `makers.ts`, `copy-samples.ts`) to read from `app/data/` instead of `resolve(cwd,"..","runs")`; make module-load reads resilient (no throw on a missing run).
- **Verify:** `rm -rf runs/ && bun run build` still renders the current 5×5 matrix.

### Phase 2 — Make the app hybrid SSR; port the interactive maker features
- Add `@astrojs/node` (hybrid): browse pages stay `prerender = true` (static); maker screens become server-rendered.
- Astro API endpoints that reuse the *validated* backend (no logic duplication):
  - **Ideation/authoring** → `src/agent` (`submitTurn`, `transcript`) over relay providers.
  - **Generation jobs** → `src/generate` + `src/measure` (stream progress; refresh `data/` snapshot on completion).
- Replace the static maker mockups (`concepts`, `drafts`, `settings`, `measurements/new`) with real UI wired to those endpoints.

### Phase 3 — Retire the old viewer
- Delete `src/viewer/` and `src/viewer.ts`; repoint the `dev` script to the Astro app. Anything unique worth keeping is absorbed by the Phase-2 endpoints.

### Phase 4 — Relocate + rename
- `git mv evals/method-grounding/* evals/design-bench/` (preserve history); move dotfiles too.
- Re-verify harness paths (it reads `cases/`, `runs/`, `eval/` relative to the package root — confirm after move). The app no longer couples to its parent (reads `data/` internally).
- Rename package `method-grounding-eval` → `design-bench`; update scripts, gitignore (`runs/`, secrets), README/`MVP-PLAN.md`, and the Firebase config (`.firebaserc`/`firebase.json` travel with `app/`).
- Update the `design-bench` branch + the `design-bench` Hosting site config.

### Phase 5 — Verify end to end
- Fresh clone → `bun install` → app build shows the **current** design with **no `runs/`**.
- `astro dev` → interactive maker features work (agent sessions, jobs) — per the hosting sub-decision.
- Static deploy → `design-bench.web.app` shows the matrix.
- Harness CLI (`generate`/`measure`) still works from `evals/design-bench/`.

## Risks / notes
- **SSR vs static deploy** — resolved by the hosting sub-decision above; Phase 1 (static browse) is independent and can land first.
- **Harness path coupling** — `src/*` resolves `cases/`/`runs/` from the package root; re-test after the move.
- **Big git move** — do the relocation as one commit; the deployed branch + Firebase site must be repointed afterward.
- "method-grounding" as an **experiment name** stays (it's a real axis); only the **directory** goes away.

## Suggested order
Phase 1 first (fixes the clone bug, low risk, independent) → confirm hosting sub-decision → Phase 2 → 3 → 4 → 5.
