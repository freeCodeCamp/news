import {
  getRailCount,
  getRailCourses,
  READING_MINUTES_PER_RAIL
} from './rails.js';

describe('Class Central sidebar rails:', () => {
  describe('getRailCount', () => {
    test('Always returns at least one rail', () => {
      expect(getRailCount(0)).toBe(1);
      expect(getRailCount(1)).toBe(1);
      expect(getRailCount(undefined)).toBe(1);
    });

    test('Adds a rail for every block of reading minutes', () => {
      expect(getRailCount(READING_MINUTES_PER_RAIL - 1)).toBe(1);
      expect(getRailCount(READING_MINUTES_PER_RAIL * 2)).toBe(2);
      expect(getRailCount(READING_MINUTES_PER_RAIL * 3 + 1)).toBe(3);
    });
  });

  describe('getRailCourses', () => {
    const courses = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];

    test('Cycles through the courses four at a time', () => {
      expect(getRailCourses({ courses }, READING_MINUTES_PER_RAIL * 3)).toEqual(
        [
          ['a', 'b', 'c', 'd'],
          ['e', 'f', 'g', 'a'],
          ['b', 'c', 'd', 'e']
        ]
      );
    });

    test('Shows every course in each rail when there are four or fewer', () => {
      expect(
        getRailCourses(
          { courses: ['a', 'b', 'c'] },
          READING_MINUTES_PER_RAIL * 2
        )
      ).toEqual([
        ['a', 'b', 'c'],
        ['a', 'b', 'c']
      ]);
    });

    test('Returns no rails without courses', () => {
      expect(getRailCourses({ courses: [] }, 30)).toEqual([]);
      expect(getRailCourses({}, 30)).toEqual([]);
    });

    test('Returns no rails for a post without Class Central data', () => {
      expect(getRailCourses(undefined, 30)).toEqual([]);
    });
  });
});
