# MVP plan — Stitch screens → Astro app

Turn the proofing-direction Stitch screens into a real Astro app, scoped to the **core of the mission**: a consumer sees one case's renderings compared across treatments, with *real* measured data, and the insight lands. Built by running our generated HTML through the cloned `.agents` skill pipeline, then wiring real data.

## Scope — three screens, real data

| Screen | Route | Source HTML | Data |
|---|---|---|---|
| Home / gallery | `/` | `design/home-stitch-proofing/home.html` | case list |
| Case comparison (direction mode) | `/cases/[case]` | `design/comparison-2axis/page.html` | `runs/demo` report + renderings |
| Rendering detail | `/cases/[case]/[treatment]/[n]` | `design/rendering-detail/page.html` | one rendering + its measured fingerprint |

Deferred (not MVP): maker flow (new-case, ideation, case-authoring, new-run, settings), judging (blind-judgment, reveal), measurements ledger, treatment-sheet, comparison tool-mode.

**The MVP bar:** real data, not placeholders. The comparison and detail pages read the actual `runs/demo` renderings and `report.json` (agent-slides: object +0.64 over adjectives). Placeholders proved the design; the MVP proves the claim.

## The pipeline (cloned at `ignored/stitch-skill-ports/.agents/`)

Four skills, run in order **normalize → pages → verify → extract**. Note: the SKILL.md files reference `.agents/skills/<name>/…`, but in this clone the scripts live at `.agents/<name>/scripts/…` — use the actual paths.

## Phases

### Phase 0 — Scaffold (`app/`)
- New Astro project at `evals/method-grounding/app/` with `@astrojs/react` + Tailwind. Astro renders React components natively, so the pipeline's React page components drop in.
- **Tailwind config from our DESIGN.md, not by hand:** `@google/design.md`'s `lint()` already emits a Tailwind theme (`report.tailwindConfig.data.theme.extend`) from our front-matter tokens. Generate `tailwind.config.ts` from that — it's the authoritative source, and it satisfies stitch-normalize Step 2 without the "CSS variables section" the skill assumes.
- Set `darkMode: "class"` (stitch-verify's loudest gotcha — without it, OS dark mode breaks the build).

### Phase 1 — stitch-normalize (the three MVP HTMLs)
- `bun ignored/stitch-skill-ports/.agents/stitch-normalize/scripts/catalog-classes.ts <dir of the 3 htmls>` → class catalog.
- Build `class-map.json` mapping Stitch's arbitrary classes (`text-[#6D4DE3]`, `p-[24px]`) to the semantic tokens from our Tailwind config; apply it to produce normalized HTML.
- Our screens are already close (they came from the design system), so the map should be small.

### Phase 2 — stitch-pages → React components (routing adapted to Astro)
- `bun ignored/stitch-skill-ports/.agents/stitch-pages/scripts/html-to-jsx.ts <normalized> <out>` → one `.tsx` per screen.
- Reconcile the shared chrome — here it's the **top rail only** (our DESIGN.md forbids a left nav), plus the footer/colophon. One `TopRail.tsx`.
- **Astro adaptation:** skip the skill's Bun.serve() step (Phase 4 of stitch-pages). Instead create Astro routes under `app/src/pages/` that render the React page components: `index.astro`, `cases/[case].astro`, `cases/[case]/[treatment]/[n].astro`.

### Phase 3 — stitch-verify (fidelity gate)
- Serve normalized HTML and the Astro dev server; screenshot both at 1200px via the Chrome MCP; structured comparison; FIX / ACCEPT / DEFER each discrepancy.
- Watch our known deviations: residual injected icons, any rounded/shadow creep. DEFER all placeholder data (it gets replaced in Phase 5).
- **Human gate:** PASS report before extraction.

### Phase 4 — stitch-extract (light, only 3 screens)
- With three screens the copy-paste test yields a small library — likely just: `ProofSheet` (the crop-marked card), `Swatch`/`ColorBar`, `Reading` (mono value + plain claim), `Breadcrumb`. Extract only what repeats across ≥2 of the three; re-verify after.
- Resist abstraction: the skill's own warning. Three screens don't justify a design-system package.

### Phase 5 — wire real data (our addition; the pipeline defers this)
- The pipeline produces static pages on purpose. This phase makes it the product: Astro reads `runs/demo` at build/SSR time.
  - **Home:** list cases from `cases/` (+ headline from each run's `report.json`).
  - **Comparison:** read `runs/demo/report.json` (the escape metric: per-cell `excessDistanceFromControl`, the description-baseline comparisons) and the real rendering screenshots under `runs/demo/<case>/<cell>/`; fill the treatment spread with real images + real distances.
  - **Rendering detail:** one sample's real HTML/PNG + its measured fingerprint (gradients/shadows/etc.) and distance.
- Reuse the existing Hono viewer's data functions (`src/viewer/data.ts`) as the reference for reading run data — same files, same shapes.

## Definition of done
- `app/` Astro builds; three routes render to the proofing DESIGN.md (verify PASS).
- Comparison + detail show **real** `runs/demo` data — the agent-slides grounding result is true on the page, not mocked.
- Tailwind config derived from DESIGN.md (single source of truth), `darkMode: "class"`.

## Adaptations & gotchas (summary)
- **Astro, not Bun.serve+React:** keep the pipeline's normalize/jsx/verify/extract; replace its routing stage with Astro pages.
- **Path skew:** scripts are at `.agents/<name>/scripts/…`, not `.agents/skills/<name>/…`.
- **DESIGN.md format:** use `@google/design.md` to emit the Tailwind theme rather than the skill's CSS-variables assumption.
- **darkMode: "class"** — non-negotiable, or the build inverts.
- **Real data is the MVP**, and the pipeline explicitly DEFERs it — Phase 5 is where the mission actually lands.
