/** Minimal safe-by-default HTML templating: tagged template with auto-escaping. */

export class Html {
  constructor(public readonly text: string) {}
  toString() {
    return this.text;
  }
}

export function esc(value: unknown): string {
  return String(value).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}

export const raw = (s: string) => new Html(s);

function render(value: unknown): string {
  if (value == null || value === false) return "";
  if (value instanceof Html) return value.text;
  if (Array.isArray(value)) return value.map(render).join("");
  return esc(value);
}

/** Interpolations are escaped unless they are Html (nested html`` calls pass through). */
export function html(strings: TemplateStringsArray, ...values: unknown[]): Html {
  let out = strings[0];
  values.forEach((v, i) => {
    out += render(v) + strings[i + 1];
  });
  return new Html(out);
}

/** Build a query string, skipping null/undefined/empty values. */
export function qs(params: Record<string, string | number | null | undefined>): string {
  const pairs = Object.entries(params).filter(([, v]) => v !== null && v !== undefined && v !== "");
  if (pairs.length === 0) return "";
  return "?" + pairs.map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`).join("&");
}
