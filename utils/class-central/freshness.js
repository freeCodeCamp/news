// Matches Class Central's own server-side cache window, so a post is never
// stuck showing results older than what Class Central itself would return.
export const MAX_CACHE_AGE_MS = 24 * 60 * 60 * 1000;

export const isFresh = cached =>
  Date.now() - new Date(cached.fetchedAt).getTime() < MAX_CACHE_AGE_MS;
