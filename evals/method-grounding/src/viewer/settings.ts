/**
 * BYOK: the Stitch API key can come from the viewer's environment or from a
 * local settings file written by the /settings page. The file lives inside the
 * eval package (gitignored, mode 0600) and is injected into job subprocess
 * environments — set once in the UI, no server restart.
 *
 * Precedence: settings file > environment. A key set in the UI is the
 * explicit, most recent intent.
 */
import { readFileSync, writeFileSync, existsSync, rmSync, chmodSync } from "node:fs";
import { join } from "node:path";
import { ROOT } from "../cases.ts";

const KEY_FILE = join(ROOT, ".stitch-key");

export function readStoredKey(): string | null {
  try {
    const key = readFileSync(KEY_FILE, "utf8").trim();
    return key || null;
  } catch {
    return null;
  }
}

export function writeStoredKey(key: string) {
  writeFileSync(KEY_FILE, key.trim() + "\n", { mode: 0o600 });
  chmodSync(KEY_FILE, 0o600); // ensure perms even if the file pre-existed
}

export function clearStoredKey() {
  if (existsSync(KEY_FILE)) rmSync(KEY_FILE);
}

export interface KeyStatus {
  present: boolean;
  source: "settings" | "environment" | null;
  masked: string | null;
}

export function resolveKey(): { key: string | null; status: KeyStatus } {
  const stored = readStoredKey();
  if (stored) return { key: stored, status: { present: true, source: "settings", masked: mask(stored) } };
  const env = process.env.STITCH_API_KEY?.trim();
  if (env) return { key: env, status: { present: true, source: "environment", masked: mask(env) } };
  return { key: null, status: { present: false, source: null, masked: null } };
}

function mask(key: string): string {
  if (key.length <= 10) return "•".repeat(key.length);
  return `${key.slice(0, 4)}…${key.slice(-4)} (${key.length} chars)`;
}

/** Cheap live check: list projects with the candidate key, bounded at 10s. */
export async function verifyKey(key: string): Promise<{ ok: boolean; message: string }> {
  try {
    const { StitchToolClient } = await import("@google/stitch-sdk");
    const client = new StitchToolClient({ apiKey: key });
    const result = await Promise.race([
      client.callTool("list_projects", {}),
      new Promise((_, reject) => setTimeout(() => reject(new Error("timed out after 10s")), 10_000)),
    ]);
    await client.close().catch(() => {});
    return { ok: true, message: `key works — list_projects responded (${JSON.stringify(result).length} bytes)` };
  } catch (err) {
    return { ok: false, message: `verification failed: ${err instanceof Error ? err.message : String(err)}` };
  }
}
