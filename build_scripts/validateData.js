// Validates a pack's data.json against the structural invariants
// build_scripts/prepJson.js assumes but never checks itself — today those
// invariants are only discovered as a TypeError mid-build (see the plan's
// "Hard validity rules prepJson.js will crash or mis-render on"). This script
// exists so a bad edit to data.json shows up here, with every problem it
// found and where, instead of one cryptic stack trace at a time.
//
// Zero npm dependencies (only node:fs and ./site.mjs) — build_scripts/ is
// never `npm install`ed by CI, so nothing here may import a package.
//
// Usage:
//   node build_scripts/validateData.js          # SITE=starwars (default)
//   SITE=marvel node build_scripts/validateData.js
import fs from 'node:fs';
import { resolveSite } from './site.mjs';

const site = await resolveSite();
const { config } = site;
const data = JSON.parse(fs.readFileSync(site.dataPath, 'utf8'));

const failures = [];
const fail = (msg) => failures.push(msg);

const characters = data.filter(e => e.type === 'character');
const eras = data.filter(e => e.type === 'era');
// The "events" a character's endYearEvent/seenIn can point at are non-character
// entries (movie/tv/era) -- prepJson.js's _newYears events are built by
// excluding type === 'character' (and eras are appended separately), so a
// character can never legitimately reference another character here.
const eventTitles = new Set(data.filter(e => e.type !== 'character').map(e => e.title));
// seenIn specifically must match a movie/tv title: prepJson.js resolves it via
// `tvMovies.find(d => d.title === s)` where tvMovies = movie/tv entries only.
const tvMovieTitles = new Set(data.filter(e => e.type === 'tv' || e.type === 'movie').map(e => e.title));

// --- titles must be unique WITHIN each namespace ----------------------------
// Not globally: a character may legitimately share a title with the film or
// series named after them (Thor, Blade, Jessica Jones; Star Wars has shipped
// "Obi-Wan Kenobi" as both a character and a tv entry for years). That is
// harmless because the two namespaces are never searched together --
// prepJson.js resolves seenIn against `tvMovies` (type-filtered to movie/tv),
// and only characters are given a prerendered page. What IS dangerous is a
// duplicate inside one namespace: two movies sharing a title makes
// `tvMovies.find(...)` unreachable for the second, and two characters sharing
// one makes their prerendered pages collide on the same filename.
const NAMESPACES = [
  ['movie/tv', e => e.type === 'movie' || e.type === 'tv'],
  ['character', e => e.type === 'character'],
  ['era', e => e.type === 'era'],
];
NAMESPACES.forEach(([label, pred]) => {
  const counts = new Map();
  data.filter(pred).forEach(e => counts.set(e.title, (counts.get(e.title) || 0) + 1));
  counts.forEach((count, title) => {
    if (count > 1) fail(`duplicate ${label} title "${title}" appears ${count} times`);
  });
});

// --- no character title contains "/" or ":" ---------------------------------
// Character titles become filenames (build/character/<Title>.html); "/" would
// create a bogus subdirectory and both characters are unsafe on macOS/Linux.
characters.forEach(e => {
  if (/[/:]/.test(e.title)) {
    fail(`character "${e.title}": title contains "/" or ":", which is unsafe as a filename`);
  }
});

// --- every seenIn string matches a movie/tv title ---------------------------
characters.forEach(e => {
  (e.seenIn || []).forEach(s => {
    if (!tvMovieTitles.has(s)) {
      fail(`character "${e.title}": seenIn entry "${s}" does not match any movie/tv title`);
    }
  });
});

// --- endYearEvent, when required, must match a real (non-character) title ---
characters.forEach(e => {
  if (!e.endYearUnknown) {
    if (!e.endYearEvent) {
      fail(`character "${e.title}": endYearUnknown is falsy but endYearEvent is missing`);
    } else if (!eventTitles.has(e.endYearEvent)) {
      fail(`character "${e.title}": endYearEvent "${e.endYearEvent}" does not match any movie/tv/era title`);
    }
  }
});

// --- startYear <= endYear on every entry -------------------------------------
data.forEach(e => {
  if (typeof e.startYear === 'number' && typeof e.endYear === 'number' && e.startYear > e.endYear) {
    fail(`"${e.title}" (${e.type}): startYear ${e.startYear} is after endYear ${e.endYear}`);
  }
});

// --- global year range --------------------------------------------------------
// Mirrors prepJson.js's _startYear/_endYear: the min startYear and max endYear
// across every entry in the file (any type) -- that's the range its year loop
// actually creates entries for, so anything outside it has nowhere to render.
const globalStart = Math.min(...data.map(e => e.startYear));
const globalEnd = Math.max(...data.map(e => e.endYear));

characters.forEach(e => {
  if (e.startYear < globalStart || e.startYear > globalEnd) {
    fail(`character "${e.title}": startYear ${e.startYear} falls outside the global year range [${globalStart}, ${globalEnd}]`);
  }
  if (e.endYear < globalStart || e.endYear > globalEnd) {
    fail(`character "${e.title}": endYear ${e.endYear} falls outside the global year range [${globalStart}, ${globalEnd}]`);
  }
});

eras.forEach(e => {
  if (e.startYear < globalStart || e.startYear > globalEnd) {
    fail(`era "${e.title}": startYear ${e.startYear} falls outside the global year range [${globalStart}, ${globalEnd}]`);
  }
  if (e.endYear < globalStart || e.endYear > globalEnd) {
    fail(`era "${e.title}": endYear ${e.endYear} falls outside the global year range [${globalStart}, ${globalEnd}]`);
  }
});

// --- every character has a non-empty imageUrl and description ---------------
characters.forEach(e => {
  if (!e.imageUrl || !String(e.imageUrl).trim()) {
    fail(`character "${e.title}": imageUrl is missing or empty`);
  }
  if (!e.description || !String(e.description).trim()) {
    fail(`character "${e.title}": description is missing or empty`);
  }
});

// --- universe: pack-conditional ----------------------------------------------
// Skipped entirely when the pack declares no config.universes (e.g. Star
// Wars) -- that pack's data.json is never required to carry the field at all.
// When a pack does declare universes (Marvel), either every entry has one or
// none do, and every value used must be a real id from config.universes.
if (config.universes) {
  const validUniverseIds = new Set(config.universes.map(u => u.id));
  const withUniverse = data.filter(e => e.universe !== undefined).length;
  if (withUniverse > 0 && withUniverse < data.length) {
    data.forEach(e => {
      if (e.universe === undefined) {
        fail(`"${e.title}" (${e.type}): missing "universe" -- some entries in this pack have one, so all must`);
      }
    });
  }
  data.forEach(e => {
    if (e.universe !== undefined && !validUniverseIds.has(e.universe)) {
      fail(`"${e.title}" (${e.type}): universe "${e.universe}" is not one of config.universes' ids (${[...validUniverseIds].join(', ')})`);
    }
  });
}

if (failures.length > 0) {
  console.error(`VALIDATE FAILED — ${failures.length} problem(s) in ${site.dataPath}:`);
  failures.forEach(f => console.error(`  - ${f}`));
  process.exit(1);
}

console.log(`VALIDATE PASSED — ${data.length} entries`);
