import { formatYear } from './yearFormat.mjs';

const starwarsYears = {
  negativeSuffix: 'BBY',
  positiveSuffix: 'ABY',
  zeroIsNegative: true,
  absolute: true,
  unknownLabel: 'unknown',
};

const marvelYears = {
  negativeSuffix: '',
  positiveSuffix: '',
  zeroIsNegative: false,
  absolute: false,
  unknownLabel: 'unknown',
};

describe('formatYear', () => {
  describe('Star Wars config (BBY/ABY)', () => {
    it('formats a BBY year', () => {
      expect(formatYear(-300, starwarsYears)).toBe('300 BBY');
    });

    it('treats 0 as BBY, matching src/data/years.json', () => {
      expect(formatYear(0, starwarsYears)).toBe('0 BBY');
    });

    it('formats an ABY year', () => {
      expect(formatYear(75, starwarsYears)).toBe('75 ABY');
    });

    it('returns the unknown label for null', () => {
      expect(formatYear(null, starwarsYears)).toBe('unknown');
    });

    it('returns the unknown label for undefined', () => {
      expect(formatYear(undefined, starwarsYears)).toBe('unknown');
    });
  });

  describe('Marvel config (plain calendar years)', () => {
    it('returns a negative year as-is', () => {
      expect(formatYear(-300, marvelYears)).toBe('-300');
    });

    it('returns 0 as-is (not treated as negative)', () => {
      expect(formatYear(0, marvelYears)).toBe('0');
    });

    it('returns a positive year as-is', () => {
      expect(formatYear(75, marvelYears)).toBe('75');
    });

    it('returns the unknown label for null', () => {
      expect(formatYear(null, marvelYears)).toBe('unknown');
    });
  });
});
