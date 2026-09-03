import { fetchFromHashnode } from '../utils/hashnode/fetch-from-hashnode.js';
import {
  getRelatedCoursesContent,
  hashContent
} from '../utils/class-central/content.js';
import { fetchRelatedCoursesForAll } from '../utils/class-central/api.js';
import { loadCache, saveCache } from '../utils/class-central/store.js';
import { isFresh } from '../utils/class-central/freshness.js';
import { classCentralSchemaValidator } from './schemas/class-central-schema.js';
import { annotate } from '../utils/gh-annotations.js';
import { config } from '../config/index.js';

const { currentLocale_i18n } = config;

// How often (in posts) to persist progress, so a killed run doesn't lose
// already-completed, rate-limited work
const CHECKPOINT_EVERY = 25;

// Caps how long a single run can take, and the rest is picked up next run
const MAX_POSTS_PER_RUN = 3000;

const SOURCE_FILE = 'tools/fetch-class-central.js';

const run = async () => {
  if (currentLocale_i18n !== 'english') {
    console.log(
      'Class Central related courses only fetched for the English locale. Skipping.'
    );
    return;
  }

  const posts = await fetchFromHashnode('posts');
  const cache = await loadCache();

  // Drop entries for posts that no longer exist
  const currentIds = new Set(posts.map(post => post.id));
  Object.keys(cache.posts).forEach(id => {
    if (!currentIds.has(id)) delete cache.posts[id];
  });

  const postsToFetch = posts
    .map(post => {
      const content = getRelatedCoursesContent(post);
      if (!content) return null;

      const contentHash = hashContent(content);
      const cached = cache.posts[post.id];
      if (cached && cached.contentHash === contentHash && isFresh(cached))
        return null;

      return {
        id: post.id,
        slug: post.slug,
        title: post.title,
        content,
        contentHash
      };
    })
    .filter(Boolean)
    .slice(0, MAX_POSTS_PER_RUN);

  if (!postsToFetch.length) {
    console.log(
      'Every post already has up-to-date course data. Nothing to do.'
    );
    return;
  }

  console.log(
    `Fetching Class Central data for ${postsToFetch.length} post(s) (of ${posts.length} total)...`
  );

  let succeeded = 0;
  let failed = 0;

  await fetchRelatedCoursesForAll(postsToFetch, {
    onResult: async (post, { courses, subjects }) => {
      // Note: Response stored raw - trim once the UI settles on which fields it needs
      cache.posts[post.id] = {
        contentHash: post.contentHash,
        fetchedAt: new Date().toISOString(),
        slug: post.slug,
        title: post.title,
        courses,
        subjects
      };

      succeeded++;
      if (succeeded % CHECKPOINT_EVERY === 0) {
        console.log(`Checkpointing after ${succeeded} posts...`);
        await saveCache(cache);
      }
    },
    onError: (post, error) => {
      failed++;
      annotate({
        level: 'warning',
        title: 'Class Central fetch failed for a post',
        file: SOURCE_FILE,
        message: `Post "${post.slug}" will be retried on the next run: ${error.message}`
      });
    }
  });

  const { error: validationError } = classCentralSchemaValidator(cache);
  if (validationError) {
    throw new Error(
      `Class Central cache failed schema validation, refusing to save: ${validationError.message}`
    );
  }

  await saveCache(cache);
  console.log(
    `Done. Fetched courses for ${succeeded} post(s), ${failed} failed and will be retried later.`
  );
};

await run();
