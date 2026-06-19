/**
 * Snapshot the committed build inputs out of the gitignored runs/ (raw
 * generation output): per-run report.json + config.json + the eval/ arm
 * snapshots. The viewer reads app/data/runs at build time, NOT ../runs — so a
 * fresh clone (no runs/) still builds the current design.
 *
 * Run after generation, with copy-samples.ts (which stages the render iframes
 * into public/samples). Together they refresh everything the build needs:
 *
 *   bun scripts/copy-samples.ts && bun scripts/snapshot.ts
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync, statSync, cpSync, rmSync } from "node:fs";
import { join, resolve } from "node:path";

const RUNS = resolve(process.cwd(), "..", "runs");
const OUT = resolve(process.cwd(), "data", "runs");

if (!existsSync(RUNS)) {
  console.error("snapshot: no ../runs to snapshot from");
  process.exit(1);
}

rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });

let runs = 0;
for (const run of readdirSync(RUNS).filter((d) => statSync(join(RUNS, d)).isDirectory())) {
  const src = join(RUNS, run);
  const dst = join(OUT, run);
  mkdirSync(dst, { recursive: true });
  let any = false;
  for (const f of ["report.json", "config.json", "report.md"]) {
    if (existsSync(join(src, f))) {
      writeFileSync(join(dst, f), readFileSync(join(src, f)));
      any = true;
    }
  }
  // eval/ holds the arm DESIGN.md snapshots + case.json the rendering-detail
  // page quotes as "the exact words". Text-only; safe and small to commit.
  if (existsSync(join(src, "eval"))) {
    cpSync(join(src, "eval"), join(dst, "eval"), { recursive: true });
    any = true;
  }
  if (any) runs++;
  else rmSync(dst, { recursive: true, force: true });
}
console.log(`snapshot: ${runs} runs → app/data/runs/`);
