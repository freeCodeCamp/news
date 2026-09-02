import { loadCache } from '../../utils/class-central/store.js';
import { config } from '../../config/index.js';

const { currentLocale_i18n, doObjectStorageKeyId } = config;

// Fetch cached Class Central course data and continue with the build
// if there's a failure
export default async () => {
  if (currentLocale_i18n !== 'english' || !doObjectStorageKeyId) return {};

  try {
    const cache = await loadCache();
    return cache.posts;
  } catch (error) {
    console.warn(
      `Class Central course cache unavailable, sponsored courses will not be shown this build: ${error.message}`
    );
    return {};
  }
};
