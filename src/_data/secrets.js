import { config } from '../../config/index.js';

const {
  algoliaAppId,
  algoliaAPIKey,
  algoliaIndex,
  adsEnabled,
  eleventyEnv,
  googleAdsenseDataAdClient,
  googleAdsenseDataAdSlot,
  postsPerPage
} = config;

export default {
  algoliaAppId,
  algoliaAPIKey,
  algoliaIndex,
  adsEnabled,
  eleventyEnv,
  googleAdsenseDataAdClient,
  googleAdsenseDataAdSlot,
  postsPerPage
};
