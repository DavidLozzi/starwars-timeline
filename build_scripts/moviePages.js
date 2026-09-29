// Writes one hub page per movie into ../../starwars-guide/movie/: how old every
// character in that movie is, then where everyone else on the timeline stands
// that year (alive, already dead, not yet born). Run after prepJson.js, beside
// website.js — same sibling-checkout layout, same CI step.
import fs from 'fs';
import { escapeAttr, escapeHtml } from './textUtils.js';
import { HUB, convertYear, yaml, characterPageUrl, writePage } from './hubUtils.js';

// data.json, not characters.json: the portrait-per-era `imageYears` and the
// `endYearEvent` death marker are dropped by prepJson.
const data = JSON.parse(fs.readFileSync('./data.json', 'utf8'));
const characters = data.filter(e => e.type === 'character');
const movies = data
  .filter(e => e.type === 'movie')
  .sort((a, b) => a.startYear - b.startYear || data.indexOf(a) - data.indexOf(b));

// Punctuation stripped, lowercase: "Episode IV: A New Hope" -> episode-iv-a-new-hope.
const movieSlug = (title) => title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const moviePageUrl = (title) => `/movie/${movieSlug(title)}/`;

// Same selection rules as the app (src/organisms/CharacterFocusPanel/text.js
// getCharacterImageForYear): an imageYears entry covering the year, else the
// latest one if the year is past it, else the default portrait.
const imageForYear = (character, year) => {
  const imageYears = character.imageYears || [];
  const covering = imageYears.find(y => y.startYear <= year && y.endYear >= year);
  if (covering) return covering.imageUrl;
  const latest = [...imageYears].sort((a, b) => b.endYear - a.endYear)[0];
  if (latest && latest.endYear <= year) return latest.imageUrl;
  return character.imageUrl;
};

// Portraits are served from the hub, like the character pages' social images.
// Only copy what's missing: the hub recompresses some of these by hand, and
// overwriting them with the originals would undo that.
const hubImage = (url) => {
  const file = url.replace('/images/', '');
  const dest = `${HUB}/assets/characters/${file}`;
  if (!fs.existsSync(dest)) {
    try {
      fs.copyFileSync(`../public/images/${file}`, dest);
    } catch (error) {
      console.log(`Could not copy image ${file}: ${error.message}`);
    }
  }
  return `/assets/characters/${file}`;
};

const birthOf = (c) => c.birthYear ?? c.startYear;
const number = (n) => n.toLocaleString('en-US');

// Where a character stands in `year`. startYearUnknown means the birth year is
// our guess; endYearUnknown means endYear is where we stopped drawing the
// column, not a death.
const statusAt = (c, movie) => {
  const year = movie.startYear;
  const born = birthOf(c);
  const estimated = !!c.startYearUnknown;
  const ageAt = (y) => `${estimated ? '~' : ''}${number(y - born)}`;

  // sortAge orders the "Age" sort: age at death for the dead, negative years
  // until birth for the unborn, so each group still reads oldest first.
  if (born > year) {
    return { group: 'unborn', age: null, sortAge: year - born, note: `Not born yet — born ${estimated ? 'around ' : ''}${convertYear(born)}` };
  }
  if (!c.endYearUnknown && c.endYear < year) {
    return { group: 'dead', age: null, sortAge: c.endYear - born, note: `Died ${convertYear(c.endYear)}, age ${ageAt(c.endYear)}` };
  }
  if (!c.endYearUnknown && c.endYear === year && c.endYearEvent === movie.title) {
    return { group: 'alive', age: ageAt(year), sortAge: year - born, note: 'Dies in this movie' };
  }
  if (c.endYearUnknown && c.endYear < year) {
    return { group: 'unknown', age: ageAt(year), sortAge: year - born, note: `Fate unknown after ${convertYear(c.endYear)}` };
  }
  return { group: 'alive', age: ageAt(year), sortAge: year - born, note: estimated ? 'Birth year estimated' : '' };
};

const byName = (a, b) => a.title.localeCompare(b.title);

const card = (c, movie, status, inMovie) => {
  // A character "in" a movie after their death is there as a Force spirit
  // (Luke in The Rise of Skywalker).
  const note = inMovie && status.group === 'dead' ? `${status.note} — appears after death` : status.note;
  const age = status.age !== null ? `Age ${status.age}` : status.group === 'unborn' ? 'Not born yet' : 'Dead';
  const name = escapeHtml(c.title);
  const timelineUrl = `https://timeline.starwars.guide/character/${encodeURIComponent(c.title)}?year=${movie.startYear}`;
  return `<li class="character-index-card movie-age-card is-${status.group}" data-name="${escapeAttr(c.title)}" data-age="${status.sortAge}">
  <a class="character-index-thumb" href="${characterPageUrl(c.title)}"><img src="${hubImage(imageForYear(c, movie.startYear))}" alt="${escapeAttr(c.title)}" loading="lazy" /></a>
  <div class="character-index-info">
    <a class="character-index-name" href="${characterPageUrl(c.title)}">${name}</a>
    <span class="movie-age">${age}</span>
    ${note ? `<span class="character-index-lifespan">${escapeHtml(note)}</span>` : ''}
    <a class="character-index-timeline" href="${timelineUrl}" target="_blank">${name} in ${convertYear(movie.startYear)} &rarr;</a>
  </div>
</li>`;
};

const cardList = (list, movie, inMovie) => `<ul class="character-index">
${list.map(({ c, status }) => card(c, movie, status, inMovie)).join('\n')}
</ul>`;

const OTHER_GROUPS = [
  ['alive', 'Alive at the time'],
  ['unknown', 'Fate unknown'],
  ['dead', 'Already dead'],
  ['unborn', 'Not born yet'],
];

// Raw-HTML headings get no kramdown auto-id, so the TOC anchors are set here.
const sectionId = (group) => `section-${group}`;

// Lists are written sorted by name; the Age button re-sorts every list on the
// page in place, oldest first, and Name puts them back.
const SORT_SCRIPT = `<script>
(function () {
  var buttons = document.querySelectorAll('.movie-sort button');
  var sorters = {
    name: function (a, b) { return a.dataset.name.localeCompare(b.dataset.name); },
    age: function (a, b) { return b.dataset.age - a.dataset.age || a.dataset.name.localeCompare(b.dataset.name); }
  };
  buttons.forEach(function (button) {
    button.addEventListener('click', function () {
      var sorter = sorters[button.dataset.sort];
      document.querySelectorAll('ul.character-index').forEach(function (list) {
        Array.prototype.slice.call(list.children).sort(sorter).forEach(function (li) { list.appendChild(li); });
      });
      buttons.forEach(function (b) { b.setAttribute('aria-pressed', String(b === button)); });
    });
  });
})();
</script>`;

fs.mkdirSync(`${HUB}/movie`, { recursive: true });

const pages = movies
  .map(movie => ({ movie, cast: characters.filter(c => c.seenIn?.includes(movie.title)) }))
  // A movie nobody on the timeline appears in yet (e.g. an unreleased one)
  // would be a page of nothing but "everyone else".
  .filter(({ cast }) => cast.length > 0);

pages.forEach(({ movie, cast }, i) => {
  const year = convertYear(movie.startYear);
  const castList = cast.sort(byName).map(c => ({ c, status: statusAt(c, movie) }));
  const others = characters
    .filter(c => !cast.includes(c))
    .sort(byName)
    .map(c => ({ c, status: statusAt(c, movie) }));

  const otherSections = OTHER_GROUPS
    .map(([group, heading]) => ({ group, heading, list: others.filter(o => o.status.group === group) }))
    .filter(({ list }) => list.length > 0);

  const tocLinks = [
    `<a href="#section-cast">In the movie (${castList.length})</a>`,
    ...otherSections.map(({ group, heading, list }) => `<a href="#${sectionId(group)}">${heading} (${list.length})</a>`),
  ];
  // "a, b and c"
  const toc = tocLinks.length > 1
    ? `${tocLinks.slice(0, -1).join(', ')} and ${tocLinks[tocLinks.length - 1]}`
    : tocLinks[0];

  const prev = pages[i - 1]?.movie;
  const next = pages[i + 1]?.movie;

  const frontMatter = [
    `title: ${yaml(`How Old Is Everyone in ${movie.title}?`)}`,
    'layout: page',
    `permalink: ${moviePageUrl(movie.title)}`,
    'date: 2026-09-28',
    'last_modified_at: PLACEHOLDER',
    `social-title: ${yaml(`${movie.title} — Character Ages in ${year}`)}`,
    `social-desc: ${yaml(`${movie.title} is set in ${year}. See how old all ${cast.length} characters are, plus who else is alive, already dead, or not yet born.`)}`,
    'social-image: /assets/social.png',
  ];

  const body = `
<p>${escapeHtml(movie.title)} takes place in <a href="https://timeline.starwars.guide/?year=${movie.startYear}" target="_blank">${year}</a> on the <a href="https://timeline.starwars.guide" target="_blank">Ultimate Star Wars Timeline</a>. Here is how old everyone in it is, followed by every other character on the timeline in that year.</p>

<div class="movie-toolbar">
<a href="/movie/" class="smaller">Back to All Movies</a>
<div class="movie-sort" role="group" aria-label="Sort characters">
  <span>Sort by</span>
  <button type="button" data-sort="name" aria-pressed="true">Name</button>
  <button type="button" data-sort="age" aria-pressed="false">Age</button>
</div>
</div>

<h2 id="section-cast">Characters in ${escapeHtml(movie.title)}</h2>

<p class="movie-toc smaller">Characters ${toc}</p>

${cardList(castList, movie, true)}

<h2>Everyone else in ${year}</h2>

${otherSections
    .map(({ group, heading, list }) => `<h3 id="${sectionId(group)}">${heading}</h3>\n\n${cardList(list, movie, false)}`)
    .join('\n\n')}

<p class="movie-nav">
${prev ? `<a href="${moviePageUrl(prev.title)}">&larr; ${escapeHtml(prev.title)}</a>` : ''}
${next ? `<a href="${moviePageUrl(next.title)}">${escapeHtml(next.title)} &rarr;</a>` : ''}
</p>

${SORT_SCRIPT}
`;

  const unchanged = writePage(`${HUB}/movie/${movieSlug(movie.title)}.md`, frontMatter, body);
  console.log(`${movie.title}${unchanged ? ' (unchanged)' : ''}`);
});

const indexFrontMatter = [
  'title: How Old Is Everyone in Each Star Wars Movie?',
  'layout: page',
  'permalink: /movie/',
  'date: 2026-09-28',
  'last_modified_at: PLACEHOLDER',
  `social-title: ${yaml('Star Wars Character Ages by Movie')}`,
  `social-desc: ${yaml(`Pick a Star Wars movie to see how old every character in it is, and who else was alive, already dead, or not yet born that year.`)}`,
  'social-image: /assets/social.png',
];

const indexBody = `
Pick a movie to see how old everyone in it is, in timeline order. Ages come from the <a href="https://timeline.starwars.guide" target="_blank">Ultimate Star Wars Timeline</a>; see also <a href="/character/">every character's timeline</a>.

<ul>
${pages.map(({ movie, cast }) => `<li><a href="${moviePageUrl(movie.title)}">${escapeHtml(movie.title)}</a> — ${convertYear(movie.startYear)}, ${cast.length} characters</li>`).join('\n')}
</ul>
`;

const indexUnchanged = writePage(`${HUB}/movie/index.md`, indexFrontMatter, indexBody);
console.log(`index${indexUnchanged ? ' (unchanged)' : ''}`);
