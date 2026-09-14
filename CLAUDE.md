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

- `social-desc` is a purpose-written meta description — Claude writes it *as* a description (the `socialDesc` field in `character_descriptions.json`), not by truncating the bio. Truncating meant the meta description restated the page's own opening sentence, often cut mid-word with an ellipsis, which Google discards; ~79 hub character pages sat in "Crawled — currently not indexed" partly on that. Falling back to the old truncate chain still happens for an entry with no `socialDesc`. `social-title` is `"Name — Star Wars Timeline & Story"`. Both feed `_includes/head.html` (meta description, OG/Twitter) and the character JSON-LD.
- A `character:` front-matter block (species, homeworld, birth/death year, wookieepedia, appearances) is emitted for future hub use. **Nothing in the hub reads it yet** — the same facts already render in the page body's `metadata` div, so don't duplicate them in the layout.
- `last_modified_at` is only re-stamped when the body or the rest of the front matter actually changed, so a re-run doesn't churn all ~80 hub pages.
- Timeline events are emitted as `<h3>` (were `<h4>`), matching the h1 → h2 outline the hub layout supplies.
- **Every emitted internal link must be the exact canonical URL — no redirect, no alternate form.** Two rules, both learned from Search Console: character pages have no `permalink`, so Jekyll emits `<slug>.html` and *that* is the canonical, but Netlify also serves the extensionless `/character/<slug>` with a 200 — linking the extensionless form made Google index the `.html` URL and file the linked one as "Alternate page with proper canonical tag" (fixed 2026-08-10). Use the `characterPageUrl()` helper, never hand-build the path. Separately, `/character` 301s to `/character/`, so the "Back to All Characters" links are written with the trailing slash. Slugs also stay lowercase — see the comment above `slug()`.

Changing the shape of that generated output (front matter keys, heading levels, file naming) is a **cross-repo change** — check the hub's `_layouts/character.html` and `_includes/structured-data.html` before shipping it.

## Site packs (read before "Commands")

This app is a **content-agnostic timeline engine** selected by an env var. Everything content-specific — data, config, themes, assets, and generated output — lives in one folder per deployment under `sites/`:

```
sites/starwars/   site.config.mjs   data.json   character_descriptions.json
                  index.template.html   themes/   assets/   public/   generated/
sites/marvel/     same shape, skeleton dataset
```

- **`SITE`** picks the pack and defaults to `starwars` — set it (`SITE=marvel npm start`) to build/run a different pack. `build_scripts/site.mjs` (`resolveSite()`) is the single place this env var is read on the Node side; `vite.config.js` reads it the same way for the app/test side.
- **`sites/<site>/data.json` is the source of truth** for that pack's timeline content (characters, movies, TV, eras) — it used to live at the repo root under `build_scripts/`; that location is gone.
- **`sites/<site>/generated/*.json`** (`years.json`, `characters.json`, `filters.json`, `seenIn.json`) is what `prepJson.js` computes from `data.json` — it used to live under a repo-root `data/` folder inside `src/`; that no longer exists (the one exception is `timelineData.js`, unrelated demo data for the experimental `/hyperspace` route, still at its old location — see below).
- **`@site` and `@siteConfig`** are Vite resolve aliases pointing at `sites/<SITE>/` and `sites/<SITE>/site.config.mjs` respectively (`vite.config.js`). Vitest inherits them from the same config, so app code and tests import `@site/generated/characters.json`, `@site/themes/jedi`, `@siteConfig`, etc. without a separate test alias.
- **`shared/yearFormat.mjs`** is the single `formatYear(year, yearsConfig)` used everywhere years are displayed — each pack supplies its own `years` config block (Star Wars: `BBY`/`ABY` with year 0 folded into BBY; Marvel: plain calendar years). Zero dependencies (imported by `build_scripts/prerenderCharacters.js`, which must stay dependency-free).
- **Root `index.html` is generated, not authored.** `prepJson.js` builds it from `sites/<SITE>/index.template.html` on every `prestart`/`prebuild`; it's gitignored (`/index.html` in `.gitignore`). Edit the pack's `index.template.html`, never the generated root file.
- **The Marvel pack builds locally (`SITE=marvel npm run build:full`) but has no CI job.** Marvel hosting is deferred — a plain GitHub Pages repo would serve from a sub-path and break every absolute reference this app makes (`/favicon.ico`, `/character/<Name>`, etc.). `.github/workflows/node.js.yml` pins `SITE: starwars` and only ever produces the Star Wars build; `sites/marvel/generated/*.json` is produced locally only.
- **The cross-repo hub export (`build_scripts/website.js` → `../starwars-guide`) is unchanged and Star Wars-only** — gated on `config.hubExport.enabled` (`true` for Star Wars, `false` for Marvel, which exits immediately and touches nothing). See "This repo writes content into the hub" below; none of those rules changed.

## Brand ecosystem — all apps

Every repo is checked out beside this one under `/Volumes/T9/git/`. The canonical table (with sync/dispatch details) lives in `../starwars-guide/CLAUDE.md` — update there first, then mirror here.

| Repo | What it is | Live at |
|---|---|---|
| `starwars-guide` | Jekyll hub site — landing pages, character pages, blog, SEO | starwars.guide |
| `starwars-timeline` **(this repo)** | React interactive timeline; generates hub `character/*.md` | timeline.starwars.guide |
| `swordle` | React Wordle game front end | wordle.starwars.guide |
| `swordle-data` | SWordle word-list source of truth; generates hub `swordle-word-list.md` | — |
| `hyperpanels/search` | Next.js comic-panel search FE + admin | hyperpanels.starwars.guide |
| `hyperpanels/data` | Python ingestion pipeline (panels → OpenAI Vision → Typesense) | — |
| `hyperpanels/keyboard` | iOS app + custom keyboard over the same Typesense catalog | App Store (in progress) |
| `clone-defense` | Canvas 2D tower-defense game (Jedi Defense); ships as a subdirectory of the hub | starwars.guide/clone-defense (launching) |

## Commands

Run from the repo root (`starwars-timeline/`). All of these accept a `SITE=` prefix (e.g. `SITE=marvel npm start`) to target a different pack; omitted, everything defaults to `starwars`.

- `npm start` — regenerates `sites/<SITE>/generated/*.json` and the root `index.html` (`prestart`), then Vite dev server on port 3000
- `npm run lint` — ESLint over `src/**/*.{js,jsx}`, `sites/**/*.{js,mjs}`, `shared/*.mjs`, and `scripts/*.js`
- `npm run build` — regenerates the same way (`prebuild`), then production build (Vite, output to `build/`)
- `npm run build:full` — `npm run build` followed by `npm run prerender` (see "Prerendered character pages" below) — the closest thing to a full local production build
- `npm run prerender` — runs `build_scripts/prerenderCharacters.js` alone (assumes `build/` already exists)
- `npm run preview` — serve the built `build/` locally to sanity-check a production bundle
- `npm test` — Vitest, single run (scope to one file with `npm test -- utils.test.js`)
- `npm run test:watch` — Vitest in watch mode

Tests run on **Vitest** (config lives in the `test` block of `vite.config.js`), with `globals: true` so `describe`/`it`/`expect` need no imports — but mocking uses `vi.*`, not `jest.*`. `src/setupTests.js` pulls in `@testing-library/jest-dom` matchers. `SITE=marvel npm test` runs the same suite against the Marvel pack. CI runs `npm test` for Star Wars only (see "Site packs" above — there is no Marvel CI job).

When mocking `molecules/modal`, mirror its real structure: the backdrop takes `onClickBg`, but children sit inside an inner wrapper that calls `e.stopPropagation()`. A flat mock makes every click on a child also register as a backdrop click.

Never call `render()` inside a `waitFor()` callback — `waitFor` re-invokes on a poll, so each tick mounts another React tree and the run dies with a heap OOM rather than a useful failure.

### Build tooling (Vite)

`vite.config.js` is deliberately small, but several things matter:

- **`build.outDir` is `build`**, not Vite's default `dist`, so CI's `cp -r ./build/. ./docs/` and the `/build` entry in `.gitignore` keep working.
- **`publicDir` is `sites/${SITE}/public`**, not the default repo-root `public/` (which no longer exists) — each pack's static assets (favicon, `CNAME`, `.nojekyll`, `images/`, `contentTemplate.html`, etc.) are copied to the build root verbatim from there.
- **`resolve.alias` defines `@site` → `sites/${SITE}/` and `@siteConfig` → `sites/${SITE}/site.config.mjs`.** App code imports pack content through these (`@site/generated/characters.json`, `@site/themes/jedi`, `@siteConfig`) rather than relative paths, so the same `src/` works unmodified against any pack. Vitest inherits `resolve.alias` from this same config — there is no separate test alias.
- **Root `index.html` is a generated build artifact, not a source file.** Vite still treats it as the app entry point and build template — it ends with `<script type="module" src="/src/index.jsx">` — but its content comes from `sites/<SITE>/index.template.html` via `build_scripts/prepJson.js`, run automatically by the `prestart`/`prebuild` npm scripts. It's listed in `.gitignore`. **Edit the pack's `index.template.html`, never the root `index.html` directly** — it will be overwritten on the next `npm start`/`npm run build`.

Any file containing JSX **must** use a `.jsx` extension. esbuild only parses `.jsx`/`.tsx` as JSX, and for production builds `@vitejs/plugin-react` hands the transform to esbuild — a `.js` file with JSX in it fails the build with `Expression expected`. This includes `*.styles.jsx` files, several of which wrap elements (e.g. `styled((props) => <div {...props} />)`).

SVGs are imported two ways: `import X from './x.svg'` gives a URL (inlined as a data URI under 4 kB), and `import X from './x.svg?react'` gives a React component via `vite-plugin-svgr`. The `?react` suffix replaces CRA's `import { ReactComponent as X }`.

CI (`.github/workflows/node.js.yml`) pins `SITE: starwars` at job level and runs, in order: `npm ci` → `npm run lint` → `npm test` → `node prepJson.js` (from `build_scripts/`) → `npm run build` → `node prerenderCharacters.js` (from `build_scripts/`) → replaces `docs/` wholesale with `build/.` and commits. `docs/` is the actual GitHub Pages output directory — it's checked in and regenerated by CI, not built locally as part of normal dev. There is no Marvel job (see "Site packs" above); Marvel only ever builds locally via `SITE=marvel`.

### Prerendered character pages (SEO — don't break this)

GitHub Pages is a plain static file server: with no file behind `/character/<Name>` it answers **HTTP 404**, and `public/404.html` (the spa-github-pages shim) only papers over that for humans — Googlebot logged every character URL as "Not found". So `build_scripts/prerenderCharacters.js` writes one **flat** `build/character/<Title>.html` per character *after* `npm run build` (it reuses the built `index.html`, so the hashed asset refs stay correct). `npm run build:full` does both locally, for whichever pack `SITE` selects.

Relies on three verified GitHub Pages behaviors: it serves `<path>.html` for an extensionless request with a **200 and no redirect**; it **404s** trailing-slash requests (so `<Title>/index.html` would *not* work); and it percent-decodes the path before the filesystem lookup, so `Luke%20Skywalker` and `Padm%C3%A9…` resolve to the literal filenames.

Rules when touching this:

- The script has **zero dependencies** — CI only runs `npm ci` at the repo root and never installs `build_scripts/node_modules`. It imports `build_scripts/site.mjs` (the `SITE` resolver) and `shared/yearFormat.mjs`, both of which must stay dependency-free (Node builtins only) for the same reason.
- `index.html` must keep its `<!-- PRERENDER:BODY:START/END -->` markers and its `<link rel="canonical" href="<pack origin>/" />` line (Star Wars: `https://timeline.starwars.guide/`); both `prepJson.js` and the prerenderer anchor on them and throw if they're gone. Every pack's `index.template.html` must carry both, verbatim.
- Injected `<meta>` tags carry `data-react-helmet="true"` so react-helmet **replaces** rather than duplicates them on mount; the canonical `<link>` deliberately does not (helmet emits no link tags here). Head tags in `src/pages/Home/index.jsx` and in the prerenderer must stay in sync — both read the `metaDescription` that `prepJson.js` precomputes into `characters.json`, and both read the same pack config for site name, social handles, and JSON-LD field mappings.
- Character URLs are canonical **without** query params. `?year=` links are fine for humans (same file, canonical dedupes them); `&show=true` is gone.
- JSON-LD `homeLocation` (from `config.metadataJsonLd.homeworldField`) is only emitted when the pack declares a real homeworld field **and** its value isn't the literal string `'Unknown'`. A pack with no notion of a homeworld (Marvel maps this JSON-LD slot's config to `null`, since its closest field is `Affiliation`, not a place) must leave `homeworldField` unset rather than pointing it at a non-place field — that would otherwise emit a schema.org-valid but semantically wrong `homeLocation`.
- `src/index.jsx` uses `ReactDOM.render`, which wipes the container — moving to `createRoot`/`hydrateRoot` would turn the prerendered body into a hydration mismatch.

There is a **separate** Node project in `build_scripts/` with its own `package.json`/`package-lock.json` (type: module, ESM). Install its deps separately (`cd build_scripts && npm install`) if running its scripts locally. It needs `ANTHROPIC_API_KEY` in a `.env` file there (see `.env.sample`) for the description-generation scripts.

## Data pipeline (important — read before editing timeline content)

The app does **not** hand-author `sites/<SITE>/generated/*.json`. Those files are generated, per pack:

1. `sites/<SITE>/data.json` is the source of truth — a flat array of entries with `type` (`character`, `movie`, `tv`, `era`), `startYear`/`endYear`, `metadata`, `seenIn`, etc. For the live site this is `sites/starwars/data.json`; `SITE` selects which pack's file `prepJson.js` reads (default `starwars`).
2. `build_scripts/prepJson.js` (run from the repo root or `build_scripts/` — it resolves all paths via `build_scripts/site.mjs`'s `resolveSite()`, never `process.cwd()`) reads `data.json` plus `sites/<SITE>/character_descriptions.json` (AI-generated bios/timelines, produced separately by `build_scripts/description.js` using Claude) and computes derived, denormalized output into `sites/<SITE>/generated/`:
   - `years.json` — one entry per year with `yearIndex` and the events happening that year (used to position everything vertically)
   - `characters.json` — characters with resolved `seenIn` (grouped by year, cross-referenced against movies/TV), `yearIndex`, `deathEvent`, filter metadata
   - `filters.json` — aggregated filter facets (species, homeworld, etc.) with counts, derived from character `metadata`
   - `seenIn.json` — aggregated "seen in" facet (movies/shows) with counts
   - It also builds the root `index.html` from `sites/<SITE>/index.template.html` (splicing in the SEO content block the same way as before — the template's `<div id="content">` inside `<div id="root">` is what React replaces on mount), plus `sites/<SITE>/public/<pack>_movies.html`, `<pack>_tvshows.html`, `<pack>_characters.html`, and `sites/<SITE>/public/sitemap.xml` (filenames come from `config.seoPages`, e.g. `starwars_movies.html` for the Star Wars pack — kept as-is, "timline" typos and all, since they're indexed).
   - `npm start`/`npm run build` run this automatically via the `prestart`/`prebuild` npm scripts, so a fresh checkout or a `data.json` edit doesn't require a manual step before the dev server picks it up — but `node build_scripts/prepJson.js` (or `SITE=marvel node build_scripts/prepJson.js`) still works standalone.
3. **To add/edit timeline content (a character, movie, era, etc.), edit `sites/<SITE>/data.json`, then run `node build_scripts/prepJson.js` (`SITE=` prefix for a non-default pack) to regenerate everything in `sites/<SITE>/generated/`.** Do not hand-edit `sites/<SITE>/generated/*.json` directly — it will be overwritten. Before running `prepJson.js`, run `node build_scripts/validateData.js` (same `SITE=` prefix) — it checks the structural invariants `prepJson.js` assumes but does not itself check (every `title` unique across the file, no `character` title containing `/` or `:`, every `seenIn` string matching a real movie/tv title, every non-`endYearUnknown` character's `endYearEvent` matching a real entry, `startYear <= endYear`, characters/eras falling inside the pack's overall year range, every character having a non-empty `imageUrl`/`description`, and — pack-conditional — `universe` consistency, see below) and prints every problem it finds rather than letting `prepJson.js` crash on the first one. Zero npm dependencies (only `node:fs` and `./site.mjs`), matching every other script in `build_scripts/`.
4. **Adding a new character**: after adding its entry to `data.json` (with a `wookiepedia` URL for Star Wars, or whatever `config.contentGen.wikiUrlField` names for another pack), also run `node description.js` from `build_scripts/` to generate its bio/timeline into `character_descriptions.json` before running `prepJson.js`. It needs `ANTHROPIC_API_KEY` in `build_scripts/.env` (see `.env.sample`).
   - `description.js` runs **Claude Opus 4.8** with the `web_search` / `web_fetch` server tools, so it reads the character's wiki page (Wookieepedia for Star Wars; each pack's `config.contentGen.wikiName`/`wikiDomain` otherwise) rather than recalling it. It sends the character's **whole `data.json` entry** plus a field guide explaining our conventions (negative years are BBY for Star Wars — the sign/label convention comes from the pack's `years` config, read via `shared/yearFormat.mjs`; `startYear` vs `birthYear`; what `startYearUnknown` / `endYearUnknown` actually mean), and asks Claude to verify the dates — especially the ones we present as known — before writing anything. Runs are bounded to 3 concurrent; each character takes minutes.
   - Output per character: `description`, `socialDesc` (the ~150-character meta description), `timeline`, a `dates` block (`birth` / `death`, each with `year` in timeline convention, a `confidence` of confirmed/estimated/unknown, and a `source`), and `notes` — corrections, additions, and canon ambiguities for you to act on. The script **also** cross-checks the returned years against `data.json` itself and prepends an `auto: true` correction note on any disagreement, so drift can't hide in prose. Notes are printed at the end of the run and stored in `character_descriptions.json`; `prepJson.js` and `website.js` read `description` / `socialDesc` / `timeline`, so the remaining keys are inert. **Nothing writes back to `data.json`** — acting on a note is a manual edit.
   - Selection: bare `node description.js` processes only characters missing from `character_descriptions.json` (safe/incremental, never refreshes an existing entry). `--all` regenerates everything; `node description.js "Ahsoka Tano" "Grogu"` regenerates just those; `--dry-run` prints the prompts and calls nothing. Results are written after each character, so an interrupted run keeps its work.
   - `--social-only` is a separate, cheap pass that rewrites the **stored** `description` into `socialDesc` — no web tools, no `data.json`, one turn on `SOCIAL_MODEL` (Sonnet 5) instead of minutes on Opus. It takes the same `--all` / named-character / `--dry-run` selection, defaulting to entries that have no `socialDesc` yet. Use it to backfill after a `SOCIAL_RULES` change; a normal run already emits `socialDesc` alongside the bio, so it is not part of adding a character. An answer over 160 characters is re-asked once and only truncated if the retry also overruns — the run warns when that happens, since a truncated line is the exact failure this field exists to remove.
5. **The optional `universe` field is Marvel-only.** Any `data.json` entry — `character`, `movie`, `tv`, or `era` — may carry a top-level `universe` string (a kebab-case id like `mcu`, `raimi`, `fox-xmen`; the id → `{ label, shortLabel, order }` registry lives in `sites/marvel/site.config.mjs`'s `universes` array, which nothing reads yet — it exists for a future universe picker). It exists because Marvel spans several in-story continuities that overlap in time (MCU, Sony's two Spider-Man runs, Fox's X-Men/Fantastic Four, the Netflix Defenders block, pre-MCU one-offs). **Star Wars has exactly one continuity and must never gain this field** — `sites/starwars/site.config.mjs` has no `universes` key, and every check involving it is pack-conditional so Star Wars data never has to carry it.
   - It propagates through `prepJson.js` almost for free: `years.json` and `characters.json` are built via object spreads (`{ ...e, ... }`), which carry `universe` straight through when present. The **one exception** is `seenIn.json`, which is built by explicit field-by-field construction — that one `_seenInFilter.push(...)` call needed one added key, `universe: movie.universe`. `JSON.stringify` omits an own property whose value is `undefined`, so for a pack whose entries have no `universe` (Star Wars, where `movie.universe` is always `undefined`) that key is dropped entirely and the emitted bytes/key order are unchanged — verified with `bash scripts/seo-compare.sh`, not just asserted.
   - It is deliberately **not** mirrored into `metadata` — `metadata` is what `filters.json` is derived from, and folding `universe` in there would pollute that unrelated facet.
   - `build_scripts/prerenderCharacters.js` emits a `Universe: <label>` line in the prerendered page body when `character.universe` resolves against `config.universes`. The added newline lives **inside** that conditional expression, appended to the end of the existing lifespan `<p>` line — never on its own source line — specifically so a pack with no `universe` values (Star Wars) renders byte-identical prerendered pages; a line-level `if` would have inserted a stray blank line on every Star Wars character page.
   - Duplicate character names across universes are disambiguated as **`Name (shortLabel)`** — e.g. `Peter Parker (MCU)`, `Peter Parker (Raimi)`, `Peter Parker (Amazing)` — applied only when the same name collides across more than one universe; every non-colliding name keeps its plain title.
   - Marvel years are **in-story** years (when the story is set), not release years, and are plain calendar years with no BBY/ABY-style split — unlike Star Wars, which uses signed BBY/ABY years around a year-zero rule (see each pack's `years` config in its `site.config.mjs`, read via `shared/yearFormat.mjs`).
6. `src/data/timelineData.js` is unrelated sample/demo data used only by the experimental `/hyperspace` route (`HyperspaceTimeline.jsx`), gated behind `config.features.hyperspace` (`true` for Star Wars, `false` for Marvel) — not part of the real data pipeline, and not moved into a pack.

Other `build_scripts/*.js` are one-off/utility scripts, not part of the standard build: `social.js` (generates tweet copy), `website.js` (exports character data for the hub — Star Wars only, see below), `getWords.js` (extracts words for a Wordle-style spinoff app). All of them resolve the active pack the same way as `prepJson.js`, via `build_scripts/site.mjs`.

## Architecture

- **Rendering model**: `Home` (`src/pages/Home/index.jsx`) is the entire app for `/` and `/character/:character`. It's a single large component that positions everything (years, eras, movies, character columns, "seen in" pips, death markers) absolutely using rem-based coordinates computed from `theme.layout` (see `src/themes/jedi.js` / `sith.js`). Year → pixel position is driven by each year's precomputed `yearIndex`, not the literal year value (years with more simultaneous events consume more vertical space).
- **Viewport culling**: `isCharacterInView` in `Home` manually checks each character's computed position against `window.visualViewport` before rendering its column/pills/death marker — an intentional perf optimization, not dead code. If you change character layout math, this check must stay in sync with `Styled.getCharacterLeft/getCharacterTop/getCharacterHeight`.
- **State/context**: `AppContext.jsx` holds global filters, the active theme (Jedi/Sith), zoom `scale`, and the `scrollTo(year, character)` helper. Filtering logic itself lives in `Home`'s effects, reading `filters` from context and re-deriving `filteredCharacters` from the raw `charactersData` import.
- **Routing**: React Router v5 (`Switch`/`Route`, `useHistory`/`useParams`, not v6 APIs). Year and character selection are synced to the URL (`?year=`) and path (`/character/:character`) — treat the URL as part of the app's state, not just navigation.
- **Theming**: styled-components `ThemeProvider`, themes are plain JS objects (`palette`, `layout`, `elements`) in `sites/<SITE>/themes/` (imported via `@site/themes`, e.g. `jedi.js`/`sith.js` for Star Wars), switched via `AppContext.setTheme`. `AppContext` reads the pack's ordered theme list from `@site/themes` rather than hardcoding theme names; a pack with a single theme (e.g. Marvel) causes `ThemeSwitcher` to render nothing. Colors are stored as unwrapped `"r,g,b"` strings so they can be interpolated into `rgb(${...})`/`rgba(${...})` at any opacity.
- **Component layers**: `molecules/` (generic, theme-agnostic UI: dropdown, modal, listview), `organisms/` (feature-specific composites: Filter, MainMenu, CharacterDetailModal/Pill, SeenIn, Death, Minimap, ThemeSwitcher, OnboardingGuide), `components/` (currently only used by the experimental hyperspace page). Each organism/molecule typically pairs `index.jsx` with `index.styles.jsx`.
- **Onboarding**: guide visibility is persisted to `localStorage` via `getOnboardingState`/`setOnboardingState` in `src/utils.js`; it's lazy-loaded (`React.lazy`) and shown on first visit or on demand from the main menu.
- **Analytics**: `src/analytics/index.js` exports `analytics.event(...)` and an `ACTIONS` enum; call sites fire events on theme change, character open, etc.

## Code style

- ESLint config (`.eslintrc.json`): single quotes, required semicolons, 2-space indent, `react/prop-types` off, `no-unused-vars` off. Run `npm run lint` before considering JS changes done — CI fails the build on lint errors.

## Also read `src/AGENTS.md`

`.cursor/rules/requirements.mdc` requires every agent to also consult `src/AGENTS.md`, which accumulates learnings over time. Check it for the latest notes; as of this writing it stresses: prefer concise responses and direct implementation over step-by-step narration, check for shared functions before changing them (avoid breaking other call sites), and ask before making product decisions rather than assuming.
