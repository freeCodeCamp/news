import algoliasearch from 'algoliasearch/lite.js';
import { join } from 'path';

import { loadJSON } from './load-json.js';
import { config } from '../config/index.js';

const { algoliaAppId, algoliaAPIKey, algoliaIndex, eleventyEnv } = config;
// Load mock search hits for testing in CI
const mockHits = loadJSON(
  join(import.meta.dirname, '../cypress/fixtures/mock-search-hits.json')
);

export const roundDownToNearestHundred = num => Math.floor(num / 100) * 100;

export const convertToLocalizedString = (num, ISOCode) =>
  num.toLocaleString(ISOCode); // Use commas or decimals depending on the locale

export const getRoundedTotalRecords = async () => {
  let totalRecords = 0;

  try {
    if (eleventyEnv === 'ci') {
      totalRecords = mockHits.length;
    } else {
      const client = algoliasearch(algoliaAppId, algoliaAPIKey);
      const index = client.initIndex(algoliaIndex);
      const res = await index.search('');

      totalRecords = res?.nbHits;
    }
  } catch (_err) {
    process.env['FCC_DISABLE_WARNING'] === 'false' &&
      console.warn(`
      ----------------------------------------------------------
      Warning: Could not get the total number of Algolia records
      ----------------------------------------------------------
      Make sure that Algolia keys and index are set up correctly,
      or that the mock search hits are available if running in CI
      mode.

      Falling back to the default search placeholder text.
      ----------------------------------------------------------
  `);
  }

  return roundDownToNearestHundred(totalRecords);
};
