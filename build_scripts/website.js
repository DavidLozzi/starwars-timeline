import fs from 'fs';
import path from 'path';
import { sanitize, stripHtml, truncate, escapeAttr, escapeHtml } from './textUtils.js';
import { resolveSite } from './site.mjs';
import { formatYear } from '../shared/yearFormat.mjs';

const site = await resolveSite();

// Only the Star Wars pack writes into a hub repo; other packs (e.g. Marvel)
// have no hub and nothing to do here.
if (!site.config.hubExport.enabled) {
  console.log(`hubExport disabled for ${site.id}; nothing to do`);
  process.exit(0);
}

const data = JSON.parse(fs.readFileSync(path.join(site.generatedDir, 'characters.json'), 'utf8'));
const characterDescriptions = JSON.parse(fs.readFileSync(site.descriptionsPath, 'utf8'));

const convertYear = (year) => formatYear(year, site.config.years);

// YAML double-quoted scalars accept JSON string escaping, so JSON.stringify is a
// safe quoter for names/descriptions containing colons, quotes or apostrophes.
const yaml = (value) => JSON.stringify(String(value ?? ''));

// character.imageUrl already starts with a slash, so join without doubling it.
const imageSrc = (url) => `${site.config.origin}/${String(url || '').replace(/^\/+/, '')}`;

// Netlify 301s any URL containing an uppercase letter to its lowercase form, so
// mixed-case filenames made every character page a "Page with redirect" in
// Search Console. Keep slugs lowercase.
const slug = (title) => title.replace(/\s/ig, '-').toLowerCase();

// The hub sets `permalink: /character/:basename/` as a front-matter default, so
// the trailing-slash `/character/<slug>/` IS the canonical — the sitemap and the
// canonical tag both point at it, and the old `<slug>.html` URLs 301 there via
// netlify.toml. Linking the .html form would send every internal link through a
// redirect, which is what put ~79 pages in "Duplicate, Google chose different
// canonical" in Search Console. Always link the trailing-slash form.
const characterPageUrl = (title) => `/character/${slug(title)}/`;

const meta = (character, name) => character.metadata?.find(m => m.name.toLowerCase() === name.toLowerCase())?.value;

// A handful of characters carry the literal string "Unknown" as a metadata
// value (e.g. Yoda's homeworld, Maz Kanata's species) instead of omitting the
// key entirely. Treat that sentinel as absent so callers that already know
// how to skip a missing key (like the index card's `.filter(Boolean)`) skip
// this too, rather than printing the literal word "Unknown" as if it were
// real data.
const metaKnown = (character, name) => {
  const value = meta(character, name);
  return (typeof value === 'string' && value.trim().toLowerCase() === 'unknown') ? undefined : value;
};

// character.imageYears?.[0] in source order, else the default imageUrl. This is
// the single expression that decides which file gets copied into
// starwars-guide/assets/characters/ for a character, so the per-character loop
// and the index cards must both call this rather than recomputing it.
//
// It must stay order-dependent-but-stable: the profile body below renders
// imageYears sorted by startYear, and doing that sort in place used to mutate
// the array between the copy step and the index cards. Anakin Skywalker is the
// one character whose source order differs from startYear order, so the index
// card ended up pointing at an anakin.png that was never copied. The sort there
// now operates on a copy — do not reintroduce an in-place sort of imageYears.
const defaultImage = (character) => (character.imageYears?.[0]?.imageUrl ?? character.imageUrl).replace('/images/', '');

// character.seenIn is sorted in place by the per-character loop further down,
// so relying on that side effect here would silently break if these two
// sections are ever reordered or run independently. Sort a copy instead.
const seenInAscending = (character) => [...character.seenIn].sort((a, b) => a.year > b.year ? 1 : -1);

const uniqueAppearances = (character) => [...new Set(seenInAscending(character).flatMap(y => (y.events || []).map(e => e.title)))];

const firstSeenYear = (character) => seenInAscending(character)[0].year;

// Fallback for the handful of characters with no generated bio: build a factual
// sentence from metadata, lifespan and appearances rather than emitting a stub.
const fallbackDescription = (character, birthYear, appearances) => {
  const species = meta(character, 'Species');
  const homeworld = meta(character, 'Homeworld');
  const parts = [`${character.title} is a ${site.config.hubExport.siteLabel} character`];
  if (species) parts.push(`, a ${species}`);
  if (homeworld) parts.push(` from ${homeworld}`);
  if (!character.startYearUnknown) parts.push(`, born in ${convertYear(birthYear)}`);
  if (!character.endYearUnknown) parts.push(`, died in ${convertYear(character.endYear)}`);
  parts.push('.');
  if (appearances.length > 0) parts.push(` Appears in ${appearances.slice(0, 3).join(', ')}.`);
  return parts.join('');
};

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

const writePage = (filePath, frontMatterLines, body) => {
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

data
  .sort((a, b) => a.title > b.title ? 1 : -1)
  .forEach(character => {
    const characterUrl = `${site.config.origin}/character/${encodeURIComponent(character.title)}?year=`;
    let _birthYear = character.startYear;
    if (character.birthYear) {
      _birthYear = character.birthYear;
    }
    const seenInData = [];
    character.seenIn
      .sort((a, b) => a.year > b.year ? 1 : -1)?.forEach(y => y.events?.forEach(e => { seenInData.push({ text: `${e.title}, ${convertYear(e.startYear)} (${y.year - _birthYear} years old)`, year: y, event: e }); }));

    const characterImage = defaultImage(character);
    // Copy the character image to the output directory
    try {
      const sourceImagePath = path.join(site.publicDir, 'images', characterImage);
      const destImagePath = `${site.config.hubExport.repoPath}/assets/characters/${characterImage}`;
      fs.copyFileSync(sourceImagePath, destImagePath);
    } catch (error) {
      console.log(`Could not copy image for ${character.title}: ${error.message}`);
    }
    
    // Find matching character description from character_descriptions.json
    let characterDescription = character.description;
    let characterTimeline = '';
    let generatedSocialDesc = '';

    const wikiUrl = character[site.config.labels.wikiField];
    if (wikiUrl && characterDescriptions[wikiUrl]) {
      const descData = characterDescriptions[wikiUrl];
      characterDescription = descData.description;
      characterTimeline = descData.timeline;
      generatedSocialDesc = descData.socialDesc || '';
    }
    
    characterDescription = sanitize(characterDescription);
    // Timeline events are authored as h4; the page's own outline is h1 (layout
    // title) > h2 (layout section) > h3, so demoting them to h3 removes the
    // skipped heading level on the hub.
    characterTimeline = sanitize(characterTimeline).replace(/<(\/?)h4>/gi, '<$1h3>');

    const appearances = [...new Set(seenInData.map(s => s.event.title))];
    // Prefer the description Claude wrote *as* a meta description (description.js
    // emits socialDesc; `--social-only` backfills it). Truncating the bio only
    // restates the page's own first sentence, which Google discards — the chain
    // below is the fallback for entries that predate socialDesc or have no bio.
    const socialDesc = sanitize(generatedSocialDesc)
      || truncate(stripHtml(characterDescription))
      || truncate(fallbackDescription(character, _birthYear, appearances));

    const frontMatter = [
      `title: ${yaml(`${character.title}'s Timeline`)}`,
      'layout: character',
      'date: 2022-05-08',
      'last_modified_at: PLACEHOLDER',
      `social-title: ${yaml(`${character.title}${site.config.hubExport.socialTitleSuffix}`)}`,
      `social-desc: ${yaml(socialDesc)}`,
      `social-image: /assets/characters/${characterImage}`,
      `character:`,
      `  name: ${yaml(character.title)}`,
      ...(character.altTitle?.length > 0 ? [`  also_known_as: ${yaml(character.altTitle)}`] : []),
      ...(meta(character, 'Species') ? [`  species: ${yaml(meta(character, 'Species'))}`] : []),
      ...(meta(character, 'Homeworld') ? [`  homeworld: ${yaml(meta(character, 'Homeworld'))}`] : []),
      ...(character.startYearUnknown ? [] : [`  birth_year: ${yaml(convertYear(_birthYear))}`]),
      ...(character.endYearUnknown ? [] : [`  death_year: ${yaml(convertYear(character.endYear))}`]),
      ...(wikiUrl ? [`  ${site.config.hubExport.wikiFrontMatterKey}: ${wikiUrl}`] : []),
      ...(appearances.length > 0
        ? ['  appearances:', ...appearances.map(a => `    - ${yaml(a)}`)]
        : []),
    ];

    let body = `<a href="/character/" class="smaller">Back to All Characters</a>

<div class="character-profile container">
  <div class="col-10">
    <p>
    ${character.title} ${character.altTitle?.length > 0 ? `(${character.altTitle}) ` : ''}\
    ${(!character.startYearUnknown && !character.endYearUnknown) ? `was born in <a href="${characterUrl + character.startYear}" target="_blank">${convertYear(character.birthYear || character.startYear)}</a> and died in <a href="${characterUrl + character.endYear}" target="_blank">${convertYear(character.endYear)}</a>.` : ''}\
    ${(character.startYearUnknown && !character.endYearUnknown) ? `died in <a href="${characterUrl + character.endYear}" target="_blank">${convertYear(character.endYear)}</a>.` : ''}\
    ${(!character.startYearUnknown && character.endYearUnknown) ? `was born in <a href="${characterUrl + character.startYear}" target="_blank">${convertYear(character.birthYear || character.startYear)}</a>.` : ''}
    </p>

    <p>${characterDescription}</p>
    
    ${(character.metadata && character.metadata.length > 0) ?
      `<div class='metadata'>
      ${character.metadata.map(m => `<div>
      <label>${m.name}:</label>
      <span>${m.value}</span>
      </div>`).join('')}
      </div>`
      : ''
    }

    ${characterTimeline ? `<div class="timeline">${characterTimeline}</div>` : ''}
    
    <p>&nbsp;</p>
    <h3>View ${character.title} in our timeline:</h3>

    <ul>
    ${seenInData.map(seenIn => `  <li><a href="${characterUrl + seenIn.year.year}" target="_blank">${seenIn.text}</a></li>`).join('\n')}
    </ul>

    <p>&nbsp;</p>

    ${wikiUrl ? `<a href="${wikiUrl}" target="_blank">${site.config.hubExport.wikiLinkText}</a>` : ''}

    <p>&nbsp;</p>
    <a href="/character/" class="smaller">Back to All Characters</a>
  </div>
  <div class="character_image col-2">
    ${character.imageYears ? [...character.imageYears].sort((a, b) => a.startYear > b.startYear ? 1 : -1).map(img => `<img src="${imageSrc(img.imageUrl)}" alt="${character.title}" />`).join('\n') : ''}
    <img src="${imageSrc(character.imageUrl)}" alt="${character.title}" />
    <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${site.config.analytics.adsenseClient}"
        crossorigin="anonymous"></script>
    <!-- ${site.id} character -->
    <ins class="adsbygoogle"
        style="display:block; min-height: 280px; width: 100%;"
        data-ad-client="${site.config.analytics.adsenseClient}"
        data-ad-slot="${site.config.analytics.hubAdSlot}"
        data-ad-format="auto"
        data-full-width-responsive="true"></ins>
    <script>
        (adsbygoogle = window.adsbygoogle || []).push({});
    </script>
  </div>
</div>
`;

    const filePath = `${site.config.hubExport.repoPath}/character/${slug(character.title)}.md`;
    const unchanged = writePage(filePath, frontMatter, body);
    console.log(`${character.title}${unchanged ? ' (unchanged)' : ''}`);
  });

const listFrontMatter = [
  `title: ${site.config.hubExport.indexTitle}`,
  'layout: page',
  'date: 2022-05-08',
  'last_modified_at: PLACEHOLDER',
  `social-title: ${yaml(site.config.hubExport.indexSocialTitle)}`,
  `social-desc: ${yaml(site.config.hubExport.indexDescTemplate(data.length))}`,
  'social-image: /assets/social.png',
  'character_index: true',
];

// One <li class="character-index-card"> per character: a thumbnail + name
// linking to the character's own profile page, short metadata (species,
// homeworld, force-sensitivity, lifespan, appearances), and a second link that
// deep-links into the interactive timeline at the year the character first
// appears. The full description stays on the profile page — this is
// deliberately short, crawlable metadata, not a second copy of the bio.
const characterIndexCard = (character) => {
  const url = characterPageUrl(character.title);
  const image = defaultImage(character);
  const species = metaKnown(character, 'Species');
  const homeworld = metaKnown(character, 'Homeworld');
  const forceSensitive = meta(character, 'Force Sensitive') === 'Yes';
  const birthYear = character.birthYear || character.startYear;
  const appearances = uniqueAppearances(character);
  const timelineUrl = `${site.config.origin}/character/${encodeURIComponent(character.title)}?year=${firstSeenYear(character)}`;

  const traits = [species, homeworld, forceSensitive ? 'Force-sensitive' : null].filter(Boolean);

  let lifespan = '';
  if (!character.startYearUnknown && !character.endYearUnknown) {
    lifespan = `${convertYear(birthYear)} &ndash; ${convertYear(character.endYear)}`;
  } else if (!character.startYearUnknown && character.endYearUnknown) {
    lifespan = `Born ${convertYear(birthYear)}`;
  } else if (character.startYearUnknown && !character.endYearUnknown) {
    lifespan = `Died ${convertYear(character.endYear)}`;
  }
  // Both years unknown: lifespan stays '' and the line is omitted entirely —
  // no "Unknown" placeholder.

  const appearancesLabel = appearances.length === 1 ? 'title' : 'titles';
  const shownAppearances = appearances.slice(0, 3).map(escapeHtml).join(', ');
  const appearancesLine = `Appears in ${appearances.length} ${appearancesLabel}: ${shownAppearances}${appearances.length > 3 ? ' and more' : ''}`;

  // Built as an array and joined, rather than interpolated as multi-line
  // template-literal conditionals, so an omitted altTitle/lifespan line
  // leaves no whitespace-only text node behind.
  //
  // The text lines are wrapped in a single `.character-index-info` block
  // rather than each being its own CSS Grid item in column 2. A card with a
  // per-line grid item (all `grid-column: 2`, auto row) plus a thumb spanning
  // `grid-row: 1 / -1` measurably inflated row 1 (the name's row) to ~80px
  // against ~21px of actual text — the row-spanning image and the first
  // auto-placed row fight over row 1's sizing. Two flex children (thumb,
  // info) sidesteps that: the info column stacks its own lines with normal
  // block flow and nothing spans it.
  const infoLines = [
    `<a class="character-index-name" href="${url}">${escapeHtml(character.title)}</a>`,
    character.altTitle?.length > 0 ? `<span class="character-index-alt">a.k.a. ${escapeHtml(character.altTitle)}</span>` : null,
    `<span class="character-index-meta">${traits.map(escapeHtml).join(' &middot; ')}</span>`,
    lifespan ? `<span class="character-index-lifespan">${lifespan}</span>` : null,
    `<span class="character-index-appearances">${appearancesLine}</span>`,
    `<a class="character-index-timeline" href="${timelineUrl}" target="_blank" rel="noopener">${escapeHtml(character.title)} on the timeline &rarr;</a>`,
  ].filter(Boolean);

  const lines = [
    `<a class="character-index-thumb" href="${url}"><img src="/assets/characters/${escapeAttr(image)}" alt="${escapeAttr(character.title)}" width="72" height="72" loading="lazy" decoding="async"></a>`,
    `<div class="character-index-info">`,
    ...infoLines.map(l => `  ${l}`),
    `</div>`,
  ];

  return `<li class="character-index-card">\n    ${lines.join('\n    ')}\n  </li>`;
};
// Note on the 72x72 width/height attributes above: that's the CSS-rendered box
// size, not the intrinsic file size. Intrinsic dimensions vary per source image
// (mostly 250x250, some up to 852x692) and there's no image library available
// here to read them, while the stylesheet pins the displayed box to 72x72 —
// so 72x72 reserves the correct space up front and produces zero layout shift.

let listView = `
${site.config.hubExport.indexIntro(data.length)}

<ul class="character-index">
${data
    .sort((a, b) => a.title > b.title ? 1 : -1)
    .map(characterIndexCard).join('\n')}
</ul>
`;
const indexUnchanged = writePage(`${site.config.hubExport.repoPath}/character/index.md`, listFrontMatter, listView);
console.log(`index${indexUnchanged ? ' (unchanged)' : ''}`);