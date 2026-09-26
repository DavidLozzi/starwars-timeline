// Pure, React-free parsing/layout helpers for focus-mode timeline events.
// `character.timeline` is an HTML string of `<h3>{date} - {Title}</h3><p>…</p>`
// pairs -- see CLAUDE.md's data pipeline notes and the focus-mode plan for the
// messy date-prefix formats this has to survive.

export const DOT_ROW_OFFSET = 0.8; // rem multiplier into the year row, below any SeenIn circle
export const CHARS_PER_LINE = 38; // rough characters-per-line estimate for card height
export const LINE_HEIGHT = 1.1; // rem, per wrapped title line

// A date token at the very start of a string, e.g. "5 ABY", "~890s BBY".
const LEADING_DATE_TOKEN_RE = /^~?\d[\d,]*s? (BBY|ABY)\b/;

// The first number in a string, optionally comma-grouped and/or trailing "s"
// (e.g. "890s", "25,020").
const FIRST_NUMBER_RE = /\d[\d,]*s?/;

const ERA_RE = /BBY|ABY/;

/**
 * Pulls a plot year out of a raw date prefix, e.g. "Before 800 BBY" -> -800.
 * The year is the first number in the prefix; its era is the first BBY/ABY
 * that follows that number anywhere later in the prefix. No number or no
 * era after it means "unplotted" (null).
 */
const extractYear = (prefix) => {
  if (!prefix) return null;
  const numberMatch = prefix.match(FIRST_NUMBER_RE);
  if (!numberMatch) return null;

  let numberText = numberMatch[0];
  if (numberText.endsWith('s')) numberText = numberText.slice(0, -1);
  numberText = numberText.replace(/,/g, '');

  const number = parseInt(numberText, 10);
  if (Number.isNaN(number)) return null;

  const afterNumber = prefix.slice(numberMatch.index + numberMatch[0].length);
  const eraMatch = afterNumber.match(ERA_RE);
  if (!eraMatch) return null;

  return eraMatch[0] === 'BBY' ? -number || 0 : number;
};

/**
 * Parses one `<h3>` heading's text into a date label, a title and a
 * plottable year (or null). See the focus-mode plan, decision 4, for the
 * exact rules -- this mirrors them.
 */
export const parseTimelineHeading = (text) => {
  const raw = typeof text === 'string' ? text : '';
  const trimmed = raw.trim();

  const sepIndex = trimmed.indexOf(' - ');
  if (sepIndex === -1) {
    return { label: null, title: trimmed, year: null };
  }

  let prefix = trimmed.slice(0, sepIndex);
  let rest = trimmed.slice(sepIndex + 3);

  // Handle headings with a second " - ", where the text right after the
  // first split is itself still a date token (e.g.
  // "~4 ABY - 5 ABY - Barma Battle Group").
  const restSepIndex = rest.indexOf(' - ');
  if (restSepIndex !== -1 && LEADING_DATE_TOKEN_RE.test(rest)) {
    prefix = `${prefix} - ${rest.slice(0, restSepIndex)}`;
    rest = rest.slice(restSepIndex + 3);
  }

  const title = rest.trim();
  const year = extractYear(prefix);

  return { label: prefix, title, year };
};

/**
 * Parses every `<h3>` heading out of a character's `timeline` HTML, in
 * document order. Missing/empty input gives `[]`.
 */
export const parseTimelineEvents = (timelineHtml) => {
  if (!timelineHtml) return [];

  const headings = [];
  const headingRe = /<h3>(.*?)<\/h3>/g;
  let match = headingRe.exec(timelineHtml);
  while (match !== null) {
    headings.push(match[1]);
    match = headingRe.exec(timelineHtml);
  }

  return headings.map((heading) => parseTimelineHeading(heading));
};

// Era phrases used as date prefixes when the source gives no year, mapped to
// an approximate [start, end] span in timeline years (negative = BBY). An
// event is placed at the first year of the span that falls inside the
// character's own life (see placeEvent). Spans follow the era entries in
// build_scripts/data.json where one exists (High Republic Era -300..-82,
// Reign of the Empire -19.., The New Republic 5..34); the rest are canon
// approximations. Checked in order, so the specific phrases come first.
const ERA_SPANS = [
  [/before the clone wars/i, [-Infinity, -23]],
  [/before or during the galactic civil war/i, [-Infinity, 4]],
  [/centuries before/i, [-Infinity, -1]],
  [/late centuries bby/i, [-Infinity, -1]],
  [/high republic/i, [-300, -82]],
  [/clone wars/i, [-22, -19]],
  [/early imperial/i, [-19, -10]],
  [/imperial era/i, [-19, 4]],
  [/galactic civil war/i, [0, 4]],
  [/new republic/i, [5, 34]],
  [/cold war/i, [21, 34]]
];

// Prefixes that mean "early in this character's life" with no year at all.
const EARLY_LIFE_RE = /^(early life|before\b|pre-)/i;

export const UNDATED_LABEL = 'Date unknown';

const clamp = (value, lo, hi) => Math.min(Math.max(value, lo), hi);

/**
 * Decides which years.json row an event is drawn on. Every event gets a row:
 * - an in-range year plots at that year (`approximate: false`);
 * - a year outside years.json (e.g. Yoda's 896 BBY birth) clamps to the
 *   first/last row but keeps its real label;
 * - an era prefix ("Imperial Era", "Clone Wars") plots at the earliest year of
 *   that era inside the character's life;
 * - "Early life" / "Before …" with no year, and truly undated events
 *   ("Unknown", "Date unknown", no prefix), plot at the character's startYear.
 * Undated events are labelled UNDATED_LABEL; everything approximate shows its
 * own label on the card so the placement is never mistaken for a real date.
 */
const placeEvent = (event, character, firstYear, lastYear) => {
  const lifeStart = character?.birthYear ?? character?.startYear ?? firstYear;
  const lifeEnd = character?.endYearUnknown || typeof character?.endYear !== 'number' ? lastYear : character.endYear;
  const startRow = clamp(typeof character?.startYear === 'number' ? character.startYear : lifeStart, firstYear, lastYear);

  if (typeof event.year === 'number' && Number.isInteger(event.year)) {
    const row = clamp(event.year, firstYear, lastYear);
    return { row, sortYear: event.year, approximate: row !== event.year, display: event.label };
  }

  const label = event.label || '';
  const era = ERA_SPANS.find(([re]) => re.test(label));
  if (era) {
    const [eraStart, eraEnd] = era[1];
    let year = Math.max(eraStart, lifeStart);
    if (year > eraEnd) year = eraEnd; // character born after the era: its last year
    if (year > lifeEnd) year = lifeEnd; // era entirely after the character's life
    const row = clamp(year, firstYear, lastYear);
    return { row, sortYear: row - 0.5, approximate: true, display: label };
  }

  if (EARLY_LIFE_RE.test(label)) {
    return { row: startRow, sortYear: startRow - 0.5, approximate: true, display: label };
  }

  return { row: startRow, sortYear: startRow - 0.75, approximate: true, display: UNDATED_LABEL };
};

// Whether an entry's year/label line is drawn: always on multi-entry cards,
// and always for approximate placements (so "~896 BBY" or "Imperial Era"
// sits above a dot on the 300 BBY row).
export const entryShowsLabel = (entry, entryCount) => entryCount > 1 || Boolean(entry.approximate);

export const estimateCardHeight = (entries) => {
  const yearLabelHeight = entries.filter((entry) => entryShowsLabel(entry, entries.length)).length * 1;
  const titlesHeight = entries.reduce((sum, entry) =>
    sum + entry.events.reduce((lineSum, event) =>
      lineSum + Math.ceil(Math.max(event.title.length, 1) / CHARS_PER_LINE) * LINE_HEIGHT, 0), 0);

  return 0.8 + yearLabelHeight + titlesHeight;
};

/**
 * Builds the dot + card layout for one character's focus-mode timeline.
 * `years` is `years.json` (one entry per integer year, with `yearIndex` and
 * `display`); `theme` supplies the row pitch (`layout.elements.year.height`),
 * `layout.topMargin` and the focus dot size (`layout.elements.focus.dotSize`).
 * Every parsed event is placed (see placeEvent), so `plottedCount` is the
 * character's full event count.
 */
export const buildCharacterEvents = (character, years, theme) => {
  const yearHeight = theme.layout.elements.year.height;
  const topMargin = theme.layout.topMargin;
  const dotSize = theme.layout.elements.focus.dotSize;

  const yearMap = new Map(years.map((y) => [y.year, y]));
  const yearValues = years.map((y) => y.year);
  const firstYear = Math.min(...yearValues);
  const lastYear = Math.max(...yearValues);
  const events = parseTimelineEvents(character?.timeline);

  // Place every event, then sort by row and true year; the sort is stable,
  // so document order survives within a year.
  const placed = events
    .map((event, order) => ({ event, order, ...placeEvent(event, character, firstYear, lastYear) }))
    .filter((p) => yearMap.has(p.row))
    .sort((a, b) => (a.row - b.row) || (a.sortYear - b.sortYear) || (a.order - b.order));

  // Group into rows (one dot each), and within a row into entries: exact
  // events share the row's display year; approximate ones group by label.
  const rows = [];
  placed.forEach((p) => {
    let row = rows[rows.length - 1];
    if (!row || row.year !== p.row) {
      const yearObj = yearMap.get(p.row);
      row = { year: p.row, yearIndex: yearObj.yearIndex, display: yearObj.display, entries: new Map() };
      rows.push(row);
    }
    const key = p.approximate ? `~${p.display}` : 'exact';
    if (!row.entries.has(key)) {
      row.entries.set(key, {
        year: p.row,
        key,
        display: p.approximate ? p.display : row.display,
        approximate: p.approximate,
        events: []
      });
    }
    row.entries.get(key).events.push({ title: p.event.title, label: p.event.label, order: p.order });
  });

  const rowTop = (yearIndex) => yearHeight * yearIndex + topMargin;
  const dotCenter = (yearIndex) => rowTop(yearIndex) + DOT_ROW_OFFSET * yearHeight;

  const dots = rows.map((row) => ({
    year: row.year,
    yearIndex: row.yearIndex,
    top: dotCenter(row.yearIndex) - dotSize / 2
  }));

  const cards = [];
  let current = null;

  rows.forEach((row) => {
    const desiredTop = dotCenter(row.yearIndex) - 0.6;
    const rowEntries = [...row.entries.values()];

    if (current && desiredTop < current.top + estimateCardHeight(current.entries) + 0.4) {
      current.entries.push(...rowEntries);
      return;
    }
    if (current) cards.push(current);
    current = { top: desiredTop, entries: rowEntries };
  });

  if (current) cards.push(current);

  return { dots, cards, plottedCount: placed.length };
};
