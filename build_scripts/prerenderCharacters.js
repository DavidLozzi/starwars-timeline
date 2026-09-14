// Prerenders one static HTML file per character into build/character/.
//
// Why: GitHub Pages is a static file server. Without a file behind
// /character/<Name> it answers 404 and public/404.html only fixes that for
// humans (it redirects in JS), so Googlebot logged every character URL as
// "Not found". GitHub Pages serves <path>.html for an extensionless request
// with a 200 and no redirect, and percent-decodes the path before the lookup,
// so build/character/Luke Skywalker.html answers /character/Luke%20Skywalker.
//
// Run AFTER `npm run build` -- it reuses the built index.html so the hashed
// asset references stay correct. Zero dependencies: CI only installs the root
// package, never build_scripts/node_modules.

import fs from 'fs';
import path from 'path';
import { sanitize, escapeAttr, escapeHtml } from './textUtils.js';
import { resolveSite } from './site.mjs';

// site.mjs is builtin-only, so this script stays dependency-free as required:
// CI installs the root package but never build_scripts/node_modules.
const site = await resolveSite();
const { config } = site;

const BUILD_DIR = site.buildDir;
const OUT_DIR = site.outDir;
const BODY_START = '<!-- PRERENDER:BODY:START -->';
const BODY_END = '<!-- PRERENDER:BODY:END -->';
const HOME_CANONICAL = `<link rel="canonical" href="${config.origin}/" />`;

const template = fs.readFileSync(path.join(BUILD_DIR, 'index.html'), 'utf-8');
const characters = JSON.parse(fs.readFileSync(path.join(site.generatedDir, 'characters.json'), 'utf-8'));

const bodyStartAt = template.indexOf(BODY_START);
const bodyEndAt = template.indexOf(BODY_END);
if (bodyStartAt === -1 || bodyEndAt === -1) {
  throw new Error(`build/index.html is missing the ${BODY_START} / ${BODY_END} markers`);
}
if (!template.includes(HOME_CANONICAL)) {
  throw new Error(`build/index.html is missing the home canonical line: ${HOME_CANONICAL}`);
}
if (!template.includes('</head>')) {
  throw new Error('build/index.html has no </head>');
}

const characterUrl = (title) => `${config.origin}/character/${encodeURIComponent(title.normalize('NFC'))}`;
const absolute = (url) => `${config.origin}/${String(url || '').replace(/^\/+/, '')}`;
const meta = (character, name) => character.metadata?.find(m => m.name.toLowerCase() === name.toLowerCase())?.value;
// Marvel-only: labels a character's universe (e.g. "Marvel Cinematic
// Universe") so duplicate names across continuities (the three Spider-Men)
// are distinguishable on their prerendered pages. Star Wars characters carry
// no `universe`, and config.universes is unset for that pack, so this always
// resolves to undefined there.
const universeLabel = (c) => config.universes?.find(u => u.id === c.universe)?.label;

// Matches the react-helmet logic in src/pages/Home: only characters listed in
// config.images.socialOverrides have a bespoke social card, everyone else
// shares the site card.
const socialImage = (character) => absolute(config.images.socialOverrides[character.title] ?? config.images.social);

// react-helmet's updateTags only removes tags carrying data-react-helmet, so
// anything it also renders must be stamped or the page ends up with two
// descriptions, two og:titles etc. after React mounts. The canonical link is
// deliberately unstamped -- helmet never emits link tags here, so it survives.
const metaTag = (attr, name, content) =>
  `<meta data-react-helmet="true" ${attr}="${name}" content="${escapeAttr(content)}">`;

const headFor = (character) => {
  const url = characterUrl(character.title);
  const title = `${character.title}${config.characterTitleSuffix}`;
  const description = character.metaDescription;
  const image = socialImage(character);
  const wikiUrl = character[config.labels.wikiField];

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Person',
        '@id': `${url}#person`,
        name: character.title,
        description,
        url,
        image: absolute(character.imageUrl),
        ...(meta(character, config.metadataJsonLd.speciesField) ? { additionalType: 'FictionalCharacter' } : {}),
        // homeworldField is optional: a pack with no notion of a homeworld (e.g.
        // Marvel, which maps this JSON-LD slot to Affiliation) sets it to
        // null/unset so we never emit a homeLocation for a non-place value.
        ...(config.metadataJsonLd.homeworldField
          && meta(character, config.metadataJsonLd.homeworldField)
          && meta(character, config.metadataJsonLd.homeworldField) !== 'Unknown'
          ? { homeLocation: { '@type': 'Place', name: meta(character, config.metadataJsonLd.homeworldField) } }
          : {}),
        ...(wikiUrl ? { sameAs: [wikiUrl] } : {})
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: config.siteName, item: `${config.origin}/` },
          { '@type': 'ListItem', position: 2, name: config.labels.charactersBreadcrumb, item: `${config.origin}/${config.seoPages.characters.file}.html` },
          { '@type': 'ListItem', position: 3, name: character.title, item: url }
        ]
      }
    ]
  };

  return [
    `<title>${escapeHtml(title)}</title>`,
    metaTag('name', 'description', description),
    metaTag('name', 'twitter:card', 'summary_large_image'),
    metaTag('name', 'twitter:site', config.social.twitterSite),
    metaTag('name', 'twitter:creator', config.social.twitterCreator),
    metaTag('name', 'twitter:title', title),
    metaTag('name', 'twitter:description', description),
    metaTag('name', 'twitter:image', image),
    metaTag('property', 'og:type', 'profile'),
    metaTag('property', 'og:site_name', config.siteName),
    metaTag('property', 'og:title', title),
    metaTag('property', 'og:url', url),
    metaTag('property', 'og:description', description),
    metaTag('property', 'og:image', image),
    `<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>`
  ].map(tag => `  ${tag}`).join('\n');
};

const lifespan = (character) => {
  const born = character.startYearUnknown ? null : character.birthYearDisplay;
  const died = character.endYearUnknown ? null : character.endYearDisplay;
  if (born && died) return `${character.title} was born in ${born} and died in ${died}.`;
  if (born) return `${character.title} was born in ${born}.`;
  if (died) return `${character.title} died in ${died}.`;
  return '';
};

const bodyFor = (character) => {
  const name = escapeHtml(character.title);
  const url = `/character/${encodeURIComponent(character.title.normalize('NFC'))}`;
  // Timeline events are authored as h4; this page owns the h1, so demote them
  // to h3 to keep the outline h1 > h2 > h3 (same demotion website.js does).
  const timeline = sanitize(character.timeline || '').replace(/<(\/?)h4>/gi, '<$1h3>');
  const events = character.seenIn
    .slice()
    .sort((a, b) => a.year > b.year ? 1 : -1)
    .flatMap(y => y.events.map(e => ({ year: y.year, event: e })));
  const birthYear = character.startYearUnknown ? null : (character.birthYear ?? character.startYear);
  const wikiUrl = character[config.labels.wikiField];

  return `<h1>${name}</h1>
<p class="breadcrumb"><a href="/">${escapeHtml(config.siteName)}</a> &rsaquo; <a href="/${config.seoPages.characters.file}.html">${escapeHtml(config.labels.charactersBreadcrumb)}</a> &rsaquo; ${name}</p>
<img src="${escapeAttr(character.imageUrl)}" alt="${escapeAttr(character.title)}" width="200" />
<p>${escapeHtml(lifespan(character))}</p>${universeLabel(character) ? `\n<p class="universe">Universe: ${escapeHtml(universeLabel(character))}</p>` : ''}
<div>${sanitize(character.description || '')}</div>
${(character.metadata?.length > 0)
    ? `<dl>\n${character.metadata.map(m => `  <dt>${escapeHtml(m.name)}</dt><dd>${escapeHtml(m.value)}</dd>`).join('\n')}\n</dl>`
    : ''}
${timeline}
<h2>${name} in the timeline</h2>
<ul>
${events.map(({ year, event }) => {
    const age = birthYear === null ? '' : ` (${year - birthYear} years old)`;
    return `  <li><a href="${escapeAttr(`${url}?year=${event.startYear}`)}">${escapeHtml(event.title)}, ${escapeHtml(event.startYearDisplay)}${age}</a></li>`;
  }).join('\n')}
</ul>
${wikiUrl
    ? `<p><a href="${escapeAttr(wikiUrl)}" rel="nofollow noopener" target="_blank">${name} ${escapeHtml(config.labels.wikiLinkSuffix)}</a></p>`
    : ''}
<p><a href="/${config.seoPages.characters.file}.html">${escapeHtml(config.labels.allCharactersText)}</a></p>`;
};

fs.mkdirSync(OUT_DIR, { recursive: true });

// Assemble by slicing rather than String.replace: bios and titles contain
// characters ($&, $1, ...) that replace() would interpret in the replacement.
const headEndAt = template.indexOf('</head>');
const head = template.slice(0, headEndAt);
const betweenHeadAndBody = template.slice(headEndAt, bodyStartAt + BODY_START.length);
const afterBody = template.slice(bodyEndAt);
const canonicalAt = head.indexOf(HOME_CANONICAL);

characters.forEach(character => {
  const headWithCanonical = head.slice(0, canonicalAt)
    + `<link rel="canonical" href="${characterUrl(character.title)}" />`
    + head.slice(canonicalAt + HOME_CANONICAL.length);

  const page = `${headWithCanonical}${headFor(character)}\n${betweenHeadAndBody}\n${bodyFor(character)}\n    ${afterBody}`;

  // The filename is the literal (NFC) title; GitHub Pages percent-decodes the
  // request path before the filesystem lookup, so spaces and accents resolve.
  fs.writeFileSync(path.join(OUT_DIR, `${character.title.normalize('NFC')}.html`), page, 'utf-8');
});

const written = fs.readdirSync(OUT_DIR).filter(f => f.endsWith('.html')).length;
if (written !== characters.length) {
  throw new Error(`prerendered ${written} pages, expected ${characters.length}`);
}
console.log(`prerendered ${written} character pages into build/character/`);
