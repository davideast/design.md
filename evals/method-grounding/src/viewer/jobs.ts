/**
 * Background jobs: the viewer spawns subprocesses (generation runs, authoring
 * agents) one at a time, streaming output to a log file and an in-memory tail
 * for page banners. A job is a sequence of steps plus an optional in-process
 * finalize over the captured step outputs.
 */
import { mkdirSync, appendFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { ROOT } from "../cases.ts";
import { resolveKey } from "./settings.ts";

export type JobKind = "run" | "authoring";

export interface JobInfo {
  id: string;
  kind: JobKind;
  startedAt: string;
  phase: string;
  status: "running" | "done" | "failed";
  exitCode?: number;
  tail: string;
}

export interface JobStep {
  phase: string;
  cmd: string[];
  cwd?: string;
  stdin?: string;
  /** Merged over process.env. */
  env?: Record<string, string>;
  /** Removed from the child env — e.g. ANTHROPIC_API_KEY for `claude -p`, which always uses a present key and silently switches billing to the API. */
  dropEnv?: string[];
}

interface Job extends JobInfo {
  proc: ReturnType<typeof Bun.spawn> | null;
  logPath: string;
  /** Full stdout per step, for finalize parsing. */
  outputs: string[];
}

let current: Job | null = null;

export function activeJob(): JobInfo | null {
  return current && current.status === "running" ? snapshot(current) : null;
}

export function jobFor(kind: JobKind, id: string): JobInfo | null {
  return current && current.kind === kind && current.id === id ? snapshot(current) : null;
}

function snapshot(job: Job): JobInfo {
  const { proc: _proc, logPath: _log, outputs: _outputs, ...info } = job;
  return { ...info };
}

function append(job: Job, text: string) {
  // The in-memory tail must survive even if the log file (or its run dir)
  // has been deleted out from under a running job.
  try {
    appendFileSync(job.logPath, text);
  } catch {
    // keep going — tail still updates
  }
  job.tail = (job.tail + text).slice(-4000);
}

async function pump(job: Job, stream: ReadableStream<Uint8Array> | null, stepIndex: number | null) {
  if (!stream) return;
  const decoder = new TextDecoder();
  for await (const chunk of stream) {
    const text = decoder.decode(chunk);
    append(job, text);
    if (stepIndex !== null) job.outputs[stepIndex] = (job.outputs[stepIndex] ?? "") + text;
  }
}

/** Start a multi-step job. Returns an error string if another job is running. */
export function startSteps(
  kind: JobKind,
  id: string,
  logPath: string,
  steps: JobStep[],
  finalize?: (outputs: string[], log: (text: string) => void) => void,
): string | null {
  if (current && current.status === "running") {
    return `a job is already running (${current.kind}: ${current.id}) — one at a time`;
  }
  mkdirSync(dirname(logPath), { recursive: true });
  const job: Job = {
    id,
    kind,
    startedAt: new Date().toISOString(),
    phase: steps[0]?.phase ?? "start",
    status: "running",
    tail: "",
    proc: null,
    logPath,
    outputs: [],
  };
  current = job;
  append(job, `\n=== job started ${job.startedAt} (${kind}: ${id}) ===\n`);

  const runStep = (index: number) => {
    const step = steps[index];
    job.phase = step.phase;
    append(job, `\n=== phase: ${step.phase} ===\n$ ${step.cmd.join(" ")}\n`);
    const env: Record<string, string> = { ...(process.env as Record<string, string>), ...(step.env ?? {}) };
    for (const key of step.dropEnv ?? []) delete env[key];
    const proc = Bun.spawn({
      cmd: step.cmd,
      cwd: step.cwd ?? ROOT,
      env,
      stdin: step.stdin !== undefined ? Buffer.from(step.stdin) : undefined,
      stdout: "pipe",
      stderr: "pipe",
    });
    job.proc = proc;
    pump(job, proc.stdout as ReadableStream<Uint8Array>, index);
    pump(job, proc.stderr as ReadableStream<Uint8Array>, null);
    proc.exited.then((code) => {
      if (job.status !== "running") return; // cancelled
      if (code !== 0) {
        append(job, `\n=== ${step.phase} exited ${code} ===\n`);
        job.status = "failed";
        job.exitCode = code;
        return;
      }
      if (index + 1 < steps.length) {
        runStep(index + 1);
        return;
      }
      if (finalize) {
        job.phase = "finalize";
        try {
          finalize(job.outputs, (text) => append(job, text));
        } catch (err) {
          append(job, `\n=== finalize failed: ${err instanceof Error ? err.message : err} ===\n`);
          job.status = "failed";
          job.exitCode = -2;
          return;
        }
      }
      append(job, `\n=== job done ===\n`);
      job.status = "done";
      job.exitCode = 0;
    });
  };
  runStep(0);
  return null;
}

/** Generation run: generate.ts → measure.ts, with the Stitch key injected. */
export function startJob(runId: string, generateArgs: string[], runsRoot: string): string | null {
  const { key } = resolveKey();
  const stitchEnv: Record<string, string> = key ? { STITCH_API_KEY: key } : {};
  return startSteps("run", runId, join(runsRoot, runId, "generate.log"), [
    { phase: "generate", cmd: ["bun", "src/generate.ts", ...generateArgs], env: stitchEnv },
    { phase: "measure", cmd: ["bun", "src/measure.ts", join(runsRoot, runId)], env: stitchEnv },
  ]);
}

export function cancelJob(): boolean {
  if (!current || current.status !== "running" || !current.proc) return false;
  append(current, `\n=== cancelled by user ===\n`);
  current.status = "failed";
  current.exitCode = -1;
  current.proc.kill();
  return true;
}
