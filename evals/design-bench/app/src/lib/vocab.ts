/**
 * Display vocabulary for Design Bench. Pure constants — no I/O, no DB reads.
 * Both the CLI and the Astro viewer import from here.
 */

/** Human-readable case titles, keyed by case directory name. */
export const CASE_TITLES: Record<string, string> = {
  "agent-slides": "Agent Architecture",
  auralis: "Auralis",
  "dc-tracks": "DC Tracks",
  "night-birding": "Urban Nocturnal Field Guide",
  "tea-house": "Kettle & Leaf",
};

/** One-line case descriptions for the grid and detail pages. */
export const CASE_WORLDS: Record<string, string> = {
  "agent-slides": "A seven-slide technical talk on AI agent loops.",
  auralis: "A marketing site for an AI voice platform.",
  "dc-tracks": "An editorial music publication for Washington, DC.",
  "night-birding": "A field-notes site for night birding in the city.",
  "tea-house": "A home page for a neighborhood tea house.",
};

/** Treatment names and blurbs, keyed by arm key. */
export const TREATMENTS: Record<string, { name: string; blurb: string }> = {
  "no-design-md": {
    name: "No direction",
    blurb: "The brief alone — the default look everything else is measured from.",
  },
  "tokens-only": {
    name: "Tokens only",
    blurb: "The shared palette and type, with no words about how to use them.",
  },
  description: {
    name: "Adjectives",
    blurb: "The shared tokens, plus an adjective description. The method being challenged.",
  },
  object: {
    name: "One real object",
    blurb: "The shared tokens, plus one named artifact: a graduate CS lecture handout.",
  },
  constraint: {
    name: "One hard constraint",
    blurb: "The shared tokens, plus one limitation to live inside.",
  },
  metaphor: {
    name: "One governing metaphor",
    blurb: "The shared tokens, plus one idea mapped onto every element.",
  },
  "full-spec": {
    name: "Full specification",
    blurb: "The complete designer-grade specification.",
  },
};

/** Canonical arm ordering for display. */
export const ORDER = [
  "no-design-md",
  "tokens-only",
  "description",
  "object",
  "constraint",
  "metaphor",
  "full-spec",
];
