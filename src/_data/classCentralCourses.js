import { join } from 'path';

import { loadCache } from '../../utils/class-central/store.js';
import {
  abbreviateEffort,
  cleanInstructor,
  formatCount
} from '../../utils/class-central/format.js';
import { loadJSON } from '../../utils/load-json.js';
import { config } from '../../config/index.js';

const { currentLocale_i18n, eleventyEnv, doObjectStorageKeyId } = config;

// Add the display-ready fields the sponsored course ad template needs, without
// touching the raw cache shape.
const withDisplayFields = posts =>
  Object.fromEntries(
    Object.entries(posts).map(([id, entry]) => [
      id,
      {
        ...entry,
        courses: entry.courses.map(course => ({
          ...course,
          effortShort: abbreviateEffort(course.effort),
          instructorName: cleanInstructor(course.instructors),
          ratingCount: formatCount(course.rating?.provider?.count)
        }))
      }
    ])
  );

// Fetch cached Class Central course data and continue with the build
// if there's a failure
export default async () => {
  if (currentLocale_i18n !== 'english') return {};

  // Mirrors the Hashnode mock swap, so CI builds get sponsored courses too
  if (eleventyEnv === 'ci') {
    const cache = loadJSON(
      join(
        import.meta.dirname,
        '../../cypress/fixtures/mock-class-central-courses.json'
      )
    );
    return withDisplayFields(cache.posts);
  }

  if (!doObjectStorageKeyId) return {};

  try {
    const cache = await loadCache();
    return withDisplayFields(cache.posts);
  } catch (error) {
    console.warn(
      `Class Central course cache unavailable, sponsored courses will not be shown this build: ${error.message}`
    );
    return {};
  }
};
