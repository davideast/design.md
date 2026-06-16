# Brief — settings

Design a desktop web page for the tool's credentials: the keys for each generation tool, and the editing agent's provider. Short page, plain words. This brief carries content only — all visual direction comes from the project's DESIGN.md.

The page contains, in sequence:

## 1. Wayfinding

A link back to the case gallery and the page's name: "Settings."

## 2. The generation tools

A section titled "Generation tools," with one sentence: "Renderings are generated through these tools; each key is stored locally with restricted permissions and never leaves this machine." A list, one row per tool, each with its name, status, and manage actions:

- **Stitch** — "AIza••••••••kjJY · verified" · Replace key · Remove
- **Gemini · direct** — "AIza••••••••kjJY · key configured" · Replace key · Remove
- **Claude** — "no key — add one to compare this tool" · Add key

Each row has an input for a new key with "Save and verify." One sentence: "A tool without a key can't be selected as an arm in a tool comparison."

## 3. The editing agent

A section titled "Editing agent," with one sentence: "The conversation panels on case and ideation pages are driven by this provider." The current configuration shown plainly: "gemini / gemini-3-flash-preview · key configured." A provider choice (ollama — local, no key · gemini · anthropic · openrouter), a model input (example value: "gemini-3-flash-preview"), an optional key input, and the action "Save." One sentence: "Switching providers starts a fresh conversation; past transcripts are kept."
