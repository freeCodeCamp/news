const algoliasearch = require('algoliasearch/lite');
const {
  algoliaAppId,
  algoliaAPIKey,
  algoliaIndex,
  eleventyEnv
} = require('../config');

const roundDownToNearestHundred = num => Math.floor(num / 100) * 100;
const convertToLocalizedString = (num, ISOCode) => num.toLocaleString(ISOCode); // Use commas or decimals depending on the locale

const getRoundedTotalRecords = async () => {
  let totalRecords = 0;

  try {
    if (eleventyEnv === 'ci') {
      const mockHits = require('../cypress/fixtures/mock-search-hits.json');

      totalRecords = mockHits.length;
    } else {
      const client = algoliasearch(algoliaAppId, algoliaAPIKey);
      const index = client.initIndex(algoliaIndex);
      const res = await index.search('');

      totalRecords = res?.nbHits;
    }
  } catch (err) {
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

module.exports = {
  roundDownToNearestHundred,
  convertToLocalizedString,
  getRoundedTotalRecords
};
