// Marvel site pack config — plain data, no styled-components, no JSX.
// Node (build_scripts/) imports this directly, so it must stay import-safe
// outside a bundler: .mjs extension, zero dependencies.
//
// This pack proves the content-agnostic-site-packs refactor (see the plan's
// WU-15): every field the app/build-scripts read from
// sites/starwars/site.config.mjs has a Marvel equivalent here. Hosting is
// deferred (plan Constraint 8) — `origin` is a placeholder domain and no CI
// job deploys this pack; it builds and runs locally via `SITE=marvel`.
//
// Marvel spans multiple in-universe continuities (MCU, the two Sony
// Spider-Man runs, Sony's Spider-Man Universe, Fox's X-Men/Fantastic Four,
// the Netflix Defenders block, and pre-MCU one-offs) that overlap in time,
// so every Marvel `movie`/`tv`/`era`/`character` entry in data.json may carry
// an optional top-level `universe` id referencing one of these. See
// CLAUDE.md's "Data pipeline" section for the full contract.

/** Field-guide bullet that is year-convention specific; kept apart from the
 * rest of FIELD_GUIDE so it lines up with the Star Wars pack's structure. */
const YEAR_CONVENTION =
  'Years are plain calendar years (Gregorian) — the real-world release year for movies/shows, and the in-story year we display for characters. There is no BBY/ABY split and no year-zero rule: a year is just a year, and it may be negative for a character born long before our data starts.';

/** Mirrors build_scripts/description.js's FIELD_GUIDE shape, Marvel-flavored. */
const FIELD_GUIDE = `Every entry in our data file is one row of the timeline. Fields vary from character to character; here is what each one means:

- title: the name we display. altTitle: a codename or alias (e.g. "Iron Man", "Star-Lord"). Optional.
- type: always "character" for these entries. Other rows in the same file are "movie", "tv" and "era".
- startYear: the year the character's column STARTS on the timeline. Usually the year they first appear, but not always — for characters whose real birth year predates our data, it is clamped to the start of the timeline (e.g. Tony Stark starts at 2008 while birthYear is 1970).
- birthYear: present only when it differs from startYear. When present, THIS is the real birth year and startYear is only a rendering position.
- startYearUnknown: true means the birth year is a guess we made to position the column, not a confirmed date. The app labels it "(this is a guess)".
- endYear: the year the column ENDS. Usually the death year. When endYearUnknown is true, the character did not die then — they are alive, their fate is unresolved as of our data, or we simply stopped drawing the column.
- endYearEvent: the movie or series during which the character died, when we know it.
- ${YEAR_CONVENTION}
- metadata: a list of {name, value} facts we display. Common names are Species, Affiliation, Powered — a character may have any subset. We do not track Homeworld.
- seenIn: the movies and series the character appears in, by our display titles. Not exhaustive continuity; it is what our timeline plots.
- description: a short hand-collected summary. Treat it as a starting point that may be stale or wrong, not as truth.
- imageUrl / imageYears: display assets only, ignore them.
- wiki / databank: reference URLs for this character.`;

/** Mirrors build_scripts/description.js's SOCIAL_RULES shape. */
const SOCIAL_RULES = `- Between 140 and 155 characters. Never more than 155 — Google truncates on pixel width, not character count, so anything longer risks being cut off in search results.
- Do NOT reuse the opening clause of the description. Search engines discard a meta description that only repeats copy already visible on the page, so this has to be independently written, not the first sentence trimmed down.
- Lead with the character's name, then what they are actually known for: role, team, and fate where continuity settles it. Prefer the concrete over the encyclopedic — "billionaire engineer who built the Iron Man armor and gave his life to stop Thanos" beats "was a human male who became a superhero".
- Summarize the character, not the page — never mention the page, the timeline or the site itself. Do not open the way a biography opens ("X was a human who..."); open with what makes them worth reading about.
- Plain text only: no HTML, no surrounding quotes, no ellipsis, no trailing "…". It must end on a complete sentence with a full stop.`;

const TIMELINE_EXAMPLE =
  'Use plain calendar years, no BBY/ABY-style suffix (e.g. "2008 - Builds the first Iron Man suit"). Prefix estimated years with ~ when a date is uncertain.';

const SOCIAL_TASK_INTRO = (name) =>
  `You are writing the meta description for a character page on the Marvel Timeline (https://timeline.marvel.guide), a continuity-focused interactive timeline.

The bio below is already the opening paragraph of ${name}'s page. Write the meta description for that page.`;

const SOCIAL_POST_SYSTEM_PROMPT = `You are a GPT tasked with creating tweets based on a Marvel Cinematic Universe timeline. You will be \
provided a tweet for one event or character, please review it and summarize it in a way that is engaging and informative. \
You can also add hashtags and emojis. Your tweet is the intro the the tweet sent to you. Do not ask the reader to do anything, \
just summarize the content. Keep it to 280 characters or less. \

Your tweet is a summary of the tweet(s) the user is giving you. The tweet provided to you will be added to your tweet later, do not \
include it, or a timeline in your tweet.
`;

const TASK_INTRO = `You are building reference content for the Marvel Timeline (https://timeline.marvel.guide), a continuity-focused interactive timeline.

For the character described below:

1. VERIFY THE DATES FIRST. Fetch the character's Marvel Database page (the wiki URL in the payload) — that article is the primary source and usually answers everything. Budget roughly three web fetches total: spend them on the wiki article first, and only search further when it leaves a date genuinely unresolved or you hit a conflict worth reporting. Determine the character's first appearance year and, if applicable, death year. Pay particular attention to the dates we claim to know: a date is "claimed known" when startYearUnknown / endYearUnknown is absent or false. Those are the ones our app presents as fact, so an error there is worse than an imprecise guess. Confirm each against a source; if a date genuinely cannot be pinned down, say so rather than inventing precision.

2. Write "description": a single-paragraph summary of who the character is, what they are known for, and their major milestones. HTML, wrapped in one <p> tag. No links, no citations, no headings.

3. Write "socialDesc": the meta description for this character's page — the line that appears under the title in Google results and on a shared social card.

${SOCIAL_RULES}

4. Write "timeline": a comprehensive, chronological list of that character's events. HTML, alternating <h3>Date - Title</h3> and <p>brief description</p>. ${TIMELINE_EXAMPLE} No links, no citations. The events must be consistent with the dates you verified in step 1.

5. Report "notes": anything the maintainer should act on. This is the most valuable part of your output, so be specific and be willing to disagree with our data. Include:
   - dates in our payload that contradict what you found (say what we have, what it should be, and why),
   - anything else factually wrong or out of date in our entry — species, affiliation, the old description, a "seenIn" appearance that is not real, a death recorded for a character who survives,
   - things worth adding that we clearly do not track yet,
   - genuine continuity ambiguity we should know about (comics vs film, retcons, a date that only exists in a tie-in reference).
   If a field checks out fine, do not write a note about it. An empty notes list is a valid answer for a well-maintained entry.`;

export default {
  id: 'marvel',
  siteName: 'Marvel Timeline',
  origin: 'https://timeline.marvel.guide',
  lang: 'en',
  homeDescription: 'A multiverse Marvel timeline of films, shows, and heroes across the MCU, Sony\'s Spider-Man continuities, Fox\'s X-Men and Fantastic Four, the Netflix Defenders saga, and pre-MCU one-offs.',
  tagline: 'Avengers Assemble.',
  loadingNote: 'Please wait while the timeline loads.',
  welcomeTitle: 'Welcome to the Marvel Timeline',
  characterTitleSuffix: ' - Marvel Timeline',
  characterDescFallback: (name) => `Learn more about ${name} on the Marvel Timeline!`,

  years: {
    negativeSuffix: '',
    positiveSuffix: '',
    zeroIsNegative: false,
    absolute: false,
    unknownLabel: 'unknown',
  },

  labels: {
    wikiName: 'Marvel Database',
    wikiField: 'wiki',
    wikiLinkText: 'Learn more on Marvel Database',
    wikiLinkSuffix: 'on Marvel Database',
    seenInLabel: 'Seen in Movie or Show:',
    seenInPlaceholder: 'Filter by Movie/Show',
    hideDeceasedLabel: 'Hide Deceased',
    deathIcon: '☠️',
    allCharactersText: 'All Marvel characters',
    charactersBreadcrumb: 'Characters',
  },

  images: {
    default: '/images/marvel-default.png',
    social: '/social.png',
    socialOverrides: {},
  },

  // Placeholder handles — this pack is a local build-only skeleton (no CI
  // deploy, see plan Constraint 8), not a real published account.
  social: {
    twitterSite: '@MarvelTimelineApp',
    twitterCreator: '@MarvelTimelineApp',
  },

  // Every field here is optional; when absent the corresponding
  // component/snippet is not emitted. Omitted entirely for the Marvel
  // skeleton to exercise that code path.
  analytics: {},

  // Each entry is optional; an unset URL means the menu item/link is
  // omitted. Marvel has no hub site to link back to.
  menu: {},

  onboarding: {
    filterHelp:
      'Use the search options at the top right to find what you\'re looking for! Filter by hero, movie or show, affiliation, and more!',
  },

  seoPages: {
    movies: {
      file: 'marvel_movies',
      title: 'Marvel Movies Timeline',
      heading: 'Marvel Movies Timeline',
      intro: 'A multiverse timeline of Marvel films, spanning the MCU and beyond.',
    },
    tv: {
      file: 'marvel_tvshows',
      title: 'Marvel TV Show Timeline',
      heading: 'Marvel TV Shows Timeline',
      intro: 'Click on any of the Marvel shows below to see it in the timeline!',
    },
    characters: {
      file: 'marvel_characters',
      title: 'Marvel Characters Timeline',
      heading: 'Marvel Characters Timeline',
      intro: 'Click on any of the Marvel characters below to see it in the timeline!',
    },
  },

  storagePrefix: 'marvel_timeline',
  // homeworldField is left unset: Marvel characters don't have a homeworld,
  // and mapping this slot to Affiliation produced a schema.org-valid but
  // semantically wrong homeLocation (an affiliation is not a Place).
  // prerenderCharacters.js omits the homeLocation key entirely when unset.
  metadataJsonLd: { speciesField: 'Species', homeworldField: null },
  features: { hyperspace: false },
  themes: { defaultId: 'mcu' },

  // Display metadata for the optional per-entry `universe` id (see
  // CLAUDE.md's "Data pipeline" section and data.json's `universe` field).
  // Nothing reads this array yet — it exists for a future universe picker,
  // the same precedent as the `character:` front-matter block website.js
  // emits for future hub use. Star Wars has no `universes` key at all.
  universes: [
    { id: 'mcu', label: 'Marvel Cinematic Universe', shortLabel: 'MCU', order: 1 },
    { id: 'raimi', label: 'Raimi Spider-Man Trilogy', shortLabel: 'Raimi', order: 2 },
    { id: 'amazing', label: 'The Amazing Spider-Man', shortLabel: 'Amazing', order: 3 },
    { id: 'ssu', label: 'Sony\'s Spider-Man Universe', shortLabel: 'SSU', order: 4 },
    { id: 'fox-xmen', label: 'Fox X-Men', shortLabel: 'Fox X-Men', order: 5 },
    { id: 'fox-ff', label: 'Fox Fantastic Four', shortLabel: 'Fox FF', order: 6 },
    { id: 'defenders', label: 'Netflix Defenders Saga', shortLabel: 'Defenders', order: 7 },
    { id: 'pre-mcu', label: 'Pre-MCU Marvel Films', shortLabel: 'Pre-MCU', order: 8 },
    { id: 'shared', label: 'All Universes', shortLabel: 'Shared', order: 9 },
  ],

  // Prose for build_scripts/description.js (research + social-only passes).
  // Never actually run for this pack (it bills the Anthropic API) — kept
  // complete so `--dry-run` and the code path stay exercised/valid.
  contentGen: {
    wikiName: 'Marvel Database',
    wikiDomain: 'marvel.fandom.com',
    wikiUrlField: 'wiki',
    researcherPersona: 'You are a Marvel Cinematic Universe researcher. Verify claims against sources before stating them.',
    socialWriterPersona: 'You write concise, accurate metadata for reference pages.',
    fieldGuide: FIELD_GUIDE,
    yearConvention: YEAR_CONVENTION,
    timelineExample: TIMELINE_EXAMPLE,
    socialRules: SOCIAL_RULES,
    taskIntro: TASK_INTRO,
    socialTaskIntro: SOCIAL_TASK_INTRO,
  },

  // build_scripts/social.js (one-off tweet-copy generator) prose, icons and
  // hashtag. Never actually run for this pack (it bills OpenAI).
  socialPost: {
    systemPrompt: SOCIAL_POST_SYSTEM_PROMPT,
    hashtag: '#Marvel',
    icons: { movie: '🎬', tv: '📺', birth: '🎉', death: '⚰️' },
    typeLabels: { movie: 'movie', tv: 'TV show' },
    eraBegin: (title, display) => `📆  ${title} has begun, in the year of ${display}`,
    eraDuring: (title, display) => `📆  During ${title}, in the year of ${display}`,
    eraEnd: (title) => `🎉  On to the next phase after ${title}!`,
  },

  // build_scripts/getWords.js excludes short tokens matching these from the
  // SWordle-style word list.
  excludedWords: ['Marvel'],

  // No Marvel hub site exists — website.js exits immediately when this is
  // false (see build_scripts/website.js's first statement after imports).
  hubExport: { enabled: false },
};
