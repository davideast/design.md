/**
 * The generation-tool interface: the seam between the bench and whatever
 * produces designs. Stitch is the first implementation; Gemini and Claude
 * adapters slot in behind the same interface without the bench knowing.
 *
 * The bench's invariant grammar — hold a brief constant, vary one thing across
 * arms, generate each through a tool — means a tool only has to answer one
 * question: given a brief and (optionally) a design direction delivered through
 * a channel, produce a rendering. Everything tool-specific (Stitch projects and
 * design-system assets, an LLM's conversation, polling) lives behind a session.
 *
 * This interface is deliberately minimal. We have exactly one implementation
 * today; the real shape of the abstraction won't be known until a second tool
 * (a raw model) exercises it, so we resist fitting it to Stitch's contours now.
 */

export type Logger = (msg: string, raw?: unknown) => void;

/** How a design direction is delivered to a tool for one cell.
 *  - design-system: handed to the tool the way a real design system would be
 *    (Stitch extracts it into a design-system asset). Tool-specific.
 *  - prompt: written into the generation request itself. Every tool supports
 *    this, since every tool takes a prompt. */
export type DirectionChannel = "design-system" | "prompt";

/** One generated artifact from a single (brief × direction) request. A tool
 *  returns a URL to fetch (Stitch hosts the HTML) or inline content (a raw
 *  model emits it directly) — the bench handles either. */
export interface Rendering {
  /** Stable id within the tool's session, if the tool assigns one. */
  id: string | undefined;
  /** URL to fetch the generated HTML, when the tool hosts it. */
  htmlUrl?: string;
  /** Inline HTML, when the tool returns content directly. */
  html?: string;
  /** URL to a screenshot, when the tool renders one. */
  imageUrl?: string;
  /** The raw tool response, persisted for debugging. */
  raw: unknown;
}

/** Everything a tool needs to open a session for one cell. The brief is held
 *  constant across arms; the direction is what the arm varies (absent for the
 *  no-direction control). */
export interface GenerateRequest {
  /** Human label for the cell, used in session/project naming and logs. */
  label: string;
  /** The content brief — constant across all arms of a case. */
  brief: string;
  /** The arm's design direction (a DESIGN.md), or undefined for the control. */
  designMd?: string;
  /** How to deliver the direction. */
  channel: DirectionChannel;
  /** Device form factor (DESKTOP / MOBILE / TABLET / AGNOSTIC). */
  deviceType: string;
  /** Tool-specific model identifier, when the tool exposes a choice. */
  model?: string;
}

/** A per-cell generation session: created once, asked for N samples, closed.
 *  Holds the tool resources a cell needs (Stitch project + design-system asset,
 *  an HTTP client, conversation state) so the bench never sees them. */
export interface GenerationSession {
  /** Generate one rendering against this session's brief and direction.
   *  Called once per sample. */
  generate(log: Logger): Promise<Rendering>;
  /** Tool-specific provenance to record alongside every sample of this cell
   *  (e.g. Stitch projectId + design-system asset id). Stable for the session. */
  readonly provenance: Record<string, unknown>;
  /** Release tool resources. */
  close(): Promise<void>;
}

/** A design-generation backend under test. Holds no per-cell state — it mints
 *  sessions. The bench selects one by name from the registry. */
export interface GenerationTool {
  /** Stable identifier, persisted in run config and provenance. */
  readonly name: string;
  /** The channels this tool can deliver a direction through. Used to validate
   *  an experiment's requested channels against what the tool actually offers. */
  readonly channels: DirectionChannel[];
  /** Open a session for one cell: install the direction (per channel) and
   *  prepare to generate N samples against the same brief. */
  openSession(request: GenerateRequest, log: Logger): Promise<GenerationSession>;
}
