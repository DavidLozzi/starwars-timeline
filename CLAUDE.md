# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

The Ultimate Star Wars Timeline — a React app that renders an interactive, scrollable timeline of Star Wars characters, movies, TV shows, and eras (High Republic Era through New Jedi Order, roughly -300 BBY to 50 ABY). Live at https://timeline.starwars.guide/.

## Brand position (read before changing anything user-facing)

This repo is a **satellite app** in the AurebeshFiles brand. The hub is **`../starwars-guide`** (starwars.guide) — the Jekyll landing site that introduces, cross-links, and indexes every app.

**`../starwars-guide/CLAUDE.md` is the source of truth for the brand as a whole**: the full sibling-repo map, branding, navigation, SEO conventions, social handles, and cross-app links are all decided there. Read it before any change that affects how this app is presented, named, or linked.

Division of ownership:

- **This repo owns**: the timeline app itself — data, interactions, visuals, its own deploy (GitHub Pages from `docs/`).
- **starwars-guide owns**: the product name in marketing copy, the `/star-wars-timeline` landing page, the home-page app card, nav placement, social handles, and the `WebApplication` JSON-LD for this product.

**This repo writes content into the hub.** `build_scripts/website.js` generates `character/*.md` plus images directly into `../starwars-guide` (sibling checkout required). Those files are **generated — never hand-edited in starwars-guide**; fixes belong here. What the generator emits:

- `social-desc` is real per-character copy: the bio, HTML stripped, truncated to ~160 characters on a sentence or word boundary. `social-title` is `"Name — Star Wars Timeline & Story"`. Both feed `_includes/head.html` (meta description, OG/Twitter) and the character JSON-LD.
- A `character:` front-matter block (species, homeworld, birth/death year, wookieepedia, appearances) is emitted for future hub use. **Nothing in the hub reads it yet** — the same facts already render in the page body's `metadata` div, so don't duplicate them in the layout.
- `last_modified_at` is only re-stamped when the body or the rest of the front matter actually changed, so a re-run doesn't churn all ~80 hub pages.
- Timeline events are emitted as `<h3>` (were `<h4>`), matching the h1 → h2 outline the hub layout supplies.

Changing the shape of that generated output (front matter keys, heading levels, file naming) is a **cross-repo change** — check the hub's `_layouts/character.html` and `_includes/structured-data.html` before shipping it.

## Commands

Run from the repo root (`starwars-timeline/`):

- `npm start` — Vite dev server on port 3000
- `npm run lint` — ESLint over `src/**/*.{js,jsx}`
- `npm run build` — production build (Vite, output to `build/`)
- `npm run preview` — serve the built `build/` locally to sanity-check a production bundle
- `npm test` — Vitest, single run (scope to one file with `npm test -- utils.test.js`)
- `npm run test:watch` — Vitest in watch mode

Tests run on **Vitest** (config lives in the `test` block of `vite.config.js`), with `globals: true` so `describe`/`it`/`expect` need no imports — but mocking uses `vi.*`, not `jest.*`. `src/setupTests.js` pulls in `@testing-library/jest-dom` matchers. CI does not currently run tests.

When mocking `molecules/modal`, mirror its real structure: the backdrop takes `onClickBg`, but children sit inside an inner wrapper that calls `e.stopPropagation()`. A flat mock makes every click on a child also register as a backdrop click.

Never call `render()` inside a `waitFor()` callback — `waitFor` re-invokes on a poll, so each tick mounts another React tree and the run dies with a heap OOM rather than a useful failure.

### Build tooling (Vite)

`vite.config.js` is deliberately small, but two things matter:

- **`build.outDir` is `build`**, not Vite's default `dist`, so CI's `cp -r ./build/* ./docs` and the `/build` entry in `.gitignore` keep working.
- **`index.html` lives at the repo root**, not in `public/` — Vite treats it as the app entry point and build template. It ends with `<script type="module" src="/src/index.jsx">`. `public/` is still the static-asset directory and is copied to the build root verbatim.

Any file containing JSX **must** use a `.jsx` extension. esbuild only parses `.jsx`/`.tsx` as JSX, and for production builds `@vitejs/plugin-react` hands the transform to esbuild — a `.js` file with JSX in it fails the build with `Expression expected`. This includes `*.styles.jsx` files, several of which wrap elements (e.g. `styled((props) => <div {...props} />)`).

SVGs are imported two ways: `import X from './x.svg'` gives a URL (inlined as a data URI under 4 kB), and `import X from './x.svg?react'` gives a React component via `vite-plugin-svgr`. The `?react` suffix replaces CRA's `import { ReactComponent as X }`.

CI (`.github/workflows/node.js.yml`) runs, in order: `npm ci` → `npm run lint` → `node prepJson.js` (from `build_scripts/`) → `npm run build` → copies `build/*` into `docs/` and commits. `docs/` is the actual GitHub Pages output directory — it's checked in and regenerated by CI, not built locally as part of normal dev.

There is a **separate** Node project in `build_scripts/` with its own `package.json`/`package-lock.json` (type: module, ESM). Install its deps separately (`cd build_scripts && npm install`) if running its scripts locally. It needs `OPENAI_API_KEY` in a `.env` file there (see `.env.sample`) for the description-generation scripts.

## Data pipeline (important — read before editing timeline content)

The app does **not** hand-author `src/data/*.json`. Those files are generated:

1. `build_scripts/data.json` is the source of truth — a flat array of entries with `type` (`character`, `movie`, `tv`, `era`), `startYear`/`endYear`, `metadata`, `seenIn`, etc.
2. `build_scripts/prepJson.js` reads `data.json` plus `build_scripts/character_descriptions.json` (AI-generated bios/timelines, produced separately by `build_scripts/description.js` using OpenAI) and computes derived, denormalized output:
   - `src/data/years.json` — one entry per year with `yearIndex` and the events happening that year (used to position everything vertically)
   - `src/data/characters.json` — characters with resolved `seenIn` (grouped by year, cross-referenced against movies/TV), `yearIndex`, `deathEvent`, filter metadata
   - `src/data/filters.json` — aggregated filter facets (species, homeworld, etc.) with counts, derived from character `metadata`
   - `src/data/seenIn.json` — aggregated "seen in" facet (movies/shows) with counts
   - It also regenerates the SEO content block in the root `index.html` (the `<div id="content">` inside `<div id="root">`, which React replaces on mount), plus `public/starwars_movies.html`, `public/starwars_tvshows.html`, `public/starwars_characters.html`, and `public/sitemap.xml`.
3. **To add/edit timeline content (a character, movie, era, etc.), edit `build_scripts/data.json`, then run `node prepJson.js` from `build_scripts/` to regenerate everything in `src/data/`.** Do not hand-edit `src/data/*.json` directly — it will be overwritten.
4. **Adding a new character**: after adding its entry to `data.json` (with a `wookiepedia` URL), also run `node description.js` from `build_scripts/` to generate its bio/timeline into `character_descriptions.json` before running `prepJson.js`. `description.js` only processes characters missing from `character_descriptions.json` — it filters `data.json` characters down to those whose `wookiepedia` URL has no existing entry, so it's always safe/incremental to run, but it will **never** refresh an existing character's description, even if you later change that character's `data.json` fields (e.g. `startYear`). It needs `OPENAI_API_KEY` in `build_scripts/.env` (see `.env.sample`).
   - Known drift: `description.js` derives its own birth/death years from the Wookieepedia page via OpenAI, independent of `data.json`'s hand-authored `startYear`/`endYear`/`birthYear`. The two are never reconciled, so a character with `startYearUnknown: true` can show a header year (from `data.json`) that disagrees with its own generated timeline's first event. Regenerating the description (deleting its entry and re-running `description.js`) does not fix this by itself — the new output can still disagree with `data.json`.
5. `src/data/timelineData.js` is unrelated sample/demo data used only by the experimental `/hyperspace` route (`HyperspaceTimeline.jsx`) — not part of the real data pipeline.

Other `build_scripts/*.js` are one-off/utility scripts, not part of the standard build: `social.js` (generates tweet copy), `website.js` (exports character data for a separate companion site), `getWords.js` (extracts words for a Wordle-style spinoff app).

## Architecture

- **Rendering model**: `Home` (`src/pages/Home/index.jsx`) is the entire app for `/` and `/character/:character`. It's a single large component that positions everything (years, eras, movies, character columns, "seen in" pips, death markers) absolutely using rem-based coordinates computed from `theme.layout` (see `src/themes/jedi.js` / `sith.js`). Year → pixel position is driven by each year's precomputed `yearIndex`, not the literal year value (years with more simultaneous events consume more vertical space).
- **Viewport culling**: `isCharacterInView` in `Home` manually checks each character's computed position against `window.visualViewport` before rendering its column/pills/death marker — an intentional perf optimization, not dead code. If you change character layout math, this check must stay in sync with `Styled.getCharacterLeft/getCharacterTop/getCharacterHeight`.
- **State/context**: `AppContext.jsx` holds global filters, the active theme (Jedi/Sith), zoom `scale`, and the `scrollTo(year, character)` helper. Filtering logic itself lives in `Home`'s effects, reading `filters` from context and re-deriving `filteredCharacters` from the raw `charactersData` import.
- **Routing**: React Router v5 (`Switch`/`Route`, `useHistory`/`useParams`, not v6 APIs). Year and character selection are synced to the URL (`?year=`) and path (`/character/:character`) — treat the URL as part of the app's state, not just navigation.
- **Theming**: styled-components `ThemeProvider`, themes are plain JS objects (`palette`, `layout`, `elements`) in `src/themes/`, switched via `AppContext.setTheme`. Colors are stored as unwrapped `"r,g,b"` strings so they can be interpolated into `rgb(${...})`/`rgba(${...})` at any opacity.
- **Component layers**: `molecules/` (generic, theme-agnostic UI: dropdown, modal, listview), `organisms/` (feature-specific composites: Filter, MainMenu, CharacterDetailModal/Pill, SeenIn, Death, Minimap, ThemeSwitcher, OnboardingGuide), `components/` (currently only used by the experimental hyperspace page). Each organism/molecule typically pairs `index.jsx` with `index.styles.jsx`.
- **Onboarding**: guide visibility is persisted to `localStorage` via `getOnboardingState`/`setOnboardingState` in `src/utils.js`; it's lazy-loaded (`React.lazy`) and shown on first visit or on demand from the main menu.
- **Analytics**: `src/analytics/index.js` exports `analytics.event(...)` and an `ACTIONS` enum; call sites fire events on theme change, character open, etc.

## Code style

- ESLint config (`.eslintrc.json`): single quotes, required semicolons, 2-space indent, `react/prop-types` off, `no-unused-vars` off. Run `npm run lint` before considering JS changes done — CI fails the build on lint errors.

## Also read `src/AGENTS.md`

`.cursor/rules/requirements.mdc` requires every agent to also consult `src/AGENTS.md`, which accumulates learnings over time. Check it for the latest notes; as of this writing it stresses: prefer concise responses and direct implementation over step-by-step narration, check for shared functions before changing them (avoid breaking other call sites), and ask before making product decisions rather than assuming.
