/**
 * Build-time data layer for the maker screens (settings, case authoring,
 * ideation, new batch/case). Reads the real repo material — concepts/,
 * cases/*.draft/, and credential *presence* — so these screens reflect truth.
 *
 * Security: credentials are detected for presence only. No key character ever
 * reaches a rendered page; we read .env / key files solely to report status.
 */
import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
import { listCases } from "./runs";

const ROOT = resolve(process.cwd(), ".."); // evals/method-grounding

function read(p: string): string {
  return existsSync(p) ? readFileSync(p, "utf8") : "";
}
function readJson(p: string): any {
  try {
    return existsSync(p) ? JSON.parse(readFileSync(p, "utf8")) : null;
  } catch {
    return null;
  }
}
/** Strip YAML front matter, return the prose body. */
function prose(md: string): string {
  return md.replace(/^---\n[\s\S]*?\n---\n?/, "").trim();
}
function wordCount(s: string): number {
  const t = s.trim();
  return t ? t.split(/\s+/).length : 0;
}
function firstParagraph(md: string): string {
  for (const b of md.split(/\n\s*\n/)) {
    const t = b.trim();
    if (!t || t.startsWith("#") || t.startsWith("-") || t.startsWith("*") || t.startsWith("```")) continue;
    return t.replace(/\s+/g, " ");
  }
  return "";
}
function firstHeading(md: string): string {
  const m = /^#\s+(.+)$/m.exec(md);
  return m ? m[1].trim() : "";
}
function firstSentence(s: string): string {
  const m = /^(.+?[.!?])(\s|$)/.exec(s);
  return (m ? m[1] : s).trim();
}
/** A readable excerpt of a document whose structure is headings + dense content
 *  (no blank lines), where firstParagraph would find nothing. Strips markdown. */
function excerpt(md: string, max = 300): string {
  const body = md
    .replace(/^#\s+.*$/m, "") // drop the H1 title (shown separately)
    .replace(/^#{1,6}\s+/gm, "") // strip remaining heading markers, keep text
    .replace(/^\s*[-*]\s+/gm, "") // strip bullets
    .replace(/[*_`>#]/g, "") // strip emphasis/code/quote/hash
    .replace(/\s+/g, " ")
    .trim();
  return body.length > max ? body.slice(0, max).replace(/\s+\S*$/, "") + "…" : body;
}

// --- treatment vocabulary (shared with the reader side) -------------------
const TREATMENT_NAMES: Record<string, string> = {
  "tokens-only": "Tokens only",
  description: "Adjectives",
  object: "One real object",
  constraint: "One hard constraint",
  metaphor: "One governing metaphor",
  "full-spec": "Full specification",
  "no-design-md": "No direction",
};
const TREATMENT_ORDER = ["tokens-only", "description", "object", "constraint", "metaphor", "full-spec"];

/** "N colors, M type roles" from a DESIGN.md front matter block. */
function tokenSummary(md: string): string {
  const fm = /^---\n([\s\S]*?)\n---/.exec(md)?.[1] ?? "";
  const colors = (fm.match(/#[0-9a-fA-F]{3,8}\b/g) ?? []).length;
  const roleBlock = /typography:[\s\S]*?(?=\n[a-z]|$)/.exec(fm)?.[0] ?? "";
  const roles = (roleBlock.match(/role:|labels:|ui:|body:|headings:/g) ?? []).length;
  const parts: string[] = [];
  if (colors) parts.push(`${colors} color${colors === 1 ? "" : "s"}`);
  if (roles) parts.push(`${roles} type role${roles === 1 ? "" : "s"}`);
  return parts.join(", ");
}

// ---------------------------------------------------------------------------
// Concepts — ideation
// ---------------------------------------------------------------------------

export interface ConceptRow {
  id: string;
  spark: string;
  createdAt: string;
  hasBrief: boolean;
  hasDirection: boolean;
}

export function listConcepts(): ConceptRow[] {
  const dir = join(ROOT, "concepts");
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((d) => statSync(join(dir, d)).isDirectory())
    .map((id) => {
      const c = readJson(join(dir, id, "concept.json")) ?? {};
      return {
        id,
        spark: c.spark ?? "(untitled spark)",
        createdAt: typeof c.createdAt === "string" ? c.createdAt.slice(0, 10) : "",
        hasBrief: existsSync(join(dir, id, "brief.md")),
        hasDirection: existsSync(join(dir, id, "direction.md")),
      };
    })
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export interface ConceptView {
  id: string;
  spark: string;
  createdAt: string;
  briefTitle: string;
  briefProse: string;
  briefLines: number;
  directionTokens: string;
  directionProse: string;
  directionLines: number;
  captured: { brief: boolean; direction: boolean };
}

export function conceptView(id: string): ConceptView | null {
  const dir = join(ROOT, "concepts", id);
  if (!existsSync(dir)) return null;
  const c = readJson(join(dir, "concept.json")) ?? {};
  const briefMd = read(join(dir, "brief.md"));
  const dirMd = read(join(dir, "direction.md"));
  return {
    id,
    spark: c.spark ?? "(untitled spark)",
    createdAt: typeof c.createdAt === "string" ? c.createdAt.slice(0, 10) : "",
    briefTitle: firstHeading(briefMd),
    briefProse: firstParagraph(briefMd),
    briefLines: briefMd ? briefMd.split("\n").filter((l) => l.trim()).length : 0,
    directionTokens: tokenSummary(dirMd),
    directionProse: firstParagraph(dirMd),
    directionLines: dirMd ? dirMd.split("\n").filter((l) => l.trim()).length : 0,
    captured: { brief: !!briefMd, direction: !!dirMd },
  };
}

// ---------------------------------------------------------------------------
// Draft cases — authoring
// ---------------------------------------------------------------------------

export interface DraftTreatment {
  key: string;
  name: string;
  character: string; // its one-line character (first prose sentence)
  words: number;
  proseless: boolean;
}

export interface DraftCheck {
  label: string;
  pass: boolean;
  detail: string;
}

export interface DraftView {
  key: string;
  title: string;
  device: string;
  genericCenter: string;
  briefTitle: string;
  briefProse: string;
  treatments: DraftTreatment[];
  checks: DraftCheck[];
  allPass: boolean;
  status: string;
  agentProvider: string;
}

function draftDirs(): { key: string; dir: string }[] {
  const dir = join(ROOT, "cases");
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((d) => d.endsWith(".draft") && statSync(join(dir, d)).isDirectory())
    .map((d) => ({ key: d.replace(/\.draft$/, ""), dir: join(dir, d) }));
}

export function listDrafts(): { key: string; title: string }[] {
  return draftDirs().map(({ key, dir }) => ({
    key,
    title: readJson(join(dir, "case.json"))?.title ?? key,
  }));
}

export function draftView(key: string): DraftView | null {
  const found = draftDirs().find((d) => d.key === key);
  if (!found) return null;
  const meta = readJson(join(found.dir, "case.json")) ?? {};
  const briefMd = read(join(found.dir, "brief.md"));

  const armsDir = join(found.dir, "arms");
  const armFiles = existsSync(armsDir) ? readdirSync(armsDir).filter((f) => f.endsWith(".DESIGN.md")) : [];
  const armByKey = new Map(armFiles.map((f) => [f.replace(/\.DESIGN\.md$/, ""), join(armsDir, f)]));
  const treatments: DraftTreatment[] = TREATMENT_ORDER.filter((k) => armByKey.has(k)).map((k) => {
    const md = read(armByKey.get(k)!);
    const body = prose(md);
    return {
      key: k,
      name: TREATMENT_NAMES[k] ?? k,
      character: body ? firstSentence(firstParagraph(body)) : "front matter only — no prose",
      words: wordCount(body),
      proseless: !body,
    };
  });

  // Validation gate — computed from the real files.
  const fmOf = (k: string) => /^---\n([\s\S]*?)\n---/.exec(read(armByKey.get(k)!))?.[1] ?? "";
  const colorSets = treatments.map((t) => (fmOf(t.key).match(/#[0-9a-fA-F]{3,8}\b/g) ?? []).sort().join(","));
  const tokensIdentical = colorSets.length > 0 && colorSets.every((c) => c === colorSets[0]);
  const proseWords = treatments.filter((t) => !t.proseless).map((t) => t.words);
  const lo = Math.min(...proseWords), hi = Math.max(...proseWords);
  const lenWithin = proseWords.length > 0 && (hi - lo) / hi <= 0.35;
  const allText = treatments.map((t) => read(armByKey.get(t.key)!)).join("\n");
  const noMarkers = !/\b(TODO|TBD|FIXME|\?\?\?|XXX)\b/.test(allText);
  // Do's/Don'ts should appear only in the full specification.
  const dosOutsideFullSpec = treatments.some((t) => t.key !== "full-spec" && /\b(Do'?s|Don'?ts|Don't)\b/.test(read(armByKey.get(t.key)!)));

  const checks: DraftCheck[] = [
    { label: "Shared tokens identical across treatments", pass: tokensIdentical, detail: tokensIdentical ? "every treatment carries the same palette" : "palettes differ between treatments" },
    { label: "Treatment lengths within 35% of each other", pass: lenWithin, detail: proseWords.length ? `${lo}–${hi} words` : "no prose treatments" },
    { label: "No unfinished markers", pass: noMarkers, detail: noMarkers ? "none found" : "TODO/TBD found" },
    { label: "Do's and Don'ts only in the full specification", pass: !dosOutsideFullSpec, detail: dosOutsideFullSpec ? "found outside full spec" : "clean" },
  ];
  const allPass = checks.every((c) => c.pass);

  return {
    key,
    title: meta.title ?? key,
    device: (meta.deviceType ?? "DESKTOP").toLowerCase(),
    genericCenter: meta.genericCenter ?? "",
    briefTitle: firstHeading(briefMd),
    briefProse: firstParagraph(briefMd) || excerpt(briefMd),
    treatments,
    checks,
    allPass,
    status: allPass ? "Draft — passes all checks, ready to promote" : "Draft — has open checks",
    agentProvider: agentProviderLabel(),
  };
}

// ---------------------------------------------------------------------------
// Settings — credential presence (status only, never values)
// ---------------------------------------------------------------------------

/** Key names present (non-empty) in .env — names only, values never read out. */
function envKeyNames(): Set<string> {
  const env = read(join(ROOT, ".env"));
  const names = new Set<string>();
  for (const line of env.split("\n")) {
    const m = /^\s*([A-Z0-9_]+)\s*=\s*(.+?)\s*$/.exec(line);
    if (m && m[2] && m[2] !== '""' && m[2] !== "''") names.add(m[1]);
  }
  return names;
}

function agentProviderLabel(): string {
  const ap = readJson(join(ROOT, ".agent-provider.json"));
  if (ap?.provider) return `${ap.provider} / ${ap.model ?? "—"}`;
  return "not configured";
}

export interface ToolCred {
  name: string;
  status: "verified" | "configured" | "missing";
  note: string;
}

export interface SettingsView {
  tools: ToolCred[];
  agentProvider: string;
  agentConfigured: boolean;
}

export function settingsView(): SettingsView {
  const env = envKeyNames();
  const stitchKey = existsSync(join(ROOT, ".stitch-key")) || env.has("STITCH_API_KEY");
  const ap = readJson(join(ROOT, ".agent-provider.json"));
  const geminiKey = !!ap?.apiKey || env.has("GEMINI_API_KEY") || env.has("GOOGLE_API_KEY");
  const claudeKey = env.has("ANTHROPIC_API_KEY") || env.has("CLAUDE_API_KEY");
  return {
    tools: [
      { name: "Stitch", status: stitchKey ? "verified" : "missing", note: stitchKey ? "key configured · verified" : "no key — add one to render with Stitch" },
      { name: "Gemini · direct", status: geminiKey ? "configured" : "missing", note: geminiKey ? "key configured" : "no key — add one to compare this tool" },
      { name: "Claude", status: claudeKey ? "configured" : "missing", note: claudeKey ? "key configured" : "no key — add one to compare this tool" },
    ],
    agentProvider: agentProviderLabel(),
    agentConfigured: !!ap?.provider,
  };
}

// ---------------------------------------------------------------------------
// New batch — the option space (real cases, tools, models, treatments)
// ---------------------------------------------------------------------------

export interface RunOptions {
  experiments: { key: string; name: string; blurb: string }[];
  treatments: { key: string; name: string; locked?: boolean; note?: string }[];
  tools: { key: string; name: string; available: boolean }[];
  models: string[];
  cases: { key: string; title: string }[];
  channels: { key: string; name: string; note: string }[];
}

export function runOptions(): RunOptions {
  const s = settingsView();
  return {
    experiments: [
      { key: "method-grounding", name: "Method grounding", blurb: "Hold the tool fixed; vary the design direction across the grounding ladder. The arms are treatments; scored by distance from the tool's default look." },
      { key: "tool-comparison", name: "Tool comparison", blurb: "Hold one design direction fixed; vary the tool. The arms are the tools you pick; scored by fidelity to the handed direction." },
    ],
    treatments: [
      { key: "no-design-md", name: "No direction", locked: true, note: "the control" },
      { key: "tokens-only", name: "Tokens only" },
      { key: "description", name: "Adjectives", locked: true, note: "the comparison baseline" },
      { key: "object", name: "One real object" },
      { key: "constraint", name: "One hard constraint" },
      { key: "metaphor", name: "One governing metaphor" },
      { key: "full-spec", name: "Full specification" },
    ],
    tools: [
      { key: "stitch", name: "Stitch · Gemini 3.1 Pro", available: s.tools[0].status !== "missing" },
      { key: "gemini", name: "Gemini 3.1 Pro · direct", available: s.tools[1].status !== "missing" },
      { key: "claude", name: "Claude", available: s.tools[2].status !== "missing" },
    ],
    models: ["GEMINI_3_1_PRO", "GEMINI_3_FLASH"],
    cases: listCases().map((c) => ({ key: c.key, title: c.title })),
    channels: [
      { key: "design-system", name: "As a design system", note: "attached the way a real design system would be — Stitch only" },
      { key: "prompt", name: "In the prompt", note: "written into the request itself — works for every tool" },
    ],
  };
}
