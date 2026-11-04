import {
  getBannerCourses,
  getRailCount,
  getRailCourses,
  getSidebarAdCount,
  getSidebarSegments,
  READING_MINUTES_PER_RAIL
} from './sidebar.js';

describe('Class Central sidebar:', () => {
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

  describe('getSidebarAdCount', () => {
    test('Includes two ads for posts without a reading time', () => {
      expect(getSidebarAdCount(0)).toBe(2);
      expect(getSidebarAdCount(undefined)).toBe(2);
    });

    test('Adds one ad per two minutes for short posts', () => {
      expect(getSidebarAdCount(1)).toBe(2);
      expect(getSidebarAdCount(3)).toBe(3);
      expect(getSidebarAdCount(4)).toBe(4);
    });

    test('Adds one ad per minute for longer posts', () => {
      expect(getSidebarAdCount(5)).toBe(7);
      expect(getSidebarAdCount(12)).toBe(14);
    });
  });

  describe('getSidebarSegments', () => {
    const ccData = { courses: ['a', 'b', 'c', 'd', 'e'] };
    const sumAds = segments =>
      segments.reduce((total, { adCount }) => total + adCount, 0);

    test('Puts every ad in one segment without Class Central data', () => {
      expect(getSidebarSegments(undefined, 12)).toEqual([
        { courses: undefined, adCount: 14 }
      ]);
    });

    test('Swaps one ad for each rail', () => {
      const segments = getSidebarSegments(ccData, 12);

      expect(segments).toHaveLength(2);
      expect(sumAds(segments)).toBe(getSidebarAdCount(12) - 2);
      segments.forEach(({ courses }) => expect(courses).toHaveLength(4));
    });

    test('Gives extra ads to the earliest segments', () => {
      // 17 ads - 3 rails = 14 ads across 3 segments
      expect(
        getSidebarSegments(ccData, 15).map(({ adCount }) => adCount)
      ).toEqual([5, 5, 4]);
    });
  });

  describe('getBannerCourses', () => {
    test('Shows up to four courses', () => {
      expect(getBannerCourses({ courses: ['a', 'b', 'c', 'd', 'e'] })).toEqual([
        'a',
        'b',
        'c',
        'd'
      ]);
      expect(getBannerCourses({ courses: ['a'] })).toEqual(['a']);
    });

    test('Returns no courses without Class Central data', () => {
      expect(getBannerCourses(undefined)).toEqual([]);
      expect(getBannerCourses({})).toEqual([]);
    });
  });
});
