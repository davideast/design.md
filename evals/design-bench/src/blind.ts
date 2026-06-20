/**
 * Blinded qualitative pass: copies every sample into runs/<run>/blind/ under
 * random names so the reviewer can't tell which condition produced which
 * output, with a sealed manifest for un-blinding afterwards.
 *
 * Usage:
 *   bun src/blind.ts runs/<run-id>            # create the blind set
 *   bun src/blind.ts runs/<run-id> --reveal   # print the mapping
 */
import { readdirSync, statSync, mkdirSync, copyFileSync, writeFileSync, readFileSync, existsSync } from "node:fs";
import { join, dirname, isAbsolute } from "node:path";
import { fileURLToPath } from "node:url";
import { randomBytes } from "node:crypto";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

function main() {
  const runArg = process.argv[2];
  if (!runArg) {
    console.error("usage: bun src/blind.ts runs/<run-id> [--reveal]");
    process.exit(1);
  }
  const runDir = isAbsolute(runArg) ? runArg : join(ROOT, runArg);
  const blindDir = join(runDir, "blind");
  const manifestPath = join(blindDir, "manifest.json");

  if (process.argv.includes("--reveal")) {
    if (!existsSync(manifestPath)) {
      console.error(`no manifest at ${manifestPath} — run without --reveal first`);
      process.exit(1);
    }
    const manifest: Record<string, string> = JSON.parse(readFileSync(manifestPath, "utf8"));
    for (const [blind, source] of Object.entries(manifest).sort((a, b) => a[1].localeCompare(b[1]))) {
      console.log(`${blind}  ←  ${source}`);
    }
    return;
  }

  if (existsSync(manifestPath)) {
    console.error(`blind set already exists at ${blindDir} — delete it to re-blind`);
    process.exit(1);
  }

  const caseDirs = readdirSync(runDir).filter(
    (d) => !["blind", "eval"].includes(d) && statSync(join(runDir, d)).isDirectory(),
  );
  const sources: { label: string; html: string; png: string | null }[] = [];
  for (const caseKey of caseDirs) {
    const caseDir = join(runDir, caseKey);
    const cells = readdirSync(caseDir).filter((d) => statSync(join(caseDir, d)).isDirectory());
    for (const cell of cells) {
      const cellDir = join(caseDir, cell);
      for (const f of readdirSync(cellDir).filter((f) => f.endsWith(".html")).sort()) {
        const index = f.replace(/\.html$/, "");
        const png = join(cellDir, `${index}.png`);
        sources.push({ label: `${caseKey}/${cell}/${index}`, html: join(cellDir, f), png: existsSync(png) ? png : null });
      }
    }
  }
  if (sources.length === 0) {
    console.error(`no samples found under ${runDir}`);
    process.exit(1);
  }

  mkdirSync(blindDir, { recursive: true });
  const manifest: Record<string, string> = {};
  for (const source of sources) {
    const name = randomBytes(4).toString("hex");
    copyFileSync(source.html, join(blindDir, `${name}.html`));
    if (source.png) copyFileSync(source.png, join(blindDir, `${name}.png`));
    manifest[name] = source.label;
  }
  writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

  console.log(`blinded ${sources.length} samples into ${blindDir}`);
  console.log(`review the files there WITHOUT opening manifest.json, take notes by blind name,`);
  console.log(`then un-blind with: bun src/blind.ts ${runArg} --reveal`);
}

main();
