---
name: deploy-watch
description: After every push to starwars-timeline main, watch the CI build and GitHub Pages deploy and tell the user once the change is live on timeline.starwars.guide. Use right after any `git push` in this repo, and when the user says "monitor the deploy", "is it live", "tell me when it's live" or "watch the deploy".
---

# Deploy watch

A push to `main` runs `.github/workflows/node.js.yml` (lint, test, build, prerender, about 3 to 6 minutes). The workflow replaces `docs/` and commits it back to `main` as `github action build`; GitHub Pages serves `docs/` at https://timeline.starwars.guide. The same run also generates character pages and pushes a `chore: sync character pages from starwars-timeline` commit to `starwars-guide` main, which starts a Netlify build for https://starwars.guide/character/. Do this after every push, without being asked.

## Steps

1. Watch the CI run in the background (`run_in_background: true`):

   ```
   gh run watch "$(gh run list --branch main --limit 1 --json databaseId -q '.[0].databaseId')" --exit-status
   ```

   A non-zero exit means lint, tests or the build failed. Nothing deployed; report the failing step (`gh run view --log-failed`).
2. Only `src/`, `public/`, `build_scripts/` or data changes ship. If only docs, `CLAUDE.md` or `.claude/` changed, say nothing is served and stop.
3. After CI passes, `git pull --rebase` to get the bot's `docs/` commit, then probe the live site with the new hashed bundle name (the filename changes on every code change):

   ```
   asset=$(grep -o 'assets/index-[^"]*\.js' docs/index.html | head -1)
   .claude/skills/deploy-watch/wait.sh grep / "$asset"
   ```

   For a prerender or character change, probe one page instead, e.g. `wait.sh grep /character/Yoda.html '<string only the new build has>'`. Pages can serve a few minutes after the bot commit. Defaults: poll every 20s, give up at 600s (`INTERVAL`, `TIMEOUT`, `HOST` override).
4. When it exits 0, tell the user the change is live, with the URL and elapsed time. If character data changed, the hub copy is a second deploy: probe `HOST=https://starwars.guide wait.sh grep /character/<slug>/ '<string>'` (Netlify takes 1 to 3 minutes after the sync commit).
5. On exit 1, say it timed out and check the Pages deployment (`gh run list --workflow "pages build and deployment" --limit 1`).
