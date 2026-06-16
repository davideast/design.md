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
    const sample = join(caseDir, cell, "0.html");
    if (!existsSync(sample)) continue;
    const outDir = join("public", "samples", caseKey);
    mkdirSync(outDir, { recursive: true });
    writeFileSync(join(outDir, `${cell}.html`), readFileSync(sample, "utf8"));
    copied++;
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
console.log(`copied ${copied} real renderings → public/samples/`);
