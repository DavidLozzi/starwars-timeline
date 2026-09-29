// Helpers shared by the scripts that write pages into the starwars-guide hub
// (website.js, moviePages.js). Dependency-free for the same reason as
// textUtils.js: CI never installs build_scripts/node_modules.
import fs from 'fs';

export const HUB = '../../starwars-guide';

export const convertYear = (year) => {
  if (year <= 0) return `${year * -1} BBY`;
  if (year > 0) return `${year} ABY`;
  return 'none';
};

// YAML double-quoted scalars accept JSON string escaping, so JSON.stringify is a
// safe quoter for names/descriptions containing colons, quotes or apostrophes.
export const yaml = (value) => JSON.stringify(String(value ?? ''));

// character.imageUrl already starts with a slash, so join without doubling it.
export const imageSrc = (url) => `https://timeline.starwars.guide/${String(url || '').replace(/^\/+/, '')}`;

// Netlify 301s any URL containing an uppercase letter to its lowercase form, so
// mixed-case filenames made every character page a "Page with redirect" in
// Search Console. Keep slugs lowercase.
export const slug = (title) => title.replace(/\s/ig, '-').toLowerCase();

// The hub sets `permalink: /character/:basename/` as a front-matter default, so
// the trailing-slash `/character/<slug>/` IS the canonical — the sitemap and the
// canonical tag both point at it, and the old `<slug>.html` URLs 301 there via
// netlify.toml. Linking the .html form would send every internal link through a
// redirect, which is what put ~79 pages in "Duplicate, Google chose different
// canonical" in Search Console. Always link the trailing-slash form.
export const characterPageUrl = (title) => `/character/${slug(title)}/`;

export const meta = (character, name) => character.metadata?.find(m => m.name.toLowerCase() === name.toLowerCase())?.value;

// Only stamp a new last_modified_at when the page body or the rest of the front
// matter actually changed — otherwise every run rewrites all ~80 hub pages.
const isVolatile = (line) => line.startsWith('last_modified_at:');

const existingPage = (filePath) => {
  try {
    const contents = fs.readFileSync(filePath, 'utf8');
    const match = /^---\n([\s\S]*?)\n---\n/.exec(contents);
    if (!match) return null;
    const lines = match[1].split('\n');
    const lastModified = lines.find(isVolatile)?.replace(/^last_modified_at:\s*/, '').trim();
    return {
      stable: lines.filter(l => !isVolatile(l)),
      lastModified,
      body: contents.slice(match[0].length),
    };
  } catch {
    return null;
  }
};

export const writePage = (filePath, frontMatterLines, body) => {
  const previous = existingPage(filePath);
  const stable = frontMatterLines.filter(l => !isVolatile(l));
  const unchanged = !!previous
    && previous.body === body
    && previous.stable.join('\n') === stable.join('\n');
  const lastModified = unchanged && previous.lastModified
    ? previous.lastModified
    : new Date().toISOString();
  const withStamp = frontMatterLines.map(l => isVolatile(l) ? `last_modified_at: ${lastModified}` : l);
  fs.writeFileSync(filePath, `---\n${withStamp.join('\n')}\n---\n${body}`);
  return unchanged;
};
