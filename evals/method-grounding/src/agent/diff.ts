/**
 * Per-turn change capture: snapshot the draft's definition files before a
 * turn, diff after. The agent's tool-summary line says what it did; the diff
 * shows what actually changed — required since a turn may touch files beyond
 * the literal ask (parity rebalancing, token sync).
 */
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { join } from "node:path";

export type DraftSnapshot = Record<string, string>;

export interface FileChange {
  file: string;
  added: number;
  removed: number;
  /** Unified-style hunks: lines prefixed with " ", "+", "-"; hunk separators as "@@". */
  unified: string;
}

export function snapshotDraft(dir: string): DraftSnapshot {
  const snapshot: DraftSnapshot = {};
  for (const file of ["case.json", "brief.md"]) {
    const path = join(dir, file);
    if (existsSync(path)) snapshot[file] = readFileSync(path, "utf8");
  }
  const armsDir = join(dir, "arms");
  if (existsSync(armsDir)) {
    for (const file of readdirSync(armsDir).filter((f) => f.endsWith(".DESIGN.md")).sort()) {
      snapshot[`arms/${file}`] = readFileSync(join(armsDir, file), "utf8");
    }
  }
  return snapshot;
}

/** Concepts have just two capture artifacts. */
export function snapshotConcept(dir: string): DraftSnapshot {
  const snapshot: DraftSnapshot = {};
  for (const file of ["brief.md", "direction.md"]) {
    const path = join(dir, file);
    if (existsSync(path)) snapshot[file] = readFileSync(path, "utf8");
  }
  return snapshot;
}

export function diffSnapshots(before: DraftSnapshot, after: DraftSnapshot): FileChange[] {
  const files = [...new Set([...Object.keys(before), ...Object.keys(after)])].sort();
  const changes: FileChange[] = [];
  for (const file of files) {
    const a = before[file] ?? "";
    const b = after[file] ?? "";
    if (a === b) continue;
    changes.push({ file, ...unifiedDiff(a.split("\n"), b.split("\n")) });
  }
  return changes;
}

/** LCS line diff → unified hunks with 2 lines of context. Files here are small. */
function unifiedDiff(a: string[], b: string[]): { added: number; removed: number; unified: string } {
  // LCS table
  const n = a.length;
  const m = b.length;
  const lcs: number[][] = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      lcs[i][j] = a[i] === b[j] ? lcs[i + 1][j + 1] + 1 : Math.max(lcs[i + 1][j], lcs[i][j + 1]);
    }
  }
  // Walk into op list
  type Op = { t: " " | "+" | "-"; line: string };
  const ops: Op[] = [];
  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    if (a[i] === b[j]) {
      ops.push({ t: " ", line: a[i] });
      i++;
      j++;
    } else if (lcs[i + 1][j] >= lcs[i][j + 1]) {
      ops.push({ t: "-", line: a[i] });
      i++;
    } else {
      ops.push({ t: "+", line: b[j] });
      j++;
    }
  }
  while (i < n) ops.push({ t: "-", line: a[i++] });
  while (j < m) ops.push({ t: "+", line: b[j++] });

  // Hunks: keep changed runs with up to 2 context lines on each side.
  const CONTEXT = 2;
  const keep = new Array(ops.length).fill(false);
  ops.forEach((op, idx) => {
    if (op.t !== " ") {
      for (let k = Math.max(0, idx - CONTEXT); k <= Math.min(ops.length - 1, idx + CONTEXT); k++) keep[k] = true;
    }
  });
  const lines: string[] = [];
  let inHunk = false;
  for (let k = 0; k < ops.length; k++) {
    if (!keep[k]) {
      inHunk = false;
      continue;
    }
    if (!inHunk && lines.length > 0) lines.push("@@");
    inHunk = true;
    lines.push(ops[k].t + ops[k].line);
  }
  return {
    added: ops.filter((o) => o.t === "+").length,
    removed: ops.filter((o) => o.t === "-").length,
    unified: lines.join("\n"),
  };
}
