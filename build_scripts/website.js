import fs from 'fs';
import { sanitize, stripHtml, truncate } from './textUtils.js';
import { convertYear, yaml, imageSrc, characterPageUrl, meta, slug, writePage } from './hubUtils.js';

const data = JSON.parse(fs.readFileSync('../src/data/characters.json', 'utf8'));
const characterDescriptions = JSON.parse(fs.readFileSync('./character_descriptions.json', 'utf8'));

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
    let generatedSocialDesc = '';

    if (character.wookiepedia && characterDescriptions[character.wookiepedia]) {
      const descData = characterDescriptions[character.wookiepedia];
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

    ${character.wookiepedia ? `<a href="${character.wookiepedia}" target="_blank">Learn more on Wookiepedia.com</a>` : ''}

    <p>&nbsp;</p>
    <a href="/character/" class="smaller">Back to All Characters</a>
  </div>
  <div class="character_image col-2">
    ${character.imageYears ? character.imageYears.sort((a, b) => a.startYear > b.startYear ? 1 : -1).map(img => `<img src="${imageSrc(img.imageUrl)}" alt="${character.title}" />`).join('\n') : ''}
    <img src="${imageSrc(character.imageUrl)}" alt="${character.title}" />
    <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6056590143595280"
        crossorigin="anonymous"></script>
    <!-- starwars character fluid -->
    <ins class="adsbygoogle"
        style="display:block"
        data-ad-format="fluid"
        data-ad-layout-key="-fb+5w+4e-db+86"
        data-ad-client="ca-pub-6056590143595280"
        data-ad-slot="2635465216"></ins>
    <script>
        (adsbygoogle = window.adsbygoogle || []).push({});
    </script>
  </div>
</div>
`;
      
    const filePath = `../../starwars-guide/character/${slug(character.title)}.md`;
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
Explore all of the characters from the <a href="https://timeline.starwars.guide" target="_blank">Ultimate Star Wars Timeline</a>, or see <a href="/movie/">how old everyone is in each movie</a>.

${(() => {
  const sorted = data.sort((a, b) => a.title > b.title ? 1 : -1);
  const size = Math.ceil(sorted.length / 3);
  const thirds = [0, 1, 2].map(i => sorted.slice(i * size, (i + 1) * size));
  return thirds
    .map(third => `<ul class="character_list">
${third.map(character => `<li><a href="${characterPageUrl(character.title)}">${character.title}</a></li>`).join('\n')}
</ul>`)
    .join('\n\n{% include sw/ad-fluid.html %}\n\n');
})()}
`;
const indexUnchanged = writePage('../../starwars-guide/character/index.md', listFrontMatter, listView);
console.log(`index${indexUnchanged ? ' (unchanged)' : ''}`);