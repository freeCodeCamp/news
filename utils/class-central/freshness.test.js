import { isFresh, MAX_CACHE_AGE_MS } from './freshness.js';

describe('Class Central freshness helper:', () => {
  test('Returns true for an entry fetched moments ago', () => {
    expect(isFresh({ fetchedAt: new Date().toISOString() })).toBe(true);
  });

  test('Returns true for an entry just under the max cache age', () => {
    const fetchedAt = new Date(Date.now() - MAX_CACHE_AGE_MS + 1000);

    expect(isFresh({ fetchedAt: fetchedAt.toISOString() })).toBe(true);
  });

  test('Returns false for an entry older than the max cache age', () => {
    const fetchedAt = new Date(Date.now() - MAX_CACHE_AGE_MS - 1000);

    expect(isFresh({ fetchedAt: fetchedAt.toISOString() })).toBe(false);
  });
});
