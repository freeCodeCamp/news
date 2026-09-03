import { abbreviateEffort, cleanInstructor, formatCount } from './format.js';

describe('Class Central display helpers:', () => {
  describe('abbreviateEffort', () => {
    test('Abbreviates a multi-unit total to its two largest units', () => {
      expect(abbreviateEffort('1 day 6 hours 36 minutes')).toBe('1d 6h');
      expect(abbreviateEffort('16 hours 1 minute')).toBe('16h 1m');
    });

    test('Handles a single unit', () => {
      expect(abbreviateEffort('13 hours')).toBe('13h');
      expect(abbreviateEffort('48 minutes')).toBe('48m');
    });

    test('Shows only the week count for a weekly cadence', () => {
      expect(abbreviateEffort('7 weeks, 1 hour a week')).toBe('7w');
      expect(abbreviateEffort('6 weeks, 2-3 hours/week')).toBe('6w');
    });

    test('Returns an empty string when there is nothing to parse', () => {
      expect(abbreviateEffort('')).toBe('');
      expect(abbreviateEffort(undefined)).toBe('');
      expect(abbreviateEffort('Self-paced')).toBe('');
    });
  });

  describe('cleanInstructor', () => {
    test('Drops the marketing tail after a separator', () => {
      expect(cleanInstructor('Scott Duffy  • 1,500,000+ Students')).toBe(
        'Scott Duffy'
      );
      expect(
        cleanInstructor('Ankit Mistry : 266,000+ Students and Ajay Gadhave')
      ).toBe('Ankit Mistry');
      expect(
        cleanInstructor('Edwin Diaz | 900,000+ Students and Coding Faculty')
      ).toBe('Edwin Diaz');
    });

    test('Trims a plain name and leaves multi-author strings alone', () => {
      expect(cleanInstructor(' Microsoft')).toBe('Microsoft');
      expect(cleanInstructor('Graham Baker, and Andrew Murray')).toBe(
        'Graham Baker, and Andrew Murray'
      );
    });

    test('Returns an empty string for missing input', () => {
      expect(cleanInstructor('')).toBe('');
      expect(cleanInstructor(undefined)).toBe('');
    });
  });

  describe('formatCount', () => {
    test('Adds thousands separators', () => {
      expect(formatCount(8495)).toBe('8,495');
      expect(formatCount(6)).toBe('6');
    });

    test('Returns an empty string when the count is missing', () => {
      expect(formatCount(null)).toBe('');
      expect(formatCount(undefined)).toBe('');
    });
  });
});
