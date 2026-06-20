/**
 * stitch-normalize Step 4: apply class-map.json to the raw HTML, token by token,
 * writing normalized HTML. Tokenizes each class attribute on whitespace and maps
 * exact matches only (Stitch's arbitrary values use underscores, never spaces, so
 * splitting is safe). Unmapped tokens pass through unchanged.
 *
 *   bun app/gen/stitch-screens/apply-normalize.ts
 */
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from "node:fs";
import { join } from "node:path";

const base = "app/gen/stitch-screens";
const raw = join(base, "raw");
const out = join(base, "normalized");
const map: Record<string, string> = JSON.parse(readFileSync(join(base, "class-map.json"), "utf8"));
mkdirSync(out, { recursive: true });

let totalReplaced = 0;
for (const file of readdirSync(raw).filter((f) => f.endsWith(".html"))) {
  let replaced = 0;
  const html = readFileSync(join(raw, file), "utf8").replace(/\bclass="([^"]*)"/g, (_m, classes: string) => {
    const mapped = classes
      .split(/\s+/)
      .filter(Boolean)
      // Drop dark: variants — Stitch emits them as config-export artifacts; the
      // design has no dark theme, and with darkMode:"class" they're dead no-ops.
      .filter((tok) => {
        if (tok.split(":").slice(0, -1).includes("dark")) { replaced++; return false; }
        return true;
      })
      // Map each token's base (after the last modifier prefix), reattaching prefixes.
      .map((tok) => {
        const i = tok.lastIndexOf(":");
        const prefix = i >= 0 ? tok.slice(0, i + 1) : "";
        const base = i >= 0 ? tok.slice(i + 1) : tok;
        if (map[base]) { replaced++; return prefix + map[base]; }
        return tok;
      })
      .join(" ");
    return `class="${mapped}"`;
  });
  writeFileSync(join(out, file), html);
  totalReplaced += replaced;
  console.log(`${file}: ${replaced} class tokens remapped`);
}
console.log(`total: ${totalReplaced} remapped → ${out}/`);
