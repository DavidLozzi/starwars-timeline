// Shared text helpers for the build scripts. Kept dependency-free: CI only runs
// `npm ci` at the repo root, so anything imported here must be plain Node.

// A few source descriptions carry stray control characters where an apostrophe
// belongs (e.g. "Fett\u0002s"), which leak into meta tags and page copy.
export const sanitize = (text) => (text || '')
  .replace(/([A-Za-z])[\u0000-\u001f]([A-Za-z])/g, '$1’$2')
  .replace(/[\u0000-\u001f]/g, ' ');

export const stripHtml = (html) => sanitize(html)
  .replace(/<[^>]+>/g, ' ')
  .replace(/&nbsp;/g, ' ')
  .replace(/&amp;/g, '&')
  .replace(/&#39;|&rsquo;/g, '’')
  .replace(/&quot;/g, '"')
  .replace(/\s+/g, ' ')
  .trim();

// Search snippets and OG cards get cut around 160 characters; prefer ending on a
// sentence, fall back to a word boundary with an ellipsis.
export const MAX_DESC = 160;
export const truncate = (text) => {
  if (text.length <= MAX_DESC) return text;
  const window = text.slice(0, MAX_DESC + 1);
  const sentenceEnd = Math.max(window.lastIndexOf('. '), window.lastIndexOf('! '), window.lastIndexOf('? '));
  if (sentenceEnd >= 80) return window.slice(0, sentenceEnd + 1);
  const wordEnd = window.lastIndexOf(' ');
  return `${window.slice(0, wordEnd > 0 ? wordEnd : MAX_DESC).replace(/[,;:.—-]+$/, '')}…`;
};

// For values interpolated into double-quoted HTML attributes.
export const escapeAttr = (value) => String(value ?? '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;');

// For values interpolated into HTML text nodes.
export const escapeHtml = (value) => escapeAttr(value).replace(/'/g, '&#39;');
