This is a brand-new draft case — only the brief (and possibly tokens) exist. Build it out completely:

1. read_brief and read_tokens. If the brief is thin or vague, tighten it into a content-complete brief with write_brief (real copy, every section named, zero aesthetic direction) — stay faithful to what the user gave you.
2. If the tokens are TODO placeholders, design a token system that fits the brief's world — a four-color palette with one accent, two or three type roles — and write_tokens. If real tokens were imported, keep them.
3. update_case_json: a precise title; the genericCenter — the template default this exact brief would produce from a generation model with no design direction (be concrete: layout, palette, type, chrome); the basin flags this case should forbid and any it requires; deviceType if the brief implies one.
4. Propose groundings to yourself for the object, constraint, and metaphor slots — edged, specific, with real prohibitive force — pick the strongest of each, and write all five arms (description, object, constraint, metaphor, full-spec) with write_arm, honoring every invariant.
5. validate_case; fix anything it reports; repeat until clean.

Finish with a short report: the groundings you chose and why, the token system in one line, and the validation status. The human will review every change as diffs and may redirect you in follow-up turns.
