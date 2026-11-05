import { jest } from '@jest/globals';

import { resolvePosts } from './resolve.js';

describe('Class Central cache resolution:', () => {
  const courses = {
    1: {
      id: 1,
      name: 'Course One',
      instructors: 'Instructor A • 10,000+ Students',
      effort: '1 day 6 hours 36 minutes',
      rating: { provider: { average: 4.5, count: 8495 } }
    },
    2: { id: 2, name: 'Course Two' }
  };
  const subjects = {
    music: { slug: 'music', name: 'Music', url: 'https://example.com/music' }
  };
  const resolve = entry =>
    resolvePosts({ posts: { post: entry }, courses, subjects }).post;

  let warnSpy;

  beforeEach(() => {
    warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    warnSpy.mockRestore();
  });

  test('Resolves courses and subjects with display-ready fields', () => {
    const post = resolve({
      slug: 'a-post',
      courseIds: [1, 2],
      subjectSlugs: ['music']
    });

    expect(post.slug).toBe('a-post');
    expect(post.courses.map(({ id }) => id)).toEqual([1, 2]);
    expect(post.courses[0]).toMatchObject({
      effortShort: '1d 6h',
      instructorName: 'Instructor A',
      ratingCount: '8,495'
    });
    expect(post.subjects).toEqual([subjects.music]);
    expect(warnSpy).not.toHaveBeenCalled();
  });

  test('Skips unknown courses and keeps the rest', () => {
    const post = resolve({ courseIds: [1, 99, 2], subjectSlugs: [] });

    expect(post.courses.map(({ id }) => id)).toEqual([1, 2]);
  });

  test('Skips unknown subjects', () => {
    const post = resolve({ courseIds: [], subjectSlugs: ['missing', 'music'] });

    expect(post.subjects).toEqual([subjects.music]);
  });

  test('Warns once per build with every unknown course', () => {
    resolvePosts({
      posts: {
        first: { courseIds: [99, 1], subjectSlugs: [] },
        second: { courseIds: [98, 99], subjectSlugs: [] }
      },
      courses,
      subjects
    });

    expect(warnSpy).toHaveBeenCalledTimes(1);
    expect(warnSpy.mock.calls[0][0]).toContain('99, 98');
  });
});
