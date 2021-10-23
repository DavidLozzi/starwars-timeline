
export const ACTIONS = {
  OPEN_CHARACTER: 'open character',
  OPEN_MENU: 'open menu',
  OPEN_FILTER: 'open filter',
  APPLY_FILTER: 'apply filter',
  CLEAR_FILTER: 'clear filter',
  MENU_ITEM: 'menu item'
};

export default {
  event: async (action, event_category, event_label) => {
    gtag('event', action, { event_category, event_label });
  }
};