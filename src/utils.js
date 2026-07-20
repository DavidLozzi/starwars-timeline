export const getKeyCount = (o) => Object.keys(o).length;

/**
 * Decode a character name taken from the route. React Router v5 hands back raw
 * path segments, so links from starwars.guide arrive as "Ahsoka%20Tano" and
 * would never match a character title.
 * @param {string} param Raw `:character` route param
 * @returns {string|undefined} Decoded name, or the raw value if it is malformed
 */
export const decodeCharacterParam = (param) => {
  if (!param) return undefined;
  try {
    return decodeURIComponent(param);
  } catch {
    return param;
  }
};

// Onboarding state management helpers
const ONBOARDING_STORAGE_KEY = 'starwars_timeline_onboarding_dismissed';

/**
 * Check if localStorage is available and functional
 * @returns {boolean} True if localStorage is available
 */
export const hasLocalStorage = () => {
  try {
    const test = '__localStorage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
};

/**
 * Get onboarding state from localStorage
 * @returns {Object|null} Onboarding state object or null if unavailable/invalid
 */
export const getOnboardingState = () => {
  if (!hasLocalStorage()) return null;
  try {
    const stored = localStorage.getItem(ONBOARDING_STORAGE_KEY);
    if (!stored) return null;
    const parsed = JSON.parse(stored);
    // Validate structure
    if (typeof parsed.hasSeenGuide === 'boolean') {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
};

/**
 * Set onboarding state in localStorage
 * @param {boolean} hasSeenGuide - Whether user has seen the guide
 * @param {string} dismissedDate - Optional ISO timestamp
 * @returns {boolean} True if successfully stored
 */
export const setOnboardingState = (hasSeenGuide, dismissedDate = null) => {
  if (!hasLocalStorage()) return false;
  try {
    const state = {
      hasSeenGuide,
      ...(dismissedDate && { dismissedDate })
    };
    localStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch (error) {
    console.warn('Failed to save onboarding state:', error);
    return false;
  }
};
