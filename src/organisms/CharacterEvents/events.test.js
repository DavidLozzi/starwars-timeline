import {
  parseTimelineHeading,
  parseTimelineEvents,
  buildCharacterEvents,
  UNDATED_LABEL,
  CHARS_PER_LINE,
  LINE_HEIGHT
} from './events';
import jediTheme from '../../themes/jedi';
import yearsData from '../../data/years.json';
import charactersData from '../../data/characters.json';

// Mirrors events.js's estimateCardHeight (decision 6, plus Revision 1's
// always-labelled approximate entries) using only the exported constants, so
// this stays a black-box check against the plan's formula rather than a copy
// of implementation internals.
const estimateCardHeight = (entries) => {
  const labelled = entries.filter(e => entries.length > 1 || e.approximate).length;
  const yearLabelHeight = labelled * 1;
  const titlesHeight = entries.reduce((sum, entry) =>
    sum + entry.events.reduce((lineSum, event) =>
      lineSum + Math.ceil(Math.max(event.title.length, 1) / CHARS_PER_LINE) * LINE_HEIGHT, 0), 0);
  return 0.8 + yearLabelHeight + titlesHeight;
};

describe('parseTimelineHeading', () => {
  const cases = [
    ['19 BBY - Birth', -19],
    ['~5 BBY - X', -5],
    ['22–19 BBY - X', -22],
    ['Before 800 BBY - X', -800],
    ['Between 40 and 34 BBY - X', -40],
    ['~890s BBY - X', -890],
    ['~25,020 BBY - Built', -25020],
    ['Imperial Era (before 14 BBY) - X', -14],
    ['0 BBY - X', 0],
    ['Unknown - X', null]
  ];

  it.each(cases)('parses %s -> year %s', (heading, year) => {
    expect(parseTimelineHeading(heading).year).toBe(year);
  });

  it('handles the double-separator Barma case', () => {
    const result = parseTimelineHeading('~4 ABY - 5 ABY - Barma Battle Group');
    expect(result.label).toBe('~4 ABY - 5 ABY');
    expect(result.title).toBe('Barma Battle Group');
    expect(result.year).toBe(4);
  });

  it('treats a heading with no separator as title-only', () => {
    const result = parseTimelineHeading('Hunting Shenda Mol');
    expect(result.title).toBe('Hunting Shenda Mol');
    expect(result.year).toBeNull();
    expect(result.label).toBeNull();
  });
});

describe('parseTimelineEvents', () => {
  it('returns [] for empty/missing input', () => {
    expect(parseTimelineEvents('')).toEqual([]);
    expect(parseTimelineEvents(undefined)).toEqual([]);
    expect(parseTimelineEvents(null)).toEqual([]);
  });

  it('parses headings in document order', () => {
    const html = '<h3>1 BBY - First</h3><p>a</p><h3>2 ABY - Second</h3><p>b</p>';
    const events = parseTimelineEvents(html);
    expect(events.map(e => e.title)).toEqual(['First', 'Second']);
  });
});

describe('buildCharacterEvents', () => {
  const luke = charactersData.find(c => c.title === 'Luke Skywalker');

  it('plots every parsed event, for every character', () => {
    charactersData.forEach(character => {
      const parsed = parseTimelineEvents(character.timeline);
      const { plottedCount, cards } = buildCharacterEvents(character, yearsData, jediTheme);
      expect(plottedCount).toBe(parsed.length);
      const onCards = cards.reduce((sum, card) =>
        sum + card.entries.reduce((s, entry) => s + entry.events.length, 0), 0);
      expect(onCards).toBe(parsed.length);
    });
  });

  it('only produces dots for years that exist in years.json', () => {
    const yearSet = new Set(yearsData.map(y => y.year));
    const { dots } = buildCharacterEvents(luke, yearsData, jediTheme);
    dots.forEach(dot => expect(yearSet.has(dot.year)).toBe(true));
  });

  it('lays out cards with strictly increasing, non-overlapping tops', () => {
    const { cards } = buildCharacterEvents(luke, yearsData, jediTheme);
    for (let i = 0; i < cards.length - 1; i++) {
      expect(cards[i + 1].top).toBeGreaterThan(cards[i].top);
      expect(cards[i].top + estimateCardHeight(cards[i].entries)).toBeLessThanOrEqual(cards[i + 1].top);
    }
  });

  it('groups two events in the same year into one entry', () => {
    const synthetic = {
      ...luke,
      timeline: '<h3>5 BBY - First</h3><p>a</p><h3>5 BBY - Second</h3><p>b</p>'
    };
    const { cards } = buildCharacterEvents(synthetic, yearsData, jediTheme);
    expect(cards).toHaveLength(1);
    expect(cards[0].entries).toHaveLength(1);
    expect(cards[0].entries[0].events).toHaveLength(2);
  });

  const entriesOf = (cards) => cards.flatMap(card => card.entries);

  it('clamps years before the first row to that row, keeping the real label', () => {
    const synthetic = {
      ...luke,
      timeline: '<h3>~25,020 BBY - TooEarly</h3><p>b</p><h3>300 BBY - InRange</h3><p>a</p>'
    };
    const { dots, cards, plottedCount } = buildCharacterEvents(synthetic, yearsData, jediTheme);
    expect(plottedCount).toBe(2);
    expect(dots).toHaveLength(1);
    expect(dots[0].year).toBe(yearsData[0].year);
    const [clamped, exact] = entriesOf(cards);
    expect(clamped).toMatchObject({ display: '~25,020 BBY', approximate: true });
    expect(clamped.events[0].title).toBe('TooEarly');
    expect(exact).toMatchObject({ display: '300 BBY', approximate: false });
  });

  it('places era prefixes inside the character\'s life', () => {
    const synthetic = {
      ...luke, // born 19 BBY, so the Imperial Era's -19 start fits
      timeline: '<h3>Imperial Era - A</h3><p>a</p><h3>New Republic Era - B</h3><p>b</p><h3>Clone Wars - C</h3><p>c</p>'
    };
    const entries = entriesOf(buildCharacterEvents(synthetic, yearsData, jediTheme).cards);
    const byTitle = Object.fromEntries(entries.map(e => [e.events[0].title, e]));
    expect(byTitle.A).toMatchObject({ year: -19, display: 'Imperial Era', approximate: true });
    expect(byTitle.B).toMatchObject({ year: 5, display: 'New Republic Era' });
    // The Clone Wars end at 19 BBY, Luke's birth year.
    expect(byTitle.C.year).toBe(-19);
  });

  it('puts undated and early-life events on the startYear row', () => {
    const synthetic = {
      ...luke,
      timeline: '<h3>Unknown - NoDate</h3><p>c</p><h3>Early life - Young</h3><p>d</p><h3>No separator</h3><p>e</p><h3>10 ABY - Later</h3><p>f</p>'
    };
    const { cards, plottedCount } = buildCharacterEvents(synthetic, yearsData, jediTheme);
    expect(plottedCount).toBe(4);
    const entries = entriesOf(cards);
    const undated = entries.find(e => e.display === UNDATED_LABEL);
    expect(undated.year).toBe(luke.startYear);
    expect(undated.events.map(e => e.title)).toEqual(['NoDate', 'No separator']);
    expect(entries.find(e => e.display === 'Early life').year).toBe(luke.startYear);
  });

  it('keeps card tops strictly increasing and non-overlapping for every character', () => {
    charactersData.forEach(character => {
      const { cards } = buildCharacterEvents(character, yearsData, jediTheme);
      for (let i = 0; i < cards.length - 1; i++) {
        expect(cards[i + 1].top).toBeGreaterThan(cards[i].top);
        expect(cards[i].top + estimateCardHeight(cards[i].entries)).toBeLessThanOrEqual(cards[i + 1].top);
      }
    });
  });

  it('never throws across all characters', () => {
    charactersData.forEach(character => {
      expect(() => buildCharacterEvents(character, yearsData, jediTheme)).not.toThrow();
    });
  });
});
