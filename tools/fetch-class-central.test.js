import { jest } from '@jest/globals';
import { readFileSync } from 'fs';

// The same posts the Class Central cache fixture was built from
const MOCK_POST_IDS = [
  '66e1f8b2fd5bd0f4a063f328', // learn-music-production-for-beginners
  '66e093d482502b33f0f6b7ce', // pass-the-azure-ai-engineer-associate-certification-ai-102
  '66d4608b230dff016690584b', // what-is-recursion
  '66db21dc4fe490d5a33e959d' // surviving-40-years-in-tech-jack-herrington-podcast-140
];

const RECURSION_POST_ID = '66d4608b230dff016690584b';

const hashnodeFixture = JSON.parse(
  readFileSync(
    new URL('../cypress/fixtures/mock-hashnode-posts.json', import.meta.url)
  )
);

const mockPosts = hashnodeFixture.publication.posts.edges
  .map(edge => edge.node)
  .filter(node => MOCK_POST_IDS.includes(node.id));

const coursesFor = post => ({
  courses: [{ id: 1, name: `Course for ${post.slug}`, slug: `c-${post.slug}` }],
  subjects: [{ name: 'Subject', slug: 'subject' }]
});

const yieldSuccessForAll = async function* (posts) {
  for (const post of posts) yield { post, courseData: coursesFor(post) };
};

const fetchFromHashnode = jest.fn();
const fetchRelatedCoursesForPosts = jest.fn();
const loadCache = jest.fn();
const saveCache = jest.fn();
const annotate = jest.fn();

jest.unstable_mockModule('../utils/hashnode/fetch-from-hashnode.js', () => ({
  fetchFromHashnode
}));
jest.unstable_mockModule('../utils/class-central/api.js', () => ({
  fetchRelatedCoursesForPosts
}));
jest.unstable_mockModule('../utils/class-central/store.js', () => ({
  loadCache,
  saveCache
}));
jest.unstable_mockModule('../utils/gh-annotations.js', () => ({ annotate }));

const { run } = await import('./fetch-class-central.js');

// In-memory stand-in for the object-storage cache
let stored;

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(console, 'log').mockImplementation(() => {});
  stored = { posts: {} };

  fetchFromHashnode.mockResolvedValue(mockPosts);
  loadCache.mockImplementation(async () => structuredClone(stored));
  saveCache.mockImplementation(async cache => {
    stored = structuredClone(cache);
  });
  fetchRelatedCoursesForPosts.mockImplementation(yieldSuccessForAll);
});

afterEach(() => jest.restoreAllMocks());

describe('fetch-class-central run():', () => {
  test('fetches courses for every mock post and saves them on a cold cache', async () => {
    await run();

    expect(fetchRelatedCoursesForPosts).toHaveBeenCalledTimes(1);
    const [postsToFetch] = fetchRelatedCoursesForPosts.mock.calls[0];
    expect(postsToFetch.map(post => post.id).sort()).toEqual(
      [...MOCK_POST_IDS].sort()
    );

    expect(saveCache).toHaveBeenCalled();
    expect(Object.keys(stored.posts).sort()).toEqual([...MOCK_POST_IDS].sort());

    const entry = stored.posts[RECURSION_POST_ID];
    expect(entry).toMatchObject({
      slug: 'what-is-recursion',
      title: 'How Does Recursion Work? Explained with Code Examples',
      courses: [
        expect.objectContaining({
          name: expect.stringContaining('what-is-recursion')
        })
      ]
    });
    expect(typeof entry.contentHash).toBe('string');
    expect(Number.isNaN(Date.parse(entry.fetchedAt))).toBe(false);
  });

  test('does nothing on a warm cache with fresh, unchanged entries', async () => {
    await run();
    fetchRelatedCoursesForPosts.mockClear();
    saveCache.mockClear();

    await run();

    expect(fetchRelatedCoursesForPosts).not.toHaveBeenCalled();
    expect(saveCache).not.toHaveBeenCalled();
  });

  test('refetches every post once cached entries age past the freshness window', async () => {
    await run();

    const dayAndAnHourAgo = new Date(
      Date.now() - 25 * 60 * 60 * 1000
    ).toISOString();
    for (const id of Object.keys(stored.posts)) {
      stored.posts[id].fetchedAt = dayAndAnHourAgo;
    }
    fetchRelatedCoursesForPosts.mockClear();

    await run();

    expect(fetchRelatedCoursesForPosts).toHaveBeenCalledTimes(1);
    expect(fetchRelatedCoursesForPosts.mock.calls[0][0]).toHaveLength(
      MOCK_POST_IDS.length
    );
  });

  test('refetches only the post whose content changed', async () => {
    await run();
    fetchRelatedCoursesForPosts.mockClear();

    const editedPosts = structuredClone(mockPosts);
    editedPosts.find(post => post.id === RECURSION_POST_ID).content.html +=
      '<p>A new paragraph that changes the content hash.</p>';
    fetchFromHashnode.mockResolvedValue(editedPosts);

    await run();

    expect(fetchRelatedCoursesForPosts).toHaveBeenCalledTimes(1);
    const [postsToFetch] = fetchRelatedCoursesForPosts.mock.calls[0];
    expect(postsToFetch).toHaveLength(1);
    expect(postsToFetch[0].id).toBe(RECURSION_POST_ID);
  });

  test('drops cache entries for posts that no longer exist', async () => {
    stored.posts.deadbeefdeadbeefdeadbeef = {
      contentHash: 'stale',
      fetchedAt: new Date().toISOString(),
      slug: 'deleted-post',
      title: 'Deleted post',
      courses: [],
      subjects: []
    };

    await run();

    expect(stored.posts.deadbeefdeadbeefdeadbeef).toBeUndefined();
    expect(Object.keys(stored.posts).sort()).toEqual([...MOCK_POST_IDS].sort());
  });

  test('annotates and skips a post whose fetch fails, still saving the rest', async () => {
    fetchRelatedCoursesForPosts.mockImplementation(async function* (posts) {
      for (const post of posts) {
        yield post.id === RECURSION_POST_ID
          ? {
              post,
              error: new Error('Class Central /related responded with 500')
            }
          : { post, courseData: coursesFor(post) };
      }
    });

    await run();

    expect(annotate).toHaveBeenCalledWith(
      expect.objectContaining({
        level: 'warning',
        message: expect.stringContaining('what-is-recursion')
      })
    );
    expect(stored.posts[RECURSION_POST_ID]).toBeUndefined();
    expect(Object.keys(stored.posts)).toHaveLength(MOCK_POST_IDS.length - 1);
  });
});
