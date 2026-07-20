import fs from 'fs';

const data = JSON.parse(fs.readFileSync('../src/data/characters.json', 'utf8'));
const characterDescriptions = JSON.parse(fs.readFileSync('./character_descriptions.json', 'utf8'));

const convertYear = (year) => {
  if (year <= 0) return `${year * -1} BBY`;
  if (year > 0) return `${year} ABY`;
  return 'none';
};

// YAML double-quoted scalars accept JSON string escaping, so JSON.stringify is a
// safe quoter for names/descriptions containing colons, quotes or apostrophes.
const yaml = (value) => JSON.stringify(String(value ?? ''));

// A few source descriptions carry stray control characters where an apostrophe
// belongs (e.g. "Fett\u0002s"), which leak into meta tags and page copy.
const sanitize = (text) => (text || '')
  .replace(/([A-Za-z])[\u0000-\u001f]([A-Za-z])/g, '$1’$2')
  .replace(/[\u0000-\u001f]/g, ' ');

const stripHtml = (html) => sanitize(html)
  .replace(/<[^>]+>/g, ' ')
  .replace(/&nbsp;/g, ' ')
  .replace(/&amp;/g, '&')
  .replace(/&#39;|&rsquo;/g, '’')
  .replace(/&quot;/g, '"')
  .replace(/\s+/g, ' ')
  .trim();

// Search snippets and OG cards get cut around 160 characters; prefer ending on a
// sentence, fall back to a word boundary with an ellipsis.
const MAX_DESC = 160;
const truncate = (text) => {
  if (text.length <= MAX_DESC) return text;
  const window = text.slice(0, MAX_DESC + 1);
  const sentenceEnd = Math.max(window.lastIndexOf('. '), window.lastIndexOf('! '), window.lastIndexOf('? '));
  if (sentenceEnd >= 80) return window.slice(0, sentenceEnd + 1);
  const wordEnd = window.lastIndexOf(' ');
  return `${window.slice(0, wordEnd > 0 ? wordEnd : MAX_DESC).replace(/[,;:.—-]+$/, '')}…`;
};

// character.imageUrl already starts with a slash, so join without doubling it.
const imageSrc = (url) => `https://timeline.starwars.guide/${String(url || '').replace(/^\/+/, '')}`;

const meta = (character, name) => character.metadata?.find(m => m.name.toLowerCase() === name.toLowerCase())?.value;

// Fallback for the handful of characters with no generated bio: build a factual
// sentence from metadata, lifespan and appearances rather than emitting a stub.
const fallbackDescription = (character, birthYear, appearances) => {
  const species = meta(character, 'Species');
  const homeworld = meta(character, 'Homeworld');
  const parts = [`${character.title} is a Star Wars character`];
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
    const characterUrl = `https://timeline.starwars.guide/character/${encodeURIComponent(character.title)}?year=`;
    let _birthYear = character.startYear;
    if (character.birthYear) {
      _birthYear = character.birthYear;
    }
    const seenInData = [];
    character.seenIn
      .sort((a, b) => a.year > b.year ? 1 : -1)?.forEach(y => y.events?.forEach(e => { seenInData.push({ text: `${e.title}, ${convertYear(e.startYear)} (${y.year - _birthYear} years old)`, year: y, event: e }); }));

    let characterImage = character.imageYears && character.imageYears.length > 0 ? character.imageYears[0].imageUrl : character.imageUrl;
    characterImage = characterImage.replace('/images/', '');
    // Copy the character image to the output directory
    try {
      const sourceImagePath = `../public/images/${characterImage}`;
      const destImagePath = `../../starwars-guide/assets/characters/${characterImage}`;
      fs.copyFileSync(sourceImagePath, destImagePath);
    } catch (error) {
      console.log(`Could not copy image for ${character.title}: ${error.message}`);
    }
    
    // Find matching character description from character_descriptions.json
    let characterDescription = character.description;
    let characterTimeline = '';
    
    if (character.wookiepedia && characterDescriptions[character.wookiepedia]) {
      const descData = characterDescriptions[character.wookiepedia];
      characterDescription = descData.description;
      characterTimeline = descData.timeline;
    }
    
    characterDescription = sanitize(characterDescription);
    // Timeline events are authored as h4; the page's own outline is h1 (layout
    // title) > h2 (layout section) > h3, so demoting them to h3 removes the
    // skipped heading level on the hub.
    characterTimeline = sanitize(characterTimeline).replace(/<(\/?)h4>/gi, '<$1h3>');

    const appearances = [...new Set(seenInData.map(s => s.event.title))];
    const socialDesc = truncate(stripHtml(characterDescription))
      || truncate(fallbackDescription(character, _birthYear, appearances));

    const frontMatter = [
      `title: ${yaml(`${character.title}'s Timeline`)}`,
      'layout: character',
      'date: 2022-05-08',
      'last_modified_at: PLACEHOLDER',
      `social-title: ${yaml(`${character.title} — Star Wars Timeline & Story`)}`,
      `social-desc: ${yaml(socialDesc)}`,
      `social-image: /assets/characters/${characterImage}`,
      `character:`,
      `  name: ${yaml(character.title)}`,
      ...(character.altTitle?.length > 0 ? [`  also_known_as: ${yaml(character.altTitle)}`] : []),
      ...(meta(character, 'Species') ? [`  species: ${yaml(meta(character, 'Species'))}`] : []),
      ...(meta(character, 'Homeworld') ? [`  homeworld: ${yaml(meta(character, 'Homeworld'))}`] : []),
      ...(character.startYearUnknown ? [] : [`  birth_year: ${yaml(convertYear(_birthYear))}`]),
      ...(character.endYearUnknown ? [] : [`  death_year: ${yaml(convertYear(character.endYear))}`]),
      ...(character.wookiepedia ? [`  wookieepedia: ${character.wookiepedia}`] : []),
      ...(appearances.length > 0
        ? ['  appearances:', ...appearances.map(a => `    - ${yaml(a)}`)]
        : []),
    ];

    let body = `<a href="/character" class="smaller">Back to All Characters</a>

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

    ${character.wookiepedia ? `<a href="${character.wookiepedia}" target="_blank">Learn more on Wookiepedia.com</a>` : ''}

    <p>&nbsp;</p>
    <a href="/character" class="smaller">Back to All Characters</a>
  </div>
  <div class="character_image col-2">
    ${character.imageYears ? character.imageYears.sort((a, b) => a.startYear > b.startYear ? 1 : -1).map(img => `<img src="${imageSrc(img.imageUrl)}" alt="${character.title}" />`).join('\n') : ''}
    <img src="${imageSrc(character.imageUrl)}" alt="${character.title}" />
    <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6056590143595280"
        crossorigin="anonymous"></script>
    <!-- starwars character -->
    <ins class="adsbygoogle"
        style="display:block; min-height: 280px; width: 100%;"
        data-ad-client="ca-pub-6056590143595280"
        data-ad-slot="1622037034"
        data-ad-format="auto"
        data-full-width-responsive="true"></ins>
    <script>
        (adsbygoogle = window.adsbygoogle || []).push({});
    </script>
  </div>
</div>
`;
      
    const filePath = `../../starwars-guide/character/${character.title.replace(/\s/ig, '-')}.md`;
    const unchanged = writePage(filePath, frontMatter, body);
    console.log(`${character.title}${unchanged ? ' (unchanged)' : ''}`);
  });

const listFrontMatter = [
  'title: Star Wars Characters on the Timeline',
  'layout: page',
  'date: 2022-05-08',
  'last_modified_at: PLACEHOLDER',
  `social-title: ${yaml('All Star Wars Character Timelines')}`,
  `social-desc: ${yaml(`Browse timelines for ${data.length} Star Wars characters — birth and death years, species, homeworlds, and every movie and series they appear in.`)}`,
  'social-image: /assets/social.png',
];

let listView = `
Explore all of the characters from the <a href="https://timeline.starwars.guide" target="_blank">Ultimate Star Wars Timeline</a>.

<ul class="character_list">
${data
    .sort((a, b) => a.title > b.title ? 1 : -1)
    .map(character => `<li><a href="/character/${character.title.replace(/\s/ig, '-')}">${character.title}</a></li>`).join('\n')}
</ul>
`;
const indexUnchanged = writePage('../../starwars-guide/character/index.md', listFrontMatter, listView);
console.log(`index${indexUnchanged ? ' (unchanged)' : ''}`);