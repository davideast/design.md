/**
 * Concepts: the pre-draft state where ideation happens. A concept is a spark
 * plus two converging captures — brief.md (the content world) and direction.md
 * (a DESIGN.md-shaped direction document: token front matter + the world
 * stated in prose). No case scaffolding exists until the human commits;
 * commit turns the direction document into a draft (tokens + full-spec seed)
 * and fires a projection turn.
 */
import { mkdirSync, readFileSync, writeFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { randomBytes } from "node:crypto";
import { ROOT } from "../cases.ts";

const CONCEPTS_DIR = join(ROOT, "concepts");

export interface ConceptMeta {
  id: string;
  spark: string;
  createdAt: string;
  committedTo?: string;
}

export interface ConceptRef {
  id: string;
  dir: string;
  meta: ConceptMeta;
}

export function conceptDir(id: string): string {
  return join(CONCEPTS_DIR, id);
}

export function createConcept(spark: string): ConceptRef {
  const id = `c-${Date.now().toString(36)}-${randomBytes(2).toString("hex")}`;
  const dir = conceptDir(id);
  mkdirSync(dir, { recursive: true });
  const meta: ConceptMeta = { id, spark: spark.trim(), createdAt: new Date().toISOString() };
  writeFileSync(join(dir, "concept.json"), JSON.stringify(meta, null, 2) + "\n");
  return { id, dir, meta };
}

export function findConcept(id: string): ConceptRef | null {
  const dir = conceptDir(id);
  if (!/^[a-z0-9-]+$/.test(id) || !existsSync(join(dir, "concept.json"))) return null;
  try {
    return { id, dir, meta: JSON.parse(readFileSync(join(dir, "concept.json"), "utf8")) };
  } catch {
    return null;
  }
}

export function listConcepts(): ConceptRef[] {
  if (!existsSync(CONCEPTS_DIR)) return [];
  return readdirSync(CONCEPTS_DIR)
    .filter((d) => statSync(join(CONCEPTS_DIR, d)).isDirectory())
    .map((id) => findConcept(id))
    .filter((c): c is ConceptRef => c !== null)
    .sort((a, b) => b.meta.createdAt.localeCompare(a.meta.createdAt));
}

export interface ConceptArtifacts {
  brief: string | null;
  direction: string | null;
}

export function conceptArtifacts(ref: ConceptRef): ConceptArtifacts {
  const read = (name: string) => {
    const path = join(ref.dir, name);
    return existsSync(path) ? readFileSync(path, "utf8") : null;
  };
  return { brief: read("brief.md"), direction: read("direction.md") };
}

export function markCommitted(id: string, caseKey: string) {
  const ref = findConcept(id);
  if (!ref) return;
  ref.meta.committedTo = caseKey;
  writeFileSync(join(ref.dir, "concept.json"), JSON.stringify(ref.meta, null, 2) + "\n");
}
