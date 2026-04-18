
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
  THEME: 'switch theme'
};

export default {
  event: async (action, event_category, event_label) => {
    if (typeof gtag !== 'function') return;
    try {
      gtag('event', action, { event_category, event_label });
    } catch {
      // blocked scripts / privacy tools — do not break the app
    }
  }
};