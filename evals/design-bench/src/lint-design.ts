/**
 * The viewer's own gate: lint the root DESIGN.md (the viewer's direction
 * document) with the published design.md linter, plus the project's drift
 * check. Token references in prose aren't resolvable by the toolchain yet, so
 * values are inlined in both front matter and prose — two copies of the truth.
 * This check keeps them welded: every hex in prose must be a front-matter
 * token, and every color token must be taught somewhere in the prose.
 *
 *   bun src/lint-design.ts          # exits 1 on any error
 */
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { lint } from "@google/design.md/linter";

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const DESIGN_PATH = join(ROOT, "DESIGN.md");

const report = lint(readFileSync(DESIGN_PATH, "utf8"));
const problems: { severity: "error" | "warning"; message: string }[] = [];

for (const f of report.findings) {
  if (f.severity === "error" || f.severity === "warning") {
    problems.push({ severity: f.severity, message: f.message });
  }
}

// Drift check: prose hexes ↔ front-matter color tokens.
const tokens: Record<string, string> = report.tailwindConfig.success
  ? (report.tailwindConfig.data.theme.extend.colors ?? {})
  : {};
if (!report.tailwindConfig.success) {
  problems.push({ severity: "error", message: `theme export failed: ${report.tailwindConfig.error.message}` });
}
const tokenValues = new Map(Object.entries(tokens).map(([name, hex]) => [hex.toLowerCase(), name]));

const prose = report.documentSections.map((s) => `## ${s.heading}\n${s.content}`).join("\n");
const proseHexes = new Set((prose.match(/#[0-9a-fA-F]{3,8}\b/g) ?? []).map((h) => h.toLowerCase()));

for (const hex of proseHexes) {
  if (!tokenValues.has(hex)) {
    problems.push({ severity: "error", message: `prose uses ${hex} which is not a front-matter color token — the copies have drifted` });
  }
}
for (const [hex, name] of tokenValues) {
  if (!proseHexes.has(hex)) {
    problems.push({ severity: "warning", message: `color token "${name}" (${hex}) is never taught in the prose` });
  }
}

const errors = problems.filter((p) => p.severity === "error").length;
console.log(`DESIGN.md — ${errors} error${errors === 1 ? "" : "s"}, ${problems.length - errors} warning${problems.length - errors === 1 ? "" : "s"}`);
for (const p of problems) console.log(`  ${p.severity}: ${p.message}`);
if (!problems.length) console.log(`  clean · ${Object.keys(tokens).length} color tokens, all welded to prose`);
process.exit(errors ? 1 : 0);
