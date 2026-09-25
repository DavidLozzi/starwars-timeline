// Generate character descriptions and timelines with Claude.
//
// Reads data.json, sends each character's full entry to Claude (Opus 4.8) with
// web search + web fetch so it can verify dates against Wookieepedia rather than
// recalling them, and writes description / socialDesc / timeline / notes into
// character_descriptions.json, keyed by wookiepedia URL.
//
// Two drivers, same prompt and same output schema:
//   - default: the Claude API (@anthropic-ai/sdk), needs ANTHROPIC_API_KEY in
//     .env (see .env.sample), billed as API usage.
//   - --via-claude-code: your local Claude Code install
//     (@anthropic-ai/claude-agent-sdk), which uses whatever auth Claude Code
//     already has — no API key needed.
//
// Usage (from build_scripts/):
//   node description.js                    only characters missing from character_descriptions.json
//   node description.js --all              regenerate every character
//   node description.js "Ahsoka Tano" ...  regenerate just the named characters
//   node description.js --via-claude-code  run through local Claude Code instead of the API
//   node description.js --dry-run <name>   print the prompt that would be sent, call nothing
//
// Social-description backfill (from build_scripts/):
//   node description.js --social-only            fill socialDesc where it is missing
//   node description.js --social-only --all      rewrite every socialDesc
//   node description.js --social-only "Thrawn"   rewrite just the named characters
//
// --social-only rewrites the stored description into a meta description. It does
// no research (no web tools, no data.json lookup), so it is seconds per character
// on a small model rather than minutes on Opus. Use it to backfill entries that
// predate socialDesc; a normal run already emits it alongside the bio.
import fs from 'fs';
import Anthropic from '@anthropic-ai/sdk';
import { query } from '@anthropic-ai/claude-agent-sdk';
import dotenv from 'dotenv';
import { sanitize, stripHtml, truncate, MAX_DESC } from './textUtils.js';

dotenv.config();

const MODEL = process.env.DESCRIPTION_MODEL || 'claude-opus-5-5';
// Each character is minutes of model time, so throughput comes from running
// them side by side rather than from making any one of them faster.
const CONCURRENCY = 8;
const EFFORT = 'medium';
const MAX_TURNS = 16;
const RESULTS_PATH = './character_descriptions.json';

// The --social-only pass rewrites text we already have — no research, no tools,
// one turn — so it runs on a small model and far wider than the research pass.
const SOCIAL_MODEL = 'claude-sonnet-5';
const SOCIAL_CONCURRENCY = 12;

const client = new Anthropic();

// $ per million tokens, first-party API list prices (from the claude-api skill, 2026-09).
// The Claude Code driver reports its own total_cost_usd; the API returns only token
// counts, so the API driver prices them here. Cache writes are 1.25x input (5-minute TTL),
// cache reads 0.1x unless listed. An unknown model logs no cost rather than a guess.
const PRICES = {
  'claude-opus-5-5': { input: 4, output: 20, cacheRead: 0.2 },
  'claude-opus-5': { input: 5, output: 25 },
  'claude-opus-4-8': { input: 5, output: 25 },
  'claude-sonnet-5': { input: 2, output: 10 },
};
const priceUsage = (model, { inputTokens, outputTokens, cacheReadTokens, cacheWriteTokens }) => {
  const p = PRICES[model];
  if (!p) return undefined;
  const cacheRead = p.cacheRead ?? p.input * 0.1;
  return (inputTokens * p.input + outputTokens * p.output
    + (cacheReadTokens || 0) * cacheRead + (cacheWriteTokens || 0) * p.input * 1.25) / 1e6;
};
const data = JSON.parse(fs.readFileSync('./data.json', 'utf8'));

const convertYear = (year) => {
  if (year === null || year === undefined) return 'unknown';
  if (year <= 0) return `${year * -1} BBY`;
  return `${year} ABY`;
};

// Explains our data shape to Claude. The fields are inconsistent by design —
// entries were authored over years — so spell out what each variation means.
const FIELD_GUIDE = `Every entry in our data file is one row of the timeline. Fields vary from character to character; here is what each one means:

- title: the name we display. altTitle: a nickname or second identity (e.g. "Snips", "Darth Tyranus"). Optional.
- type: always "character" for these entries. Other rows in the same file are "movie", "tv" and "era".
- startYear: the year the character's column STARTS on the timeline. Usually the birth year, but not always — for very long-lived characters it is clamped to the start of the timeline (e.g. Yoda starts at -300 while birthYear is -896).
- birthYear: present only when it differs from startYear. When present, THIS is the real birth year and startYear is only a rendering position.
- startYearUnknown: true means the birth year is a guess we made to position the column, not a canon date. The app labels it "(this is a guess)".
- endYear: the year the column ENDS. Usually the death year. When endYearUnknown is true, the character did not die then — they are alive, their fate is unknown, or we simply stopped drawing the column.
- endYearEvent: the movie or series during which the character died, when we know it.
- Years use the timeline convention: NEGATIVE is BBY, POSITIVE is ABY. -36 means 36 BBY, and 0 is 0 BBY, the year of the Battle of Yavin.
- We follow Wookieepedia's current dating, from the updated Star Wars: Galactic Atlas: the events of Rogue One and of A New Hope before the Battle of Yavin fall in 1 BBY (-1), not 0 BBY. A death during either film at -1 is correct; do not propose 0, and date those events 1 BBY in the timeline you write.
- metadata: a list of {name, value} facts we display. Common names are Homeworld, Species, Force Sensitive, Creator, Clone — a character may have any subset.
- seenIn: the movies and series the character appears in, by our display titles. Not exhaustive canon; it is what our timeline plots.
- imageUrl / imageYears: display assets only, ignore them.
- wookiepedia / databank: reference URLs for this character.`;

// The socialDesc rules live on their own because two prompts use them: the full
// research pass below, and the --social-only backfill. They must not drift — a
// backfilled page and a freshly generated one should read the same way.
const SOCIAL_RULES = `- Between 140 and 155 characters. Never more than 155 — Google truncates on pixel width, not character count, so anything longer risks being cut off in search results.
- Do NOT reuse the opening clause of the description. Search engines discard a meta description that only repeats copy already visible on the page, so this has to be independently written, not the first sentence trimmed down.
- Lead with the character's name, then what they are actually known for: role, era, allegiance, and fate where canon settles it. Prefer the concrete over the encyclopedic — "clone captain who led the 501st Legion and outlived the Empire he was built to serve" beats "was a human male clone trooper of the Grand Army of the Republic".
- Summarize the character, not the page — never mention the page, the timeline or the site itself. Do not open the way a biography opens ("X was a human male..."); open with what makes them worth reading about.
- Plain text only: no HTML, no surrounding quotes, no ellipsis, no trailing "…". It must end on a complete sentence with a full stop.`;

const TASK = `You are building reference content for The Ultimate Star Wars Timeline (https://timeline.starwars.guide), a canon-focused interactive timeline.

For the character described below:

1. VERIFY THE DATES FIRST. Read the character's Wookieepedia article, included below the payload as wikitext (the infobox's born/died fields are the dates). Wookieepedia blocks web fetches from this environment, so don't try to fetch it again. That article is the primary source and usually answers everything. Only search the web when it leaves a date genuinely unresolved or you hit a conflict worth reporting. Determine the canon birth year and death year. Pay particular attention to the dates we claim to know: a date is "claimed known" when startYearUnknown / endYearUnknown is absent or false. Those are the ones our app presents as fact, so an error there is worse than an imprecise guess. Confirm each against a source; if a date genuinely cannot be pinned down in canon, say so rather than inventing precision.

2. Write "description": a single-paragraph summary of who the character is, what they are known for, and their major milestones. HTML, wrapped in one <p> tag. No links, no citations, no headings. Write it in your own words, not as a paraphrase of the article. In particular, don't open with Wookieepedia's lead formula ("X was a [species] [role] from [homeworld] who…"), and don't state species or homeworld at all: the page shows both as separate fields right above the paragraph. Mention them only where they are part of the story (e.g. a Wookiee freeing Kashyyyk), not as labels. Open with what the character is known for.

3. Write "socialDesc": the meta description for this character's page — the line that appears under the title in Google results and on a shared social card.

${SOCIAL_RULES}

4. Write "timeline": a comprehensive, chronological list of that character's events. HTML, alternating <h3>Date - Title</h3> and <p>brief description</p>. Prefix estimated years with ~ (e.g. "~36 BBY - Birth on Shili"). Use BBY/ABY, never negative numbers. No links, no citations. The events must be consistent with the dates you verified in step 1 — if you concluded the character was born in 41 BBY, the birth event says 41 BBY.

5. Report "notes": anything the maintainer should act on. This is the most valuable part of your output, so be specific and be willing to disagree with our data. Include:
   - dates in our payload that contradict what you found (say what we have, what it should be, and why),
   - anything else factually wrong or out of date in our entry — species, homeworld, a "seenIn" appearance that is not real, a death recorded for a character who survives,
   - things worth adding that we clearly do not track yet,
   - genuine canon ambiguity we should know about (conflicting sources, Legends vs canon, a date that only exists in a reference book).
   If a field checks out fine, do not write a note about it. An empty notes list is a valid answer for a well-maintained entry.`;

// The two drivers collect the answer differently: the API path takes a tool
// call, Claude Code takes structured output.
const HANDOFF = {
  api: 'Then call submit_character_profile exactly once with the result. Do not write the profile as plain text — only the tool call is read.',
  claudeCode:
    'Then return the result as JSON matching the required output schema. Do not write files and do not summarize what you did — only the JSON is read.',
};

const dateSchema = (label) => ({
  type: 'object',
  description: `The ${label} year you verified.`,
  properties: {
    year: {
      anyOf: [{ type: 'integer' }, { type: 'null' }],
      description: 'Timeline convention: negative for BBY, positive for ABY (-36 means 36 BBY). null if canon gives no usable year.',
    },
    confidence: {
      type: 'string',
      enum: ['confirmed', 'estimated', 'unknown'],
      description: '"confirmed" only when a source states it; "estimated" when derived (e.g. from a stated age); "unknown" when canon does not say.',
    },
    source: {
      type: 'string',
      description: 'Where the year came from — the page or work you took it from, and the reasoning if you derived it. Empty string if unknown.',
    },
  },
  required: ['year', 'confidence', 'source'],
  additionalProperties: false,
});

// Shared by PROFILE_SCHEMA and the --social-only tool so both passes are held to
// the same contract.
const socialDescSchema = {
  type: 'string',
  description: `Meta description for the character's page. 140-155 characters, plain text, a complete sentence, independently written rather than lifted from the description's opening clause.`,
};

const PROFILE_SCHEMA = {
  type: 'object',
  properties: {
      description: {
        type: 'string',
        description: 'One-paragraph summary wrapped in a single <p> tag.',
      },
      socialDesc: socialDescSchema,
      timeline: {
        type: 'string',
        description: 'Chronological events as alternating <h3>Date - Title</h3> and <p>description</p>.',
      },
      birth: dateSchema('birth'),
      death: dateSchema('death'),
      notes: {
        type: 'array',
        description: 'Corrections, additions and ambiguities for the maintainer. Empty when the entry checks out.',
        items: {
          type: 'object',
          properties: {
            type: {
              type: 'string',
              enum: ['correction', 'addition', 'ambiguity'],
              description: '"correction" when our data is wrong, "addition" for something we should track, "ambiguity" for unsettled canon.',
            },
            field: {
              type: 'string',
              description: 'The field this is about (e.g. "endYear", "metadata.Species", "seenIn"), or "" if it is not about a specific field.',
            },
            current: {
              type: 'string',
              description: 'What our data currently says. Empty string if we say nothing.',
            },
            suggested: {
              type: 'string',
              description: 'What it should say. Empty string if you are only flagging, not proposing.',
            },
            detail: {
              type: 'string',
              description: 'Why — the source or reasoning behind the note.',
            },
          },
          required: ['type', 'field', 'current', 'suggested', 'detail'],
          additionalProperties: false,
        },
      },
  },
  required: ['description', 'socialDesc', 'timeline', 'birth', 'death', 'notes'],
  additionalProperties: false,
};

const submitTool = {
  name: 'submit_character_profile',
  description: 'Record the finished profile for this character. Call exactly once, after verifying the dates.',
  strict: true,
  input_schema: PROFILE_SCHEMA,
};

const tools = [
  { type: 'web_search_20260209', name: 'web_search' },
  { type: 'web_fetch_20260209', name: 'web_fetch' },
  submitTool,
];

// Wookieepedia answers the model's own fetches with 402/403, so the article is
// fetched here through api.php (the sanctioned route; /wiki/ HTML is blocked) and
// put in the prompt. Refs are stripped and long articles cut: Obi-Wan's wikitext is
// ~500 KB, and the infobox, lead and early biography carry what the prompt needs.
const WIKITEXT = new Map();
const WIKITEXT_MAX = 40000;
const USER_AGENT = 'starwars-timeline-description/1.0 (https://timeline.starwars.guide)';
let lastWikiFetch = Promise.resolve();

const wikitextUrl = (url) =>
  `https://starwars.fandom.com/api.php?action=query&prop=revisions&rvprop=content&rvslots=main&format=json&formatversion=2&redirects=1&titles=${encodeURIComponent(decodeURIComponent(url.split('/wiki/')[1] || ''))}`;

// One request at a time, a second apart, however many characters run at once.
const fetchWikitext = (url) => {
  const turn = lastWikiFetch.then(async () => {
    try {
      const response = await fetch(wikitextUrl(url), { headers: { 'User-Agent': USER_AGENT } });
      if (!response.ok) return null;
      // The raw revision, not action=parse: parsing Anakin's 1.1 MB article times out (503).
      const text = (await response.json())?.query?.pages?.[0]?.revisions?.[0]?.slots?.main?.content;
      if (!text) return null;
      const stripped = text
        .replace(/<ref[^>/]*\/>/g, '')
        .replace(/<ref[^>]*>[\s\S]*?<\/ref>/g, '');
      return stripped.length > WIKITEXT_MAX
        ? `${stripped.slice(0, WIKITEXT_MAX)}\n\n[Article truncated at ${WIKITEXT_MAX.toLocaleString()} characters.]`
        : stripped;
    } catch {
      return null;
    }
  });
  lastWikiFetch = turn.then(() => new Promise((resolve) => setTimeout(resolve, 1000)));
  return turn;
};

const buildPrompt = (character, handoff = HANDOFF.api) => {
  const claimedBirth = character.birthYear ?? character.startYear;
  const readable = [
    `Birth year we currently show: ${convertYear(claimedBirth)}${character.startYearUnknown ? ' — WE FLAG THIS AS A GUESS' : ' — WE PRESENT THIS AS KNOWN'}`,
    `Death year we currently show: ${character.endYearUnknown ? `none (column ends at ${convertYear(character.endYear)}, which is a rendering bound, not a death)` : `${convertYear(character.endYear)} — WE PRESENT THIS AS KNOWN`}`,
  ].join('\n');

  return `${TASK}

${handoff}

## How to read our data

${FIELD_GUIDE}

## Dates we are asserting for this character

${readable}


## Our full entry for ${character.title}

\`\`\`json
${JSON.stringify(character, null, 2)}
\`\`\`

## Wookieepedia article for ${character.title}

${WIKITEXT.get(character.wookiepedia) || '(Not available: the article could not be fetched. Research with web search and say in your notes that the article was unavailable.)'}`;
};

// Structured output sometimes comes back with the HTML entity-escaped
// (&lt;h3&gt; instead of <h3>) — roughly half the time, unpredictably. Left
// alone it renders as literal text in the app, so normalize on the way in.
const unescapeMarkup = (html) => {
  if (!html || !/&lt;\/?[a-z]/i.test(html)) return html;
  return html
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, '\'')
    .replace(/&amp;/g, '&');
};

// The prompt asks for <= MAX_DESC characters; truncate() here is the safety net,
// not the mechanism — an overshoot means the prompt is drifting, so callers log
// it rather than letting a silently trimmed line pass as authored copy.
const normalizeSocialDesc = (text) => stripHtml(sanitize(text || ''))
  .replace(/^["'“”]+|["'“”]+$/g, '')
  .trim();

// Deterministic cross-check: whatever Claude concluded, compare it to the data
// we actually ship so a disagreement can't be lost in prose.
const dateMismatchNotes = (character, profile) => {
  const notes = [];
  const check = (label, field, ours, flaggedUnknown, verified) => {
    if (verified?.year === null || verified?.year === undefined) return;
    if (ours === null || ours === undefined) return;
    if (verified.year === ours) return;
    notes.push({
      type: 'correction',
      field,
      current: `${convertYear(ours)}${flaggedUnknown ? ' (flagged as a guess)' : ' (presented as known)'}`,
      suggested: `${convertYear(verified.year)} (${verified.confidence})`,
      detail: `Automatic check: ${label} in data.json disagrees with the year Claude verified. ${verified.source}`.trim(),
      auto: true,
    });
  };

  check(
    'birth year',
    character.birthYear !== undefined ? 'birthYear' : 'startYear',
    character.birthYear ?? character.startYear,
    Boolean(character.startYearUnknown),
    profile.birth
  );
  if (!character.endYearUnknown) {
    check('death year', 'endYear', character.endYear, false, profile.death);
  }
  return notes;
};

// Driver 2: the local Claude Code install. Uses Claude Code's own auth, so no
// API key is involved. settingSources: [] keeps this repo's CLAUDE.md and
// settings out of the run, and 'dontAsk' + a two-tool allowlist means the agent
// can read the web and nothing else — no file writes, no shell.
const runViaClaudeCode = async (character) => {
  const startedAt = Date.now();
  let toolCalls = 0;
  const toolNames = {};

  const session = query({
    prompt: buildPrompt(character, HANDOFF.claudeCode),
    options: {
      model: MODEL,
      effort: EFFORT,
      maxTurns: MAX_TURNS,
      systemPrompt: 'You are a Star Wars canon researcher. Verify claims against sources before stating them.',
      allowedTools: ['WebFetch', 'WebSearch'],
      permissionMode: 'dontAsk',
      settingSources: [],
      outputFormat: { type: 'json_schema', schema: PROFILE_SCHEMA },
    },
  });

  for await (const message of session) {
    if (message.type === 'assistant') {
      (message.message?.content || [])
        .filter((block) => block.type === 'tool_use')
        .forEach((block) => {
          toolCalls += 1;
          toolNames[block.name] = (toolNames[block.name] || 0) + 1;
        });
      continue;
    }
    if (message.type !== 'result') continue;
    if (message.subtype !== 'success') {
      throw new Error(message.errors?.join('; ') || message.subtype);
    }

    const models = Object.values(message.modelUsage || {});
    const sum = (field) => models.reduce((total, usage) => total + (usage[field] || 0), 0);
    const stats = {
      wallMs: Date.now() - startedAt,
      apiMs: message.duration_api_ms,
      turns: message.num_turns,
      toolCalls,
      toolNames,
      inputTokens: sum('inputTokens'),
      outputTokens: sum('outputTokens'),
      cacheReadTokens: sum('cacheReadInputTokens'),
      cacheWriteTokens: sum('cacheCreationInputTokens'),
      webSearches: sum('webSearchRequests'),
      costUsd: message.total_cost_usd,
      // The allowlist is meant to hold this to web reads only. Record what the
      // sandbox actually turned away so an unattended run is auditable.
      denials: (message.permission_denials || []).map((denial) => denial.tool_name),
    };

    let profile = message.structured_output;
    if (!profile) {
      // Structured output should always be present with outputFormat set; fall
      // back to parsing the text result rather than losing a completed run.
      try {
        profile = JSON.parse(message.result);
      } catch {
        // Keep the model's own text: an API error (usage limit, unsupported model)
        // arrives here as a plain-text "success" and is otherwise invisible.
        throw new Error(`result was not valid JSON and no structured_output was returned: ${String(message.result || '').slice(0, 300)}`);
      }
    }
    return { profile, stats };
  }

  throw new Error('Claude Code session ended without a result message');
};

// Driver 1: the Claude API.
const runViaApi = async (character) => {
  const messages = [{ role: 'user', content: buildPrompt(character) }];
  const startedAt = Date.now();
  const totals = { inputTokens: 0, outputTokens: 0, cacheReadTokens: 0, cacheWriteTokens: 0, webSearches: 0 };
  let toolCalls = 0;
  const toolNames = {};

  for (let turn = 0; turn < MAX_TURNS; turn++) {
    const stream = client.messages.stream({
      model: MODEL,
      max_tokens: 32000,
      thinking: { type: 'adaptive' },
      output_config: { effort: EFFORT },
      tools,
      messages,
    });
    const response = await stream.finalMessage();

    totals.inputTokens += response.usage?.input_tokens || 0;
    totals.outputTokens += response.usage?.output_tokens || 0;
    totals.cacheReadTokens += response.usage?.cache_read_input_tokens || 0;
    totals.cacheWriteTokens += response.usage?.cache_creation_input_tokens || 0;
    totals.webSearches += response.usage?.server_tool_use?.web_search_requests || 0;
    response.content
      .filter((block) => block.type === 'server_tool_use' || block.type === 'tool_use')
      .forEach((block) => {
        toolCalls += 1;
        toolNames[block.name] = (toolNames[block.name] || 0) + 1;
      });

    // A server-side tool loop hit its iteration cap; re-send to resume.
    if (response.stop_reason === 'pause_turn') {
      messages.push({ role: 'assistant', content: response.content });
      continue;
    }

    const submission = response.content.find(
      (block) => block.type === 'tool_use' && block.name === submitTool.name
    );
    if (submission) {
      return {
        profile: submission.input,
        stats: { wallMs: Date.now() - startedAt, turns: turn + 1, toolCalls, toolNames, ...totals, costUsd: priceUsage(MODEL, totals) },
      };
    }

    if (response.stop_reason === 'end_turn') {
      throw new Error('finished without calling submit_character_profile');
    }

    // Any other client-side tool use would be answered here; we only expose the
    // submit tool, so reaching this means an unexpected tool call.
    const unexpected = response.content.filter((block) => block.type === 'tool_use');
    if (unexpected.length === 0) {
      throw new Error(`unexpected stop_reason: ${response.stop_reason}`);
    }
    messages.push({ role: 'assistant', content: response.content });
    messages.push({
      role: 'user',
      content: unexpected.map((block) => ({
        type: 'tool_result',
        tool_use_id: block.id,
        content: `Unknown tool "${block.name}". Call ${submitTool.name} instead.`,
        is_error: true,
      })),
    });
  }

  throw new Error(`gave up after ${MAX_TURNS} turns`);
};

const viaClaudeCode = process.argv.includes('--via-claude-code');
// dotenv has already loaded build_scripts/.env. Claude Code prefers ANTHROPIC_API_KEY over
// the local login, so leaving it set would bill the API balance instead of the Claude
// subscription this flag exists to use.
if (viaClaudeCode) delete process.env.ANTHROPIC_API_KEY;
const runCharacter = async (character) => {
  if (!WIKITEXT.has(character.wookiepedia)) {
    const text = await fetchWikitext(character.wookiepedia);
    if (text) WIKITEXT.set(character.wookiepedia, text);
    else console.warn(`  ! ${character.title}: could not fetch the Wookieepedia article; researching without it`);
  }
  return (viaClaudeCode ? runViaClaudeCode : runViaApi)(character);
};

const selectCharacters = (existingResults) => {
  const args = process.argv.slice(2);
  const all = data.filter((item) => item.type === 'character' && item.wookiepedia);
  const names = args.filter((arg) => !arg.startsWith('--'));

  if (args.includes('--all')) return { characters: all, mode: 'all' };
  if (names.length > 0) {
    const wanted = names.map((name) => name.toLowerCase());
    const matched = all.filter((character) => wanted.includes(character.title.toLowerCase()));
    const missing = names.filter(
      (name) => !all.some((character) => character.title.toLowerCase() === name.toLowerCase())
    );
    if (missing.length > 0) {
      console.error(`Not found in data.json: ${missing.join(', ')}`);
    }
    return { characters: matched, mode: 'named' };
  }
  return {
    characters: all.filter((character) => !existingResults[character.wookiepedia]),
    mode: 'missing',
  };
};

// Bounded concurrency — these calls fetch pages and think, so they run for
// minutes each; firing all 78 at once just burns rate limit.
const runPool = async (items, worker, concurrency = CONCURRENCY) => {
  const queue = [...items];
  const runners = Array.from({ length: Math.min(concurrency, queue.length) }, async () => {
    while (queue.length > 0) {
      await worker(queue.shift());
    }
  });
  await Promise.all(runners);
};

const processCharacters = async () => {
  let existingResults = {};
  try {
    existingResults = JSON.parse(fs.readFileSync(RESULTS_PATH, 'utf8'));
    console.log(`Loaded ${Object.keys(existingResults).length} existing character descriptions`);
  } catch {
    console.log('No existing character_descriptions.json found, starting fresh');
  }

  const { characters, mode } = selectCharacters(existingResults);
  const driver = viaClaudeCode ? 'local Claude Code' : 'Claude API';
  console.log(`Processing ${characters.length} character(s) [${mode}] with ${MODEL} via ${driver}\n`);
  if (characters.length === 0) return;

  if (process.argv.includes('--dry-run')) {
    const handoff = viaClaudeCode ? HANDOFF.claudeCode : HANDOFF.api;
    characters.forEach((character) => {
      console.log(`===== prompt for ${character.title} =====\n${buildPrompt(character, handoff)}\n`);
    });
    console.log(`Dry run — no API calls made for ${characters.length} character(s).`);
    return;
  }

  const results = { ...existingResults };
  const failures = [];
  const noted = [];
  const timings = [];
  const runStartedAt = Date.now();
  let done = 0;

  await runPool(characters, async (character) => {
    try {
      const { profile, stats } = await runCharacter(character);
      const notes = [...dateMismatchNotes(character, profile), ...(profile.notes || [])];

      const socialDesc = normalizeSocialDesc(unescapeMarkup(profile.socialDesc));
      if (socialDesc.length > MAX_DESC) {
        console.warn(`  ! ${character.title}: socialDesc came back ${socialDesc.length} chars, truncating to ${MAX_DESC}`);
      }

      results[character.wookiepedia] = {
        character: character.title,
        description: unescapeMarkup(profile.description),
        socialDesc: socialDesc.length > MAX_DESC ? truncate(socialDesc) : socialDesc,
        timeline: unescapeMarkup(profile.timeline),
        dates: { birth: profile.birth, death: profile.death },
        notes,
        generatedAt: new Date().toISOString(),
        model: MODEL,
        via: viaClaudeCode ? 'claude-code' : 'api',
        stats,
      };
      // Write as we go so a crash 60 characters in doesn't lose the work.
      fs.writeFileSync(RESULTS_PATH, JSON.stringify(results, null, 2));

      if (notes.length > 0) noted.push({ title: character.title, notes });
      timings.push({ title: character.title, ...stats });
      const tools = Object.entries(stats.toolNames || {})
        .map(([name, count]) => `${name}x${count}`)
        .join(' ');
      console.log(
        `[${++done}/${characters.length}] ${character.title} — ${notes.length} note(s) | ` +
          `${(stats.wallMs / 1000).toFixed(0)}s wall` +
          `${stats.apiMs ? `, ${(stats.apiMs / 1000).toFixed(0)}s api` : ''} | ` +
          `${stats.turns} turns, ${stats.toolCalls} tool calls${tools ? ` (${tools})` : ''} | ` +
          `in ${stats.inputTokens.toLocaleString()} out ${stats.outputTokens.toLocaleString()}` +
          `${stats.costUsd ? ` | $${stats.costUsd.toFixed(2)}` : ''}` +
          `${stats.denials?.length ? ` | DENIED: ${stats.denials.join(', ')}` : ''}`
      );
    } catch (error) {
      failures.push({ title: character.title, message: error.message });
      console.error(`[${++done}/${characters.length}] ${character.title} — FAILED: ${error.message}`);
    }
  });

  console.log(`\nWrote ${RESULTS_PATH} (${Object.keys(results).length} total characters)`);

  if (timings.length > 0) {
    const total = (field) => timings.reduce((sum, entry) => sum + (entry[field] || 0), 0);
    const wallSeconds = (Date.now() - runStartedAt) / 1000;
    const avgSeconds = total('wallMs') / timings.length / 1000;
    const slowest = [...timings].sort((a, b) => b.wallMs - a.wallMs)[0];
    console.log(`\n=== Timing (${timings.length} character(s), ${CONCURRENCY} at a time) ===`);
    console.log(`Elapsed: ${(wallSeconds / 60).toFixed(1)} min | per character: ${avgSeconds.toFixed(0)}s avg, ${(slowest.wallMs / 1000).toFixed(0)}s worst (${slowest.title})`);
    console.log(`Turns: ${(total('turns') / timings.length).toFixed(1)} avg | tool calls: ${(total('toolCalls') / timings.length).toFixed(1)} avg`);
    console.log(`Tokens: ${total('inputTokens').toLocaleString()} in, ${total('outputTokens').toLocaleString()} out, ${total('cacheReadTokens').toLocaleString()} cache read`);
    if (total('costUsd') > 0) console.log(`Cost: $${total('costUsd').toFixed(2)}`);
  }

  if (noted.length > 0) {
    console.log(`\n=== Notes from Claude (${noted.reduce((sum, entry) => sum + entry.notes.length, 0)} across ${noted.length} characters) ===`);
    noted.forEach(({ title, notes }) => {
      console.log(`\n${title}`);
      notes.forEach((note) => {
        const field = note.field ? ` [${note.field}]` : '';
        console.log(`  - ${note.type}${field}: ${note.current || '(nothing)'} -> ${note.suggested || '(no suggestion)'}`);
        if (note.detail) console.log(`    ${note.detail}`);
      });
    });
  }

  if (failures.length > 0) {
    console.error(`\n${failures.length} character(s) failed:`);
    failures.forEach(({ title, message }) => console.error(`  - ${title}: ${message}`));
    process.exitCode = 1;
  }
};

// ---------------------------------------------------------------------------
// --social-only: rewrite the stored bio into a meta description.
//
// This pass never touches data.json and never reaches the web — it reads
// character_descriptions.json, rewrites in place, and writes back. That is what
// makes it cheap enough to run over every character: one turn on a small model
// instead of minutes of research on Opus.

const SOCIAL_RESULT_SCHEMA = {
  type: 'object',
  properties: { socialDesc: socialDescSchema },
  required: ['socialDesc'],
  additionalProperties: false,
};

const socialTool = {
  name: 'submit_social_desc',
  description: 'Record the finished meta description for this character. Call exactly once.',
  strict: true,
  input_schema: SOCIAL_RESULT_SCHEMA,
};

// `rejected` is a previous answer that came back over the character limit. Asking
// again with it quoted is better than truncating: truncation puts back the
// mid-sentence ellipsis this whole change exists to remove.
const buildSocialPrompt = (entry, rejected = '') => `${rejected ? `Your previous attempt was ${rejected.length} characters — too long. Rewrite it shorter, keeping the same angle. Do not simply trim the end; recompose it so it still finishes cleanly.

Previous attempt:
${rejected}

` : ''}You are writing the meta description for a character page on The Ultimate Star Wars Timeline (https://timeline.starwars.guide), a canon-focused interactive timeline.

The bio below is already the opening paragraph of ${entry.character}'s page. Write the meta description for that page.

${SOCIAL_RULES}

## ${entry.character}'s bio, as it appears on the page

${stripHtml(entry.description || '')}`;

const runSocialViaApi = async (entry, rejected) => {
  const response = await client.messages
    .stream({
      model: SOCIAL_MODEL,
      max_tokens: 2000,
      tools: [socialTool],
      tool_choice: { type: 'tool', name: socialTool.name },
      messages: [{ role: 'user', content: buildSocialPrompt(entry, rejected) }],
    })
    .finalMessage();

  const submission = response.content.find(
    (block) => block.type === 'tool_use' && block.name === socialTool.name
  );
  if (!submission) throw new Error(`finished without calling ${socialTool.name}`);
  return submission.input.socialDesc;
};

const runSocialViaClaudeCode = async (entry, rejected) => {
  const session = query({
    prompt: `${buildSocialPrompt(entry, rejected)}

Return the result as JSON matching the required output schema. Do not summarize what you did — only the JSON is read.`,
    options: {
      model: SOCIAL_MODEL,
      // 2 was too tight — a sixth of the first backfill run died on the turn cap
      // after spending a turn reasoning about length before answering.
      maxTurns: 4,
      systemPrompt: 'You write concise, accurate metadata for reference pages.',
      allowedTools: [],
      permissionMode: 'dontAsk',
      settingSources: [],
      outputFormat: { type: 'json_schema', schema: SOCIAL_RESULT_SCHEMA },
    },
  });

  for await (const message of session) {
    if (message.type !== 'result') continue;
    if (message.subtype !== 'success') {
      throw new Error(message.errors?.join('; ') || message.subtype);
    }
    const output = message.structured_output || JSON.parse(message.result);
    return output.socialDesc;
  }
  throw new Error('Claude Code session ended without a result message');
};

const runSocialOnce = (entry, rejected) =>
  (viaClaudeCode ? runSocialViaClaudeCode : runSocialViaApi)(entry, rejected);

// One retry when the answer overruns, then truncate as a last resort.
const runSocial = async (entry) => {
  const first = normalizeSocialDesc(unescapeMarkup(await runSocialOnce(entry)));
  if (first.length <= MAX_DESC) return { socialDesc: first, retried: false };

  const second = normalizeSocialDesc(unescapeMarkup(await runSocialOnce(entry, first)));
  if (second.length <= MAX_DESC) return { socialDesc: second, retried: true };
  return { socialDesc: truncate(second), retried: true, truncatedFrom: second.length };
};

// Mirrors selectCharacters, but selects over character_descriptions.json rather
// than data.json: an entry with no description has nothing to rewrite.
const selectSocialEntries = (results) => {
  const args = process.argv.slice(2);
  const all = Object.entries(results).filter(([, entry]) => entry.description);
  const names = args.filter((arg) => !arg.startsWith('--'));

  if (args.includes('--all')) return { entries: all, mode: 'all' };
  if (names.length > 0) {
    const wanted = names.map((name) => name.toLowerCase());
    const nameOf = ([, entry]) => (entry.character || '').toLowerCase();
    const matched = all.filter((pair) => wanted.includes(nameOf(pair)));
    const missing = names.filter((name) => !all.some((pair) => nameOf(pair) === name.toLowerCase()));
    if (missing.length > 0) {
      console.error(`Not found in ${RESULTS_PATH}: ${missing.join(', ')}`);
    }
    return { entries: matched, mode: 'named' };
  }
  return { entries: all.filter(([, entry]) => !entry.socialDesc), mode: 'missing' };
};

const processSocialDescriptions = async () => {
  let results;
  try {
    results = JSON.parse(fs.readFileSync(RESULTS_PATH, 'utf8'));
  } catch {
    console.error(`--social-only rewrites existing entries, but ${RESULTS_PATH} could not be read. Run description.js first.`);
    process.exitCode = 1;
    return;
  }

  const { entries, mode } = selectSocialEntries(results);
  const withoutBio = Object.values(results).filter((entry) => !entry.description).length;
  const driver = viaClaudeCode ? 'local Claude Code' : 'Claude API';
  console.log(`Writing socialDesc for ${entries.length} character(s) [${mode}] with ${SOCIAL_MODEL} via ${driver}\n`);
  if (withoutBio > 0) {
    console.log(`${withoutBio} entry/entries have no description and are skipped — website.js and prepJson.js fall back for those.\n`);
  }
  if (entries.length === 0) return;

  if (process.argv.includes('--dry-run')) {
    entries.forEach(([, entry]) => {
      console.log(`===== prompt for ${entry.character} =====\n${buildSocialPrompt(entry)}\n`);
    });
    console.log(`Dry run — no calls made for ${entries.length} character(s).`);
    return;
  }

  const failures = [];
  const overshot = [];
  const startedAt = Date.now();
  let done = 0;

  await runPool(entries, async ([key, entry]) => {
    try {
      const { socialDesc, retried, truncatedFrom } = await runSocial(entry);
      if (truncatedFrom) overshot.push({ title: entry.character, length: truncatedFrom });

      results[key] = {
        ...entry,
        socialDesc,
        socialDescGeneratedAt: new Date().toISOString(),
        socialDescModel: SOCIAL_MODEL,
      };
      // Write as we go, same as the research pass — an interrupted run keeps its work.
      fs.writeFileSync(RESULTS_PATH, JSON.stringify(results, null, 2));

      console.log(
        `[${++done}/${entries.length}] ${entry.character} — ${socialDesc.length} chars` +
          `${retried ? ' (retried)' : ''}${truncatedFrom ? ` (TRUNCATED from ${truncatedFrom})` : ''}` +
          `\n    ${socialDesc}`
      );
    } catch (error) {
      failures.push({ title: entry.character, message: error.message });
      console.error(`[${++done}/${entries.length}] ${entry.character} — FAILED: ${error.message}`);
    }
  }, SOCIAL_CONCURRENCY);

  console.log(`\nWrote ${RESULTS_PATH} in ${((Date.now() - startedAt) / 1000).toFixed(0)}s`);

  if (overshot.length > 0) {
    console.warn(`\n${overshot.length} character(s) were still over ${MAX_DESC} characters after a retry and were truncated — the prompt is drifting:`);
    overshot.forEach(({ title, length }) => console.warn(`  - ${title}: ${length} chars`));
  }

  if (failures.length > 0) {
    console.error(`\n${failures.length} character(s) failed:`);
    failures.forEach(({ title, message }) => console.error(`  - ${title}: ${message}`));
    process.exitCode = 1;
  }
};

if (process.argv.includes('--social-only')) {
  processSocialDescriptions();
} else {
  processCharacters();
}
