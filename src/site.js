// App-side re-export of the active site pack's config, plus small helpers
// that need it bound (see content-agnostic-site-packs plan, WU-11).
//
// `@siteConfig` resolves (via vite.config.js's alias) to
// sites/<SITE>/site.config.mjs, so this file is the one place `src/`
// imports the pack config from -- everything else should import from here,
// not from `@siteConfig` directly, so there is one seam if the shape ever
// needs an app-only helper added to it.
//
// Keep this in sync with build_scripts/prerenderCharacters.js: it computes
// the same character URL / social image / title-suffix logic for the
// prerendered page as this file computes for the Home page's Helmet block
// on mount. A mismatch here means the crawled HTML and the client-rendered
// HTML disagree.
import config from '@siteConfig';
import { formatYear as formatYearFor } from '../shared/yearFormat.mjs';

// `${origin}/${path}` with any leading slashes on `path` collapsed to one --
// mirrors prerenderCharacters.js's `absolute()`.
export const absolute = (path) => `${config.origin}/${String(path || '').replace(/^\/+/, '')}`;

// Bound to this pack's year-formatting config so call sites don't have to
// thread `config.years` through themselves.
export const formatYear = (year) => formatYearFor(year, config.years);

// Canonical character URL -- NFC-normalized title, percent-encoded, same as
// prerenderCharacters.js's `characterUrl()` (and the filenames it writes).
export const characterUrl = (name) => `${config.origin}/character/${encodeURIComponent(String(name).normalize('NFC'))}`;

// The social card image for a character: a per-character override if the
// pack declares one, else the pack's default social image. Mirrors
// prerenderCharacters.js's `socialImage()`.
export const socialImageFor = (name) => absolute(config.images.socialOverrides?.[name] ?? config.images.social);

export default config;
