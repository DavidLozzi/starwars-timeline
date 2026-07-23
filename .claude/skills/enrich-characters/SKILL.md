---
name: enrich-characters
description: >
  Generate/refresh AI character bios, timelines, and verified dates for the Star Wars
  timeline by running build_scripts/description.js (Claude Opus 4.8 + web search/fetch
  against Wookieepedia). Use when the user adds a character to data.json and asks to
  "enrich" it, or wants to regenerate descriptions after a prompt change. Triggers:
  "/enrich-characters", "enrich the character file", "enrich <name>", "rerun all
  descriptions", "regenerate character bios".
---

# Enrich Characters

Wraps `build_scripts/description.js`. It runs Claude Opus 4.8 with web_search/web_fetch,
reads each character's Wookieepedia page, verifies dates, and writes
`description` / `timeline` / `dates` / `notes` into
`build_scripts/character_descriptions.json`. **Nothing writes back to `data.json`** —
acting on a note is a manual edit.

Entries are keyed by the character's `wookiepedia` URL from `data.json`.

## Run modes

All commands run from `build_scripts/`. Use `--via-claude-code` (local Claude Code auth,
no API key). Drop it to use the Anthropic API (needs `ANTHROPIC_API_KEY` in
`build_scripts/.env`).

| Goal | Command |
|------|---------|
| **New characters** (default — only ones missing from `character_descriptions.json`) | `node description.js --via-claude-code` |
| **Specific characters** | `node description.js --via-claude-code "Ahsoka Tano" "Grogu"` |
| **Rerun everything** (after a prompt change) | `node description.js --via-claude-code --all` |
| **Preview the prompt, call nothing** | `node description.js --dry-run "Grogu"` |

Names must match `title` in `data.json` (case-insensitive). Unknown names abort with a
"Not found in data.json" list.

Tuning lives at the top of `description.js`: `CONCURRENCY = 8`, `EFFORT = 'medium'`.
~83s/character avg, ~$0.40/character.

## How to drive it

1. **Pick the mode.** New word added → default run catches it (missing key). Prompt
   changed → `--all`. Targeted fix → name them.
2. **Background any batch > ~3 characters** (`run_in_background: true`), then report when
   done. Results are written after each character, so an interrupted run keeps its work.
3. **Read the notes.** The run prints a `=== Notes from Claude ===` block: corrections,
   additions, ambiguities, and canon flags. Notes tagged `auto: true` are date
   disagreements the script found between the returned year and `data.json` — treat those
   as highest priority.
4. **Report + backlog.** Summarize actionable notes (wrong dates, bad metadata, missing
   seenIn) grouped by type. Append them to `scratchpad/correction-backlog.md`. State
   plainly that `data.json` is untouched — the user applies fixes manually.
5. **Surface the app** only if asked: `character_descriptions.json` feeds the app via
   `node prepJson.js` (from `build_scripts/`), which regenerates `src/data/*`. Mention it
   as the follow-up step; don't run it unless the user wants the change live.

## Do not

- Hand-edit `character_descriptions.json` or `src/data/*.json`.
- Auto-apply notes to `data.json`.
- Refresh existing entries on a default run — default only touches missing keys. To
  refresh an existing character, name it or use `--all`.
