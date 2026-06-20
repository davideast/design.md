/**
 * Generate app/tailwind.config.ts from the root DESIGN.md, via @google/design.md.
 * The DESIGN.md front matter is the single source of truth for tokens; this
 * keeps the Tailwind config derived, never hand-edited.
 *
 * Run from the method-grounding directory (where @google/design.md resolves):
 *   bun app/scripts/gen-tailwind-config.ts
 */
import { lint } from "@google/design.md/linter";
import { readFileSync, writeFileSync } from "node:fs";

const report = lint(readFileSync("DESIGN.md", "utf8"));
if (!report.tailwindConfig.success) {
  throw new Error(`DESIGN.md theme export failed: ${report.tailwindConfig.error.message}`);
}
const extend = report.tailwindConfig.data.theme.extend;

const out = `// GENERATED from ../DESIGN.md by app/scripts/gen-tailwind-config.ts — do not edit by hand.
// Regenerate: (from method-grounding) bun app/scripts/gen-tailwind-config.ts
import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{astro,tsx,jsx,ts,js,html,md,mdx}"],
  darkMode: "class",
  theme: {
    extend: ${JSON.stringify(extend, null, 4)},
  },
  plugins: [],
} satisfies Config;
`;

writeFileSync("app/tailwind.config.ts", out);
console.log("wrote app/tailwind.config.ts");
