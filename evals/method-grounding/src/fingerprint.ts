/**
 * Deterministic style fingerprint extraction from a generated HTML document.
 * No rendering, no LLM judge — regex/lexical extraction over markup, inline
 * styles, <style> blocks, Tailwind utility classes, and Google Fonts links.
 */

export interface OKLab {
  L: number;
  a: number;
  b: number;
}

export interface ColorUse {
  css: string;
  lab: OKLab;
  count: number;
}

export interface Fingerprint {
  /** Explicit colors used (hex/rgb/hsl + a few named/Tailwind basics), occurrence-weighted. */
  colors: ColorUse[];
  /** Quantized color keys, for set comparisons. */
  colorKeys: Set<string>;
  gradients: number;
  shadows: number;
  roundedCorners: number;
  boldUses: number;
  /** Icon-font usage (Material Symbols/Icons, Font Awesome) — glyph systems, not text. */
  iconFonts: number;
  fontFamilies: string[];
  /** Lightness (OKLab L) of background-position colors found; used for dark-mode detection. */
  backgroundLightness: number[];
}

// ---------------------------------------------------------------------------
// Color math: sRGB -> OKLab
// ---------------------------------------------------------------------------

function srgbToLinear(c: number): number {
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

export function rgbToOklab(r8: number, g8: number, b8: number): OKLab {
  const r = srgbToLinear(r8 / 255);
  const g = srgbToLinear(g8 / 255);
  const b = srgbToLinear(b8 / 255);
  const l = 0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b;
  const m = 0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b;
  const s = 0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b;
  const l_ = Math.cbrt(l);
  const m_ = Math.cbrt(m);
  const s_ = Math.cbrt(s);
  return {
    L: 0.2104542553 * l_ + 0.793617785 * m_ - 0.0040720468 * s_,
    a: 1.9779984951 * l_ - 2.428592205 * m_ + 0.4505937099 * s_,
    b: 0.0259040371 * l_ + 0.7827717662 * m_ - 0.808675766 * s_,
  };
}

export function deltaE(x: OKLab, y: OKLab): number {
  return Math.hypot(x.L - y.L, x.a - y.a, x.b - y.b);
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  h = ((h % 360) + 360) % 360;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let rgb: [number, number, number];
  if (h < 60) rgb = [c, x, 0];
  else if (h < 120) rgb = [x, c, 0];
  else if (h < 180) rgb = [0, c, x];
  else if (h < 240) rgb = [0, x, c];
  else if (h < 300) rgb = [x, 0, c];
  else rgb = [c, 0, x];
  return [Math.round((rgb[0] + m) * 255), Math.round((rgb[1] + m) * 255), Math.round((rgb[2] + m) * 255)];
}

export function parseColor(css: string): OKLab | undefined {
  const value = css.trim().toLowerCase();
  let m = /^#([0-9a-f]{3,8})$/.exec(value);
  if (m) {
    let hex = m[1];
    if (hex.length === 3 || hex.length === 4) hex = [...hex].map((c) => c + c).join("");
    if (hex.length === 8) hex = hex.slice(0, 6);
    if (hex.length !== 6) return undefined;
    return rgbToOklab(parseInt(hex.slice(0, 2), 16), parseInt(hex.slice(2, 4), 16), parseInt(hex.slice(4, 6), 16));
  }
  m = /^rgba?\(\s*(\d+)[\s,]+(\d+)[\s,]+(\d+)/.exec(value);
  if (m) return rgbToOklab(Number(m[1]), Number(m[2]), Number(m[3]));
  m = /^hsla?\(\s*([\d.]+)(?:deg)?[\s,]+([\d.]+)%[\s,]+([\d.]+)%/.exec(value);
  if (m) {
    const [r, g, b] = hslToRgb(Number(m[1]), Number(m[2]) / 100, Number(m[3]) / 100);
    return rgbToOklab(r, g, b);
  }
  const named: Record<string, string> = { white: "#ffffff", black: "#000000" };
  if (named[value]) return parseColor(named[value]);
  return undefined;
}

/** Quantize an OKLab color to a coarse grid key for set comparisons. */
export function quantize(lab: OKLab): string {
  const q = (v: number, step: number) => Math.round(v / step) * step;
  return `${q(lab.L, 0.1).toFixed(1)}|${q(lab.a, 0.05).toFixed(2)}|${q(lab.b, 0.05).toFixed(2)}`;
}

// ---------------------------------------------------------------------------
// Extraction
// ---------------------------------------------------------------------------

const COLOR_RE = /#[0-9a-fA-F]{3,8}\b|rgba?\([^)]*\)|hsla?\([^)]*\)/g;

export function extractFingerprint(html: string): Fingerprint {
  // Colors: every explicit color literal in the document, occurrence-weighted.
  const colorCounts = new Map<string, ColorUse>();
  for (const match of html.match(COLOR_RE) ?? []) {
    const lab = parseColor(match);
    if (!lab) continue;
    const key = quantize(lab);
    const existing = colorCounts.get(key);
    if (existing) existing.count++;
    else colorCounts.set(key, { css: match.toLowerCase(), lab, count: 1 });
  }
  // Tailwind basics that carry no literal.
  for (const [cls, hex] of [["white", "#ffffff"], ["black", "#000000"]] as const) {
    const uses = html.match(new RegExp(`\\b(?:bg|text|border)-${cls}\\b`, "g"))?.length ?? 0;
    if (uses > 0) {
      const lab = parseColor(hex)!;
      const key = quantize(lab);
      const existing = colorCounts.get(key);
      if (existing) existing.count += uses;
      else colorCounts.set(key, { css: hex, lab, count: uses });
    }
  }
  const colors = [...colorCounts.values()].sort((a, b) => b.count - a.count);

  // Gradients: Tailwind classes and CSS functions.
  const gradients =
    (html.match(/\bbg-gradient-to-[a-z]+\b/g)?.length ?? 0) +
    (html.match(/\b(?:linear|radial|conic)-gradient\(/g)?.length ?? 0);

  // Shadows: Tailwind shadow utilities (excluding shadow-none) + box-shadow declarations (excluding none).
  const shadowClasses = (html.match(/\bshadow(?:-(?:sm|md|lg|xl|2xl|inner))?\b(?!-none)/g) ?? []).filter(
    (s) => s !== "shadow-none",
  ).length;
  const shadowDecls = (html.match(/box-shadow\s*:\s*([^;"}]+)/g) ?? []).filter((d) => !/:\s*none/.test(d)).length;
  const shadows = shadowClasses + shadowDecls;

  // Rounded corners: Tailwind rounded utilities (excluding rounded-none) + nonzero border-radius declarations.
  const roundedClasses = (html.match(/\brounded(?:-(?!none\b)[a-z0-9\[\]#%.]+)*\b/g) ?? []).filter(
    (s) => s !== "rounded-none",
  ).length;
  const radiusDecls = (html.match(/border-radius\s*:\s*([^;"}]+)/g) ?? []).filter(
    (d) => /[1-9]/.test(d.split(":")[1] ?? ""),
  ).length;
  const roundedCorners = roundedClasses + radiusDecls;

  // Bold usage: Tailwind weight utilities >= 600 + font-weight declarations >= 600.
  const boldUses =
    (html.match(/\bfont-(?:semibold|bold|extrabold|black)\b/g)?.length ?? 0) +
    (html.match(/font-weight\s*:\s*[6-9]\d\d/g)?.length ?? 0) +
    (html.match(/font-weight\s*:\s*bold/g)?.length ?? 0);

  // Icon fonts: glyph systems referenced by link, class, or family name.
  const iconFonts = html.match(/material[+\s_-]?(?:symbols|icons)|font[\s-]?awesome/gi)?.length ?? 0;

  // Font families: font-family declarations + Google Fonts requests.
  const families = new Set<string>();
  for (const decl of html.match(/font-family\s*:\s*([^;"}]+)/g) ?? []) {
    const first = decl.split(":")[1]?.split(",")[0]?.trim().replace(/^['"]|['"]$/g, "");
    if (first && !/^(inherit|initial|unset|var\()/.test(first)) families.add(normalizeFamily(first));
  }
  for (const m of html.matchAll(/family=([A-Za-z0-9+%]+)(?::[^&"']*)?/g)) {
    families.add(normalizeFamily(decodeURIComponent(m[1].replace(/\+/g, " "))));
  }
  // Drop generic fallbacks counted as families.
  for (const generic of ["serif", "sans-serif", "monospace", "system-ui", "ui-serif", "ui-sans-serif", "ui-monospace", "cursive"]) {
    families.delete(generic);
  }
  // Icon fonts are glyph systems, not text faces — counted via iconFonts instead.
  for (const f of [...families]) {
    if (/material (symbols|icons)|font awesome/.test(f)) families.delete(f);
  }

  // Background lightness: colors in background positions.
  const backgroundLightness: number[] = [];
  for (const m of html.matchAll(/background(?:-color)?\s*:\s*(#[0-9a-fA-F]{3,8}|rgba?\([^)]*\)|hsla?\([^)]*\))/g)) {
    const lab = parseColor(m[1]);
    if (lab) backgroundLightness.push(lab.L);
  }
  for (const m of html.matchAll(/\bbg-\[(#[0-9a-fA-F]{3,8})\]/g)) {
    const lab = parseColor(m[1]);
    if (lab) backgroundLightness.push(lab.L);
  }
  if (/\bbg-white\b/.test(html)) backgroundLightness.push(1);
  if (/\bbg-black\b/.test(html)) backgroundLightness.push(0);

  return {
    colors,
    colorKeys: new Set(colorCounts.keys()),
    gradients,
    shadows,
    roundedCorners,
    boldUses,
    iconFonts,
    fontFamilies: [...families].sort(),
    backgroundLightness,
  };
}

function normalizeFamily(name: string): string {
  return name.trim().toLowerCase().replace(/['"]/g, "");
}

// ---------------------------------------------------------------------------
// Distances
// ---------------------------------------------------------------------------

function jaccardDistance<T>(a: Set<T>, b: Set<T>): number {
  if (a.size === 0 && b.size === 0) return 0;
  let intersection = 0;
  for (const x of a) if (b.has(x)) intersection++;
  const union = a.size + b.size - intersection;
  return 1 - intersection / union;
}

function relDiff(a: number, b: number): number {
  return Math.abs(a - b) / (a + b + 1);
}

/** Pairwise distance between two fingerprints in [0, 1]. */
export function fingerprintDistance(x: Fingerprint, y: Fingerprint): number {
  const parts = [
    jaccardDistance(x.colorKeys, y.colorKeys),
    jaccardDistance(new Set(x.fontFamilies), new Set(y.fontFamilies)),
    relDiff(x.gradients, y.gradients),
    relDiff(x.shadows, y.shadows),
    relDiff(x.roundedCorners, y.roundedCorners),
    relDiff(x.boldUses, y.boldUses),
    relDiff(x.iconFonts, y.iconFonts),
  ];
  return parts.reduce((s, v) => s + v, 0) / parts.length;
}
