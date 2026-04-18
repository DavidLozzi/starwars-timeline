import { hasLocalStorage, getOnboardingState, setOnboardingState } from './utils';

describe('Onboarding localStorage helpers', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  describe('hasLocalStorage', () => {
    it('should return true when localStorage is available', () => {
      expect(hasLocalStorage()).toBe(true);
    });

    it('should handle localStorage errors gracefully', () => {
      // Mock localStorage to throw error
      const originalSetItem = Storage.prototype.setItem;
      Storage.prototype.setItem = jest.fn(() => {
        throw new Error('QuotaExceededError');
      });

      const result = hasLocalStorage();
      expect(result).toBe(false);

      // Restore
      Storage.prototype.setItem = originalSetItem;
    });
  });

  describe('getOnboardingState', () => {
    it('should return null when localStorage is unavailable', () => {
      // Mock localStorage to be unavailable
      const originalGetItem = Storage.prototype.getItem;
      Storage.prototype.getItem = jest.fn(() => {
        throw new Error('localStorage unavailable');
      });

      const result = getOnboardingState();
      expect(result).toBeNull();

      Storage.prototype.getItem = originalGetItem;
    });

    it('should return null when no state is stored', () => {
      const result = getOnboardingState();
      expect(result).toBeNull();
    });

    it('should return parsed state when valid state exists', () => {
      const state = { hasSeenGuide: true, dismissedDate: '2025-01-27T10:30:00Z' };
      localStorage.setItem('starwars_timeline_onboarding_dismissed', JSON.stringify(state));

      const result = getOnboardingState();
      expect(result).toEqual(state);
    });

    it('should return null when stored data is invalid', () => {
      localStorage.setItem('starwars_timeline_onboarding_dismissed', 'invalid json');

      const result = getOnboardingState();
      expect(result).toBeNull();
    });

    it('should return null when hasSeenGuide is not boolean', () => {
      const state = { hasSeenGuide: 'true' };
      localStorage.setItem('starwars_timeline_onboarding_dismissed', JSON.stringify(state));

      const result = getOnboardingState();
      expect(result).toBeNull();
    });
  });

  describe('setOnboardingState', () => {
    it('should return false when localStorage is unavailable', () => {
      // Mock localStorage to throw error
      const originalSetItem = Storage.prototype.setItem;
      Storage.prototype.setItem = jest.fn(() => {
        throw new Error('QuotaExceededError');
      });

      const result = setOnboardingState(true);
      expect(result).toBe(false);

      Storage.prototype.setItem = originalSetItem;
    });

    it('should store state successfully', () => {
      const result = setOnboardingState(true, '2025-01-27T10:30:00Z');
      expect(result).toBe(true);

      const stored = JSON.parse(localStorage.getItem('starwars_timeline_onboarding_dismissed'));
      expect(stored.hasSeenGuide).toBe(true);
      expect(stored.dismissedDate).toBe('2025-01-27T10:30:00Z');
    });

    it('should store state without dismissedDate when not provided', () => {
      const result = setOnboardingState(false);
      expect(result).toBe(true);

      const stored = JSON.parse(localStorage.getItem('starwars_timeline_onboarding_dismissed'));
      expect(stored.hasSeenGuide).toBe(false);
      expect(stored.dismissedDate).toBeUndefined();
    });
  });
});
