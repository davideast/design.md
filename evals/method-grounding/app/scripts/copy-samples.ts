/**
 * Copy one real rendering (sample 0) per case×cell from runs/<run> into the
 * Astro app's public dir, so the pages can show real generated screens as live
 * iframe thumbnails. Run from the app dir before build.
 *
 *   bun scripts/copy-samples.ts
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync, statSync } from "node:fs";
import { join, resolve } from "node:path";

const RUNS = resolve(process.cwd(), "..", "runs");
const RUN = "demo";
const runDir = join(RUNS, RUN);

let copied = 0;
for (const caseKey of readdirSync(runDir).filter((d) => statSync(join(runDir, d)).isDirectory() && !["eval", "blind"].includes(d))) {
  const caseDir = join(runDir, caseKey);
  for (const cell of readdirSync(caseDir).filter((d) => statSync(join(caseDir, d)).isDirectory())) {
    const samples = readdirSync(join(caseDir, cell)).filter((f) => /^\d+\.html$/.test(f));
    if (!samples.length) continue;
    // Flat sample-0 (thumbnails, case grid) + nested all-n (treatment sheet, detail).
    const outDir = join("public", "samples", caseKey);
    const nestDir = join(outDir, cell);
    mkdirSync(nestDir, { recursive: true });
    for (const f of samples) {
      const html = readFileSync(join(caseDir, cell, f), "utf8");
      writeFileSync(join(nestDir, f), html);
      if (f === "0.html") writeFileSync(join(outDir, `${cell}.html`), html);
      copied++;
    }
  }
}

// Tool-comparison run: same brief, one rendering per tool. Namespaced under
// compare/<case>/<tool>.html so the "<tool>+prompt" cell names stay out of URLs.
const COMPARE_RUN = "tool-comp-smoke";
const compareDir = join(RUNS, COMPARE_RUN);
if (existsSync(compareDir)) {
  for (const caseKey of readdirSync(compareDir).filter((d) => statSync(join(compareDir, d)).isDirectory() && !["eval", "blind"].includes(d))) {
    const caseDir = join(compareDir, caseKey);
    for (const cell of readdirSync(caseDir).filter((d) => statSync(join(caseDir, d)).isDirectory())) {
      const sample = join(caseDir, cell, "0.html");
      if (!existsSync(sample)) continue;
      const tool = cell.split("+")[0]; // "gemini+prompt" -> "gemini"
      const outDir = join("public", "samples", "compare", caseKey);
      mkdirSync(outDir, { recursive: true });
      writeFileSync(join(outDir, `${tool}.html`), readFileSync(sample, "utf8"));
      copied++;
    }
  }
}
// Provider-namespaced renders for the results grid + side-by-side depth view:
//   p/<provider>/<case>/<arm>/<n>.html
// Arm-normalized (channel suffix stripped), preferring the design-system channel
// when a run carries both. One method-grounding run per provider.
const PROVIDER_RUNS: { provider: string; run: string }[] = [
  { provider: "stitch", run: "demo" },
  { provider: "stitch", run: "stitch-new" },
  { provider: "gemini", run: "gemini-grid" },
  { provider: "gemini", run: "gemini-new" },
];
for (const { provider, run } of PROVIDER_RUNS) {
  const dir = join(RUNS, run);
  if (!existsSync(dir)) continue;
  for (const caseKey of readdirSync(dir).filter((d) => statSync(join(dir, d)).isDirectory() && !["eval", "blind"].includes(d))) {
    const caseDir = join(dir, caseKey);
    const cells = readdirSync(caseDir).filter((d) => statSync(join(caseDir, d)).isDirectory());
    const byArm = new Map<string, string>(); // arm -> chosen cell dir
    for (const cell of cells) {
      const arm = cell.split("+")[0];
      const prev = byArm.get(arm);
      if (!prev || (!cell.includes("+") && prev.includes("+"))) byArm.set(arm, cell);
    }
    for (const [arm, cell] of byArm) {
      const samples = readdirSync(join(caseDir, cell)).filter((f) => /^\d+\.html$/.test(f));
      if (!samples.length) continue;
      const outDir = join("public", "samples", "p", provider, caseKey, arm);
      mkdirSync(outDir, { recursive: true });
      for (const f of samples) {
        writeFileSync(join(outDir, f), readFileSync(join(caseDir, cell, f), "utf8"));
        copied++;
      }
    }
  }
}
console.log(`copied ${copied} real renderings → public/samples/`);
