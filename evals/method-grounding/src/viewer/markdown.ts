/**
 * Minimal renderer for the DESIGN.md subset the arm documents use:
 * h2/h3 headings, paragraphs, unordered lists, **bold**, `code`, and
 * {token.references}. Escapes first, transforms after — never trust input.
 */
import { html, raw, esc, type Html } from "./html.ts";

/** Inline transforms applied to already-escaped text. */
function inline(escaped: string): string {
  return escaped
    .replace(/\*\*([^*]+)\*\*/g, "<b>$1</b>")
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\{([a-zA-Z0-9_.-]+)\}/g, `<span class="token">{$1}</span>`);
}

export function renderMarkdown(md: string): Html {
  const blocks = md.trim().split(/\n{2,}/);
  const out: string[] = [];
  for (const block of blocks) {
    const lines = block.split("\n");
    if (/^###\s+/.test(lines[0])) {
      out.push(`<h3>${inline(esc(lines[0].replace(/^###\s+/, "")))}</h3>`);
      const rest = lines.slice(1).join("\n").trim();
      if (rest) out.push(`<p>${inline(esc(rest))}</p>`);
    } else if (/^##\s+/.test(lines[0])) {
      out.push(`<h2>${inline(esc(lines[0].replace(/^##\s+/, "")))}</h2>`);
      const rest = lines.slice(1).join("\n").trim();
      if (rest) out.push(`<p>${inline(esc(rest))}</p>`);
    } else if (lines.every((l) => /^\s*-\s+/.test(l) || l.trim() === "")) {
      const items = lines.filter((l) => l.trim()).map((l) => `<li>${inline(esc(l.replace(/^\s*-\s+/, "")))}</li>`);
      out.push(`<ul>${items.join("")}</ul>`);
    } else {
      out.push(`<p>${inline(esc(block))}</p>`);
    }
  }
  return raw(out.join("\n"));
}

/** Front matter YAML, escaped, with inline swatches beside hex colors. */
export function renderFrontMatter(yaml: string): Html {
  const withSwatches = esc(yaml).replace(
    /#[0-9a-fA-F]{6}\b/g,
    (hex) => `<span class="swatch" style="background:${hex}"></span>${hex}`,
  );
  return raw(`<pre class="fm">${withSwatches}</pre>`);
}

export interface DesignDoc {
  frontMatter: string | null;
  body: string;
}

export function splitDesignDoc(content: string): DesignDoc {
  const match = /^---\n([\s\S]*?)\n---\n?/.exec(content);
  if (!match) return { frontMatter: null, body: content };
  return { frontMatter: match[1], body: content.slice(match[0].length) };
}

export function renderDesignDoc(content: string): Html {
  const { frontMatter, body } = splitDesignDoc(content);
  return html`${frontMatter ? renderFrontMatter(frontMatter) : ""}${renderMarkdown(body)}`;
}
