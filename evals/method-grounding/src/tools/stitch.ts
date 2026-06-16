import { StitchToolClient } from "@google/stitch-sdk";
import type { GenerationTool, GenerationSession, GenerateRequest, Rendering, Logger, DirectionChannel } from "./types.ts";

export interface ScreenInstance {
  id: string;
  sourceScreen: string;
}

export interface GeneratedScreen {
  screenId: string | undefined;
  htmlUrl: string | undefined;
  imageUrl: string | undefined;
  raw: unknown;
}

/** Walk an arbitrary response object and collect every {key, value} pair. */
function* walk(obj: unknown, path: string[] = []): Generator<{ key: string; value: unknown; path: string[] }> {
  if (obj === null || typeof obj !== "object") return;
  for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
    yield { key, value, path: [...path, key] };
    if (value !== null && typeof value === "object") {
      yield* walk(value, [...path, key]);
    }
  }
}

function findString(obj: unknown, keyPattern: RegExp, valuePattern?: RegExp): string | undefined {
  for (const { key, value } of walk(obj)) {
    if (typeof value === "string" && keyPattern.test(key) && (!valuePattern || valuePattern.test(value))) {
      return value;
    }
  }
  return undefined;
}

function findScreenInstance(obj: unknown): ScreenInstance | undefined {
  // The instance can BE the response (upload_design_md returns it top-level)
  // or sit anywhere inside one.
  const candidates: unknown[] = [obj, ...[...walk(obj)].map((e) => e.value)];
  for (const value of candidates) {
    if (value !== null && typeof value === "object" && !Array.isArray(value)) {
      const v = value as Record<string, unknown>;
      if (typeof v.id === "string" && typeof v.sourceScreen === "string") {
        return { id: v.id, sourceScreen: v.sourceScreen };
      }
    }
  }
  return undefined;
}

function findAssetId(obj: unknown): string | undefined {
  // Either a full resource name "assets/<id>" or a bare id under an asset-ish
  // key. Ids are hex or numeric (the MCP schema examples are numeric; real
  // responses return hex).
  const full = findString(obj, /^(name|asset|assetId|designSystem)$/i, /^assets\/[A-Za-z0-9_-]+$/);
  if (full) return full;
  const bare = findString(obj, /assetId/i, /^[A-Za-z0-9_-]{8,}$/);
  if (bare) return `assets/${bare}`;
  return undefined;
}

// ---------------------------------------------------------------------------
// Screen extraction. Responses nest screens under varying paths
// (outputComponents[].design.screens[], etc.), URLs live one level down
// (htmlCode.downloadUrl / screenshot.downloadUrl), and projects also contain
// image-asset "screens" (generated photography) and design-system stubs
// (asset-stub-*) that must not be mistaken for the generated page.
// ---------------------------------------------------------------------------

export interface CandidateScreen {
  id: string | undefined;
  htmlUrl: string | undefined;
  imageUrl: string | undefined;
  screenType: string | undefined;
}

/** Collect every screen-shaped object anywhere in a response. */
export function extractScreens(raw: unknown): CandidateScreen[] {
  const out: CandidateScreen[] = [];
  const seen = new Set<string>();
  const consider = (v: Record<string, unknown>) => {
    const html = v.htmlCode as Record<string, unknown> | undefined;
    const shot = v.screenshot as Record<string, unknown> | undefined;
    if (!html && !shot && !v.screenType) return;
    let id = typeof v.id === "string" ? v.id : undefined;
    if (!id && typeof v.name === "string") id = /\/screens\/([A-Za-z0-9_-]+)/.exec(v.name)?.[1];
    const key = id ?? JSON.stringify(v).slice(0, 100);
    if (seen.has(key)) return;
    seen.add(key);
    out.push({
      id,
      htmlUrl: typeof html?.downloadUrl === "string" ? (html.downloadUrl as string) : undefined,
      imageUrl: typeof shot?.downloadUrl === "string" ? (shot.downloadUrl as string) : undefined,
      screenType: typeof v.screenType === "string" ? (v.screenType as string) : undefined,
    });
  };
  if (raw !== null && typeof raw === "object") consider(raw as Record<string, unknown>);
  for (const { value } of walk(raw)) {
    if (value !== null && typeof value === "object" && !Array.isArray(value)) consider(value as Record<string, unknown>);
  }
  return out;
}

function isAssetStub(id: string | undefined): boolean {
  return !!id && id.startsWith("asset-stub-");
}

/**
 * The generated page: DESIGN-typed screens only (unknown type tolerated for
 * older response shapes) — never asset stubs, and never IMAGE screens, which
 * are generated photography that can also carry htmlCode.
 */
export function pickDesignScreen(candidates: CandidateScreen[]): CandidateScreen | undefined {
  const real = candidates.filter(
    (s) => !isAssetStub(s.id) && (s.screenType === "DESIGN" || s.screenType === undefined),
  );
  return real.find((s) => s.htmlUrl && s.screenType === "DESIGN") ?? real.find((s) => s.htmlUrl) ?? real.find((s) => s.id !== undefined);
}

/** Ids of screens that can never be the generated page (image assets, stubs). */
export function nonDesignIds(candidates: CandidateScreen[]): string[] {
  return candidates
    .filter((s) => s.id !== undefined && (isAssetStub(s.id) || (s.screenType !== undefined && s.screenType !== "DESIGN")))
    .map((s) => s.id!) as string[];
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export class StitchEval {
  client: StitchToolClient;

  constructor() {
    this.client = new StitchToolClient({ timeout: 600_000 });
  }

  async call<T = unknown>(name: string, args: Record<string, unknown>): Promise<T> {
    return this.client.callTool<T>(name, args);
  }

  async createProject(title: string): Promise<{ projectId: string; raw: unknown }> {
    const raw = await this.call("create_project", { title });
    const projectId = findString(raw, /^projectId$/) ?? findString(raw, /^name$/, /^projects\/\d+$/)?.replace("projects/", "");
    if (!projectId) throw new Error(`create_project: could not find projectId in response: ${JSON.stringify(raw).slice(0, 500)}`);
    return { projectId, raw };
  }

  /**
   * Upload a DESIGN.md and create a design system from it.
   * Returns the design system asset reference ("assets/<id>") to pass to generate.
   */
  async setupDesignSystem(projectId: string, designMd: string, log: (msg: string, raw?: unknown) => void, deviceType = "DESKTOP"): Promise<string> {
    const designMdBase64 = Buffer.from(designMd, "utf8").toString("base64");
    const uploaded = await this.call("upload_design_md", { projectId, designMdBase64 });
    log("upload_design_md", uploaded);

    let instance = findScreenInstance(uploaded);
    if (!instance) {
      // Fall back to the project info — the upload creates a screen instance.
      // get_project takes a resource name, not a bare projectId.
      const project = await this.call("get_project", { name: `projects/${projectId}` });
      log("get_project (instance fallback)", project);
      instance = findScreenInstance(project);
    }
    if (!instance) throw new Error("upload_design_md: no screen instance found in response or project");

    const created = await this.call("create_design_system_from_design_md", {
      projectId,
      selectedScreenInstance: instance,
      deviceType,
    });
    log("create_design_system_from_design_md", created);

    let asset = findAssetId(created);
    if (!asset) {
      const listed = await this.call("list_design_systems", { projectId }).catch(() => undefined);
      log("list_design_systems (asset fallback)", listed);
      asset = findAssetId(listed);
    }
    if (!asset) throw new Error("create_design_system_from_design_md: no design system asset id found");
    return asset;
  }

  async listScreenIds(projectId: string): Promise<string[]> {
    const raw = await this.call("list_screens", { projectId }).catch(() => undefined);
    const ids = new Set<string>();
    for (const { key, value } of walk(raw)) {
      if (typeof value !== "string") continue;
      if (/^(screenId|id)$/.test(key) && /^[a-f0-9]{16,}$/.test(value)) ids.add(value);
      const m = /^projects\/\d+\/screens\/([a-zA-Z0-9_-]+)$/.exec(value);
      if (m) ids.add(m[1]);
    }
    return [...ids].filter((id) => !id.startsWith("asset-stub-"));
  }

  async getScreen(projectId: string, screenId: string): Promise<GeneratedScreen> {
    const raw = await this.call("get_screen", {
      name: `projects/${projectId}/screens/${screenId}`,
      projectId,
      screenId,
    });
    const screen = pickDesignScreen(extractScreens(raw));
    return { screenId, htmlUrl: screen?.htmlUrl, imageUrl: screen?.imageUrl, raw };
  }

  /**
   * The screens exist server-side even when a response omits them (and even
   * when the generate call times out) — so whenever a renderable screen is
   * missing, poll list_screens/get_screen for a fresh one rather than failing.
   */
  private async pollForNewScreen(
    projectId: string,
    knownScreenIds: Set<string>,
    log: (msg: string, raw?: unknown) => void,
  ): Promise<GeneratedScreen | null> {
    for (let attempt = 0; attempt < 10; attempt++) {
      await sleep(30_000);
      const ids = await this.listScreenIds(projectId);
      const fresh = ids.filter((id) => !knownScreenIds.has(id));
      log(`poll ${attempt + 1}/10: ${fresh.length} new screen(s)`);
      for (const id of fresh) {
        const screen = await this.getScreen(projectId, id);
        if (screen.htmlUrl) return screen;
        knownScreenIds.add(id); // renderless (e.g. image asset) — don't re-fetch
      }
    }
    return null;
  }

  async generateScreen(
    projectId: string,
    prompt: string,
    designSystem: string | undefined,
    knownScreenIds: Set<string>,
    log: (msg: string, raw?: unknown) => void,
    modelId?: string,
    deviceType = "DESKTOP",
  ): Promise<GeneratedScreen> {
    const args: Record<string, unknown> = { projectId, prompt, deviceType };
    if (designSystem) args.designSystem = designSystem;
    if (modelId) args.modelId = modelId;

    let raw: unknown;
    try {
      raw = await this.call("generate_screen_from_text", args);
      log("generate_screen_from_text", raw);
    } catch (err) {
      log(`generate_screen_from_text failed (${err}); polling for the screen instead`);
      const polled = await this.pollForNewScreen(projectId, knownScreenIds, log);
      if (polled) return polled;
      throw new Error(`generation failed and no new screen appeared after polling: ${err}`);
    }

    const candidates = extractScreens(raw);
    // Image-asset screens generated alongside the page must never be polled up.
    for (const id of nonDesignIds(candidates)) knownScreenIds.add(id);
    const screen = pickDesignScreen(candidates);
    if (screen?.htmlUrl) {
      return { screenId: screen.id, htmlUrl: screen.htmlUrl, imageUrl: screen.imageUrl, raw };
    }
    // A screen id without html — fetch it directly.
    if (screen?.id) {
      const fetched = await this.getScreen(projectId, screen.id);
      if (fetched.htmlUrl) return fetched;
      knownScreenIds.add(screen.id);
    }
    // Response carried no renderable screen (e.g. design-system-only payload);
    // the page is usually still being generated server-side.
    log("response carried no renderable screen; polling for it");
    const polled = await this.pollForNewScreen(projectId, knownScreenIds, log);
    if (polled) return polled;
    return { screenId: screen?.id, htmlUrl: undefined, imageUrl: undefined, raw };
  }

  async close() {
    await this.client.close();
  }
}

// ---------------------------------------------------------------------------
// The GenerationTool adapter. StitchEval above is the low-level MCP client and
// response parser; the classes below wrap it in the bench's tool interface so
// generate.ts never names a Stitch concept. The per-cell setup — project,
// design-system install, prompt-channel concatenation, screen-id tracking —
// lives in the session.
// ---------------------------------------------------------------------------

const PROMPT_CHANNEL_PREAMBLE = "Follow this design system specification (DESIGN.md) exactly:";

class StitchSession implements GenerationSession {
  readonly provenance: Record<string, unknown>;

  constructor(
    private readonly client: StitchEval,
    private readonly projectId: string,
    private readonly prompt: string,
    private readonly designSystem: string | undefined,
    private readonly model: string | undefined,
    private readonly deviceType: string,
    private readonly knownScreenIds: Set<string>,
  ) {
    this.provenance = { tool: "stitch", projectId, designSystem };
  }

  async generate(log: Logger): Promise<Rendering> {
    const screen = await this.client.generateScreen(
      this.projectId,
      this.prompt,
      this.designSystem,
      this.knownScreenIds,
      log,
      this.model,
      this.deviceType,
    );
    if (screen.screenId) this.knownScreenIds.add(screen.screenId);
    return { id: screen.screenId, htmlUrl: screen.htmlUrl, imageUrl: screen.imageUrl, raw: screen.raw };
  }

  async close(): Promise<void> {
    await this.client.close();
  }
}

export class StitchTool implements GenerationTool {
  readonly name = "stitch";
  readonly channels: DirectionChannel[] = ["design-system", "prompt"];

  async openSession(request: GenerateRequest, log: Logger): Promise<GenerationSession> {
    const client = new StitchEval();
    try {
      const { projectId } = await client.createProject(`eval/${request.label}`);
      log(`project created: ${projectId}`);

      let designSystem: string | undefined;
      let prompt = request.brief;
      if (request.designMd && request.channel === "design-system") {
        designSystem = await client.setupDesignSystem(projectId, request.designMd, log, request.deviceType);
        log(`design system: ${designSystem}`);
      } else if (request.designMd && request.channel === "prompt") {
        prompt = `${request.brief}\n\n${PROMPT_CHANNEL_PREAMBLE}\n\n${request.designMd}`;
      }

      const knownScreenIds = new Set<string>(await client.listScreenIds(projectId));
      return new StitchSession(client, projectId, prompt, designSystem, request.model, request.deviceType, knownScreenIds);
    } catch (err) {
      await client.close().catch(() => {});
      throw err;
    }
  }
}
