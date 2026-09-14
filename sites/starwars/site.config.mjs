// Star Wars site pack config — plain data, no styled-components, no JSX.
// Node (build_scripts/) imports this directly, so it must stay import-safe
// outside a bundler: .mjs extension, zero dependencies.
//
// Every value below is copied verbatim from the literal already present in
// the code (see content-agnostic-site-packs plan, WU-3). Where a value is
// consumed as a template with a runtime-computed piece (e.g. a live
// character count), the field is a small function instead of a string, the
// same pattern the plan itself specifies for `characterDescFallback`.

/** Field-guide bullet that is Star Wars year-convention specific; kept apart
 * from the rest of FIELD_GUIDE so a future pack can swap it out. */
const YEAR_CONVENTION =
  'Years use the timeline convention: NEGATIVE is BBY, POSITIVE is ABY. -36 means 36 BBY. There is no year zero in our data.';

/** Verbatim from build_scripts/description.js FIELD_GUIDE (lines 63-77). */
const FIELD_GUIDE = `Every entry in our data file is one row of the timeline. Fields vary from character to character; here is what each one means:

- title: the name we display. altTitle: a nickname or second identity (e.g. "Snips", "Darth Tyranus"). Optional.
- type: always "character" for these entries. Other rows in the same file are "movie", "tv" and "era".
- startYear: the year the character's column STARTS on the timeline. Usually the birth year, but not always — for very long-lived characters it is clamped to the start of the timeline (e.g. Yoda starts at -300 while birthYear is -896).
- birthYear: present only when it differs from startYear. When present, THIS is the real birth year and startYear is only a rendering position.
- startYearUnknown: true means the birth year is a guess we made to position the column, not a canon date. The app labels it "(this is a guess)".
- endYear: the year the column ENDS. Usually the death year. When endYearUnknown is true, the character did not die then — they are alive, their fate is unknown, or we simply stopped drawing the column.
- endYearEvent: the movie or series during which the character died, when we know it.
- ${YEAR_CONVENTION}
- metadata: a list of {name, value} facts we display. Common names are Homeworld, Species, Force Sensitive, Creator, Clone — a character may have any subset.
- seenIn: the movies and series the character appears in, by our display titles. Not exhaustive canon; it is what our timeline plots.
- description: an older, hand-collected summary (often lifted from Wookieepedia). Treat it as a starting point that may be stale or wrong, not as truth.
- imageUrl / imageYears: display assets only, ignore them.
- wookiepedia / databank: reference URLs for this character.`;

/** Verbatim from build_scripts/description.js SOCIAL_RULES (lines 82-86). */
const SOCIAL_RULES = `- Between 140 and 155 characters. Never more than 155 — Google truncates on pixel width, not character count, so anything longer risks being cut off in search results.
- Do NOT reuse the opening clause of the description. Search engines discard a meta description that only repeats copy already visible on the page, so this has to be independently written, not the first sentence trimmed down.
- Lead with the character's name, then what they are actually known for: role, era, allegiance, and fate where canon settles it. Prefer the concrete over the encyclopedic — "clone captain who led the 501st Legion and outlived the Empire he was built to serve" beats "was a human male clone trooper of the Grand Army of the Republic".
- Summarize the character, not the page — never mention the page, the timeline or the site itself. Do not open the way a biography opens ("X was a human male..."); open with what makes them worth reading about.
- Plain text only: no HTML, no surrounding quotes, no ellipsis, no trailing "…". It must end on a complete sentence with a full stop.`;

/** Timeline-formatting instruction from TASK item 4 (description.js), kept
 * apart because it is Star Wars year-convention specific. */
const TIMELINE_EXAMPLE =
  'Prefix estimated years with ~ (e.g. "~36 BBY - Birth on Shili"). Use BBY/ABY, never negative numbers.';

/** Verbatim from build_scripts/description.js's --social-only prompt preamble
 * (line 607-610). Extracted as a function of the character name because the
 * running script builds it per-entry, not once (added by WU-8). */
const SOCIAL_TASK_INTRO = (name) =>
  `You are writing the meta description for a character page on The Ultimate Star Wars Timeline (https://timeline.starwars.guide), a canon-focused interactive timeline.

The bio below is already the opening paragraph of ${name}'s page. Write the meta description for that page.`;

/** Verbatim from build_scripts/social.js's GPT system prompt (lines 19-26).
 * Moved here so social.js can stay pack-agnostic (added by WU-10). */
const SOCIAL_POST_SYSTEM_PROMPT = `You are a GPT tasked with creating tweets based on a Star Wars timeline. You will be \
provided a tweet for one event or character, please review it and summarize it in a way that is engaging and informative. \
You can also add hashtags and emojis. Your tweet is the intro the the tweet sent to you. Do not ask the reader to do anything, \
just summarize the content. Keep it to 280 characters or less. \

Your tweet is a summary of the tweet(s) the user is giving you. The tweet provided to you will be added to your tweet later, do not \
include it, or a timeline in your tweet.
`;

/** Verbatim from build_scripts/description.js TASK (lines 88-107), with
 * SOCIAL_RULES inlined at the same position the running script inlines it
 * today (line 98), so this reproduces the exact prompt text byte-for-byte. */
const TASK_INTRO = `You are building reference content for The Ultimate Star Wars Timeline (https://timeline.starwars.guide), a canon-focused interactive timeline.

For the character described below:

1. VERIFY THE DATES FIRST. Fetch the character's Wookieepedia page (the wookiepedia URL in the payload) — that article is the primary source and usually answers everything. Budget roughly three web fetches total: spend them on the Wookieepedia article first, and only search further when it leaves a date genuinely unresolved or you hit a conflict worth reporting. Determine the canon birth year and death year. Pay particular attention to the dates we claim to know: a date is "claimed known" when startYearUnknown / endYearUnknown is absent or false. Those are the ones our app presents as fact, so an error there is worse than an imprecise guess. Confirm each against a source; if a date genuinely cannot be pinned down in canon, say so rather than inventing precision.

2. Write "description": a single-paragraph summary of who the character is, what they are known for, and their major milestones. HTML, wrapped in one <p> tag. No links, no citations, no headings.

3. Write "socialDesc": the meta description for this character's page — the line that appears under the title in Google results and on a shared social card.

${SOCIAL_RULES}

4. Write "timeline": a comprehensive, chronological list of that character's events. HTML, alternating <h3>Date - Title</h3> and <p>brief description</p>. ${TIMELINE_EXAMPLE} No links, no citations. The events must be consistent with the dates you verified in step 1 — if you concluded the character was born in 41 BBY, the birth event says 41 BBY.

5. Report "notes": anything the maintainer should act on. This is the most valuable part of your output, so be specific and be willing to disagree with our data. Include:
   - dates in our payload that contradict what you found (say what we have, what it should be, and why),
   - anything else factually wrong or out of date in our entry — species, homeworld, the old description, a "seenIn" appearance that is not real, a death recorded for a character who survives,
   - things worth adding that we clearly do not track yet,
   - genuine canon ambiguity we should know about (conflicting sources, Legends vs canon, a date that only exists in a reference book).
   If a field checks out fine, do not write a note about it. An empty notes list is a valid answer for a well-maintained entry.`;

export default {
  id: 'starwars',
  siteName: 'Ultimate Star Wars Timeline',
  origin: 'https://timeline.starwars.guide',
  lang: 'en',
  homeDescription: 'The Ultimate Star Wars Timeline including characters, movies, and TV shows.',
  tagline: 'A long time ago, in a galaxy far, far away...',
  loadingNote: 'Please wait while the page loads.',
  welcomeTitle: 'Welcome to the Ultimate Star Wars Timeline',
  characterTitleSuffix: ' - Ultimate Star Wars Timeline',
  characterDescFallback: (name) => `Learn more about ${name} on the Ultimate Star Wars Timeline!`,

  years: {
    negativeSuffix: 'BBY',
    positiveSuffix: 'ABY',
    zeroIsNegative: true,
    absolute: true,
    unknownLabel: 'unknown',
  },

  labels: {
    wikiName: 'Wookieepedia',
    wikiField: 'wookiepedia',
    wikiLinkText: 'Learn more on Wookiepedia.com',
    wikiLinkSuffix: 'on Wookieepedia',
    seenInLabel: 'Seen in Movie or TV Show:',
    seenInPlaceholder: 'Filter by Movie/TV Show',
    hideDeceasedLabel: 'Hide Deceased',
    deathIcon: '💀',
    allCharactersText: 'All Star Wars characters',
    charactersBreadcrumb: 'Characters',
  },

  images: {
    default: '/images/starwars.jpg',
    social: '/social.png',
    socialOverrides: {
      'Luke Skywalker': '/social/social_Luke_Skywalker.png',
    },
  },

  social: {
    twitterSite: '@UltStarWarsTime',
    twitterCreator: '@AurebeshFiles',
    creatorUrl: 'https://twitter.com/aurebeshfiles',
    creatorLabel: '@AurebeshFiles',
  },

  // Every field here is optional; when absent the corresponding
  // component/snippet is not emitted (see plan WU-3).
  analytics: {
    gtmId: 'GTM-M6F2CL7',
    clarityId: 'a8qek3lghk',
    ga4Id: 'G-0KMM0RG2X2',
    adsenseClient: 'ca-pub-6056590143595280',
    adSlot: '3687052385',
    hubAdSlot: '1622037034',
    bingVerification: 'C64BB17D4D1CA118CE50A6F9CFAFD602',
    yandexVerification: '1b0908106ac369fa',
  },

  // Each entry is optional; an unset URL means the menu item/link is omitted.
  menu: {
    newsFeedUrl: 'https://starwars.guide/news-feed.json',
    allNewsUrl: 'https://starwars.guide/news/',
    allNewsLabel: 'All news from Star Wars Guide',
    issuesUrl: 'https://github.com/DavidLozzi/starwars-timeline/issues',
    supportUrl: 'https://starwars.guide/support-aurebesh-files.html',
    supportLabel: 'Support the Timeline',
    gamesUrl: 'https://starwars.guide/games',
    gamesLabel: 'Star Wars Games',
    helpUrl: 'https://starwars.guide/star-wars-timeline',
  },

  // Onboarding copy that varies by pack vocabulary (src/organisms/OnboardingGuide/content.js).
  onboarding: {
    filterHelp:
      'Use the search options at the top right to find what you\'re looking for! Find by Character or filter by Movie or TV Show, Force Sensitive, Species, and more!',
  },

  // Filenames and the "timline" typos are indexed by Google — keep verbatim.
  seoPages: {
    movies: {
      file: 'starwars_movies',
      title: 'Star Wars Movies Timeline',
      heading: 'Star Wars Movies Timeline',
      intro: 'A long time ago in a galaxy far, far away...',
    },
    tv: {
      file: 'starwars_tvshows',
      title: 'Star Wars TV Show Timeline',
      heading: 'Star Wars TV Shows Timeline',
      intro: 'Click on any of the Star Wars TV shows below to see it in the timline!',
    },
    characters: {
      file: 'starwars_characters',
      title: 'Star Wars Characters Timeline',
      heading: 'Star Wars Characters Timeline',
      intro: 'Click on any of the Star Wars characters below to see it in the timline!',
    },
  },

  storagePrefix: 'starwars_timeline',
  metadataJsonLd: { speciesField: 'Species', homeworldField: 'Homeworld' },
  features: { hyperspace: true },
  themes: { defaultId: 'jedi' },

  // Prose for build_scripts/description.js (research + social-only passes).
  // Moved verbatim from description.js:63-107, :302, :645, :607 — see the
  // module-level comments above for exactly what was inlined where.
  contentGen: {
    wikiName: 'Wookieepedia',
    wikiDomain: 'starwars.fandom.com',
    wikiUrlField: 'wookiepedia',
    researcherPersona: 'You are a Star Wars canon researcher. Verify claims against sources before stating them.',
    socialWriterPersona: 'You write concise, accurate metadata for reference pages.',
    fieldGuide: FIELD_GUIDE,
    yearConvention: YEAR_CONVENTION,
    timelineExample: TIMELINE_EXAMPLE,
    socialRules: SOCIAL_RULES,
    taskIntro: TASK_INTRO,
    socialTaskIntro: SOCIAL_TASK_INTRO,
  },

  // build_scripts/social.js (one-off tweet-copy generator) prose, icons and
  // hashtag — moved out of that script by WU-10 so it stays pack-agnostic.
  socialPost: {
    systemPrompt: SOCIAL_POST_SYSTEM_PROMPT,
    hashtag: '#StarWars',
    icons: { movie: '🍿', tv: '📺', birth: '🎂', death: '🪦' },
    typeLabels: { movie: 'movie', tv: 'TV show' },
    eraBegin: (title, display) => `📆  The ${title} has begun, in the year of ${display}`,
    eraDuring: (title, display) => `📆  During the ${title}, in the year of ${display}`,
    eraEnd: (title) => `🍾  Long live the ${title}!`,
  },

  // build_scripts/getWords.js excludes short tokens matching these from the
  // SWordle word list (added by WU-10).
  excludedWords: ['Star'],

  hubExport: {
    enabled: true,
    repoPath: '../../starwars-guide',
    siteLabel: 'Star Wars',
    socialTitleSuffix: ' — Star Wars Timeline & Story',
    wikiLinkText: 'Learn more on Wookiepedia.com',
    wikiFrontMatterKey: 'wookieepedia',
    indexTitle: 'Star Wars Characters on the Timeline',
    indexSocialTitle: 'All Star Wars Character Timelines',
    // website.js:257 — social-desc for the hub character index page.
    indexDescTemplate: (count) =>
      `Browse timelines for ${count} Star Wars characters — birth and death years, species, homeworlds, and every movie and series they appear in.`,
    // website.js:332 — the paragraph rendered above the <ul class="character-index">.
    indexIntro: (count) =>
      `Browse all ${count} Star Wars characters cataloged in the <a href="https://timeline.starwars.guide" target="_blank">Ultimate Star Wars Timeline</a>, from Jedi and Sith to droids, bounty hunters, and rulers across the galaxy. Each entry below gives their birth and death years, species, homeworld, and every movie, series, or game they appear in, plus a link to their full profile page and a direct link into the interactive timeline at the year they first show up. Click a name to read their story, or click "on the timeline" to jump straight into that moment in galactic history.`,
  },
};
