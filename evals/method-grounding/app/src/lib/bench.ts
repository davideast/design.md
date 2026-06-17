/**
 * The bench, indexed for browsing. Design Bench is a general runner; this layer
 * doesn't argue any experiment — it just collects results so the home can show
 * a grid of best renderings (design type × provider) and the depth view can show
 * every arm for one provider side by side. Breadth → depth.
 *
 * One method-grounding run per provider; arms are normalized across channels.
 */
import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
import { CASE_TITLES, CASE_WORLDS, TREATMENTS, ORDER } from "./runs";

const RUNS = resolve(process.cwd(), "..", "runs");

export interface Provider {
  key: string;
  label: string;
  runs: string[]; // method-grounding runs backing this column (merged); empty = no key/data yet
}

/** The six tool columns. Stitch and Gemini have keys and runs here; the rest are
 *  named targets with no key in this environment, shown as awaiting columns. */
export const PROVIDERS: Provider[] = [
  { key: "stitch", label: "Stitch", runs: ["demo", "stitch-new"] },
  { key: "gemini", label: "Gemini · direct", runs: ["gemini-grid", "gemini-new"] },
  { key: "opus", label: "Opus 4.8", runs: [] },
  { key: "gpt", label: "GPT 5.5", runs: [] },
  { key: "kimi", label: "Kimi K2.7", runs: [] },
  { key: "glm", label: "GLM 5.2", runs: [] },
];

/** The report case for a provider × case, from the first of its runs that has it. */
function providerCase(provider: Provider, caseKey: string): any | null {
  for (const run of provider.runs) {
    const rep = readJson(join(RUNS, run, "report.json"));
    const c = rep?.cases?.find((x: any) => x.case === caseKey);
    if (c) return { c, run };
  }
  return null;
}

function readJson(p: string): any {
  return existsSync(p) ? JSON.parse(readFileSync(p, "utf8")) : null;
}
const round2 = (n: number | null | undefined) => (n == null ? null : Math.round(n * 100) / 100);
const isControl = (arm: string) => arm === "no-design-md";

export interface Arm {
  key: string;
  name: string;
  blurb: string;
  score: number | null; // distance from the default look (excess); higher = more realized
  isControl: boolean;
  render: string | null; // /samples/p/<provider>/<case>/<arm>/0.html
  samples: number;
}

/** All arms for one provider × case, in ladder order, with their best render. */
export function armsFor(providerKey: string, caseKey: string): Arm[] {
  const provider = PROVIDERS.find((p) => p.key === providerKey);
  if (!provider) return [];
  const found = providerCase(provider, caseKey);
  if (!found) return [];
  const c = found.c;
  // Normalize channel-suffixed cells to arms; prefer the design-system (bare) cell.
  const byArm = new Map<string, any>();
  for (const cell of c.cells ?? []) {
    const arm = String(cell.cell).split("+")[0];
    const prev = byArm.get(arm);
    if (!prev || (!String(cell.cell).includes("+") && String(prev.cell).includes("+"))) byArm.set(arm, cell);
  }
  const arms: Arm[] = [];
  for (const arm of ORDER) {
    const cell = byArm.get(arm);
    if (!cell) continue;
    const render = renderPath(providerKey, caseKey, arm);
    arms.push({
      key: arm,
      name: TREATMENTS[arm]?.name ?? arm,
      blurb: TREATMENTS[arm]?.blurb ?? "",
      score: isControl(arm) ? 0 : round2(cell.excessDistanceFromControl),
      isControl: isControl(arm),
      render,
      samples: cell.samples ?? 0,
    });
  }
  return arms;
}

function renderPath(providerKey: string, caseKey: string, arm: string): string | null {
  const p = join("public", "samples", "p", providerKey, caseKey, arm, "0.html");
  return existsSync(p) ? `/samples/p/${providerKey}/${caseKey}/${arm}/0.html` : null;
}

/** The best arm for a provider × case: the most-realized direction, by the
 *  default metric (distance from the default look). Controls excluded. */
export function bestArm(providerKey: string, caseKey: string): Arm | null {
  const candidates = armsFor(providerKey, caseKey).filter((a) => !a.isControl && a.render);
  if (!candidates.length) return null;
  return candidates.reduce((best, a) => ((a.score ?? -1) > (best.score ?? -1) ? a : best));
}

export interface Tile {
  providerKey: string;
  providerLabel: string;
  caseKey: string;
  caseTitle: string;
  world: string;
  best: Arm | null;
}

/** The grid: every provider × design-type that has a result, best arm forward.
 *  Grouped by design type so the page reads as "designs, across providers." */
export function gridTiles(): Tile[] {
  const tiles: Tile[] = [];
  // Cases are whatever any provider has measured, in a stable order.
  const caseKeys = Array.from(
    new Set(
      PROVIDERS.flatMap((p) =>
        p.runs.flatMap((run) => {
          const rep = readJson(join(RUNS, run, "report.json"));
          return (rep?.cases ?? []).map((c: any) => c.case);
        }),
      ),
    ),
  );
  for (const caseKey of caseKeys) {
    for (const p of PROVIDERS) {
      const best = bestArm(p.key, caseKey);
      if (!best) continue;
      tiles.push({
        providerKey: p.key,
        providerLabel: p.label,
        caseKey,
        caseTitle: CASE_TITLES[caseKey] ?? caseKey,
        world: CASE_WORLDS[caseKey] ?? "",
        best,
      });
    }
  }
  return tiles;
}

export interface DepthView {
  providerKey: string;
  providerLabel: string;
  caseKey: string;
  caseTitle: string;
  world: string;
  arms: Arm[]; // ladder order, controls included
}

export function depthView(providerKey: string, caseKey: string): DepthView | null {
  const provider = PROVIDERS.find((p) => p.key === providerKey);
  const arms = armsFor(providerKey, caseKey).filter((a) => a.render);
  if (!provider || !arms.length) return null;
  return {
    providerKey,
    providerLabel: provider.label,
    caseKey,
    caseTitle: CASE_TITLES[caseKey] ?? caseKey,
    world: CASE_WORLDS[caseKey] ?? "",
    arms,
  };
}

/** Every provider × case that has renders — for getStaticPaths on the depth view. */
export function depthPaths(): { provider: string; case: string }[] {
  return gridTiles().map((t) => ({ provider: t.providerKey, case: t.caseKey }));
}
