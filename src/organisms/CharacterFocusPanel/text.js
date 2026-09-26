// Pure helpers for CharacterFocusPanel -- no React, no DOM APIs beyond string
// methods, so they can be unit tested directly (see events.js for the sibling
// CharacterEvents module's own pure-function convention).

// Strips HTML, collapses whitespace, and truncates to ~max characters without
// cutting mid-word. Falls back to a hard cut only when a single "word" is
// itself longer than max (no space to break on).
export const truncateDescription = (html, max = 100) => {
  if (!html) return '';
  const text = html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
  if (text.length <= max) return text;

  const slice = text.slice(0, max);
  const lastSpace = slice.lastIndexOf(' ');
  const cut = (lastSpace > 0 ? slice.slice(0, lastSpace) : slice).replace(/[,;:.\-–—]+$/, '');
  return `${cut}…`;
};

// Mirrors CharacterDetailPill's image-selection rules: an imageYears entry
// covering `year` wins, then the latest imageYears entry if `year` is past
// it, then the character's default imageUrl, then the generic fallback.
// Copies character.imageYears before sorting so callers never see their
// array reordered as a side effect (CharacterDetailPill's own version sorts
// in place).
export const getCharacterImageForYear = (character, year) => {
  const fallback = character?.imageUrl || '/images/starwars.jpg';
  const imageYears = character?.imageYears ? [...character.imageYears] : null;
  const hasYear = year !== undefined && year !== null;

  if (!imageYears || !imageYears.length || !hasYear) return fallback;

  const covering = imageYears.find((y) => y.startYear <= year && y.endYear >= year);
  if (covering) return covering.imageUrl;

  const latest = [...imageYears].sort((a, b) => (a.endYear < b.endYear ? 1 : -1))[0];
  if (latest && latest.endYear <= year) return latest.imageUrl;

  return fallback;
};
