
export const ACTIONS = {
  OPEN_CHARACTER: 'open character',
  GO_TO_EVENT: 'go to char event',
  OPEN_MENU: 'open menu',
  OPEN_FILTER: 'open filter',
  OPEN_HOWTO: 'open howto',
  OPEN_HELP: 'open help',
  APPLY_FILTER: 'apply filter',
  CLEAR_FILTER: 'clear filter',
  MENU_ITEM: 'menu item',
  THEME: 'switch theme',
  OPEN_NEWS: 'open news',
  NEWS_ITEM: 'news item',
  CHARACTER_SEE_MORE: 'character see more'
};

export default {
  event: async (action, event_category, event_label) => {
    if (typeof gtag !== 'function') return;
    try {
      gtag('event', action, { event_category, event_label });
    } catch {
      // blocked scripts / privacy tools — do not break the app
    }
  },
  // Shared brand event (starwars-guide/marketing/analytics.md): fired alongside
  // the app's own event on a cross-sell or outbound click, so every app reports
  // the same name to the brand property. content_type: 'credit', 'hub_link',
  // 'wookieepedia'.
  selectContent: (content_type) => {
    if (typeof gtag !== 'function') return;
    try {
      gtag('event', 'select_content', { content_type });
    } catch {
      // blocked scripts / privacy tools — do not break the app
    }
  }
};