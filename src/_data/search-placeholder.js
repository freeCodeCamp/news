const {
  algoliaAppId,
  algoliaAPIKey,
  algoliaIndex,
  currentLocale_i18nISOCode,
  eleventyEnv
} = require('../../config');
const algoliasearch = require('algoliasearch/lite');

const roundDownToNearestHundred = num => Math.floor(num / 100) * 100;
const convertToLocalizedString = (num, ISOCode) => num.toLocaleString(ISOCode); // Uses commas or decimals depending on the locale

module.exports = async () => {
  let roundedTotalHits;

  if (eleventyEnv === 'ci') {
    const mockHits = require('../../cypress/fixtures/mock-search-hits.json');

    roundedTotalHits = roundDownToNearestHundred(mockHits.length);
  } else {
    const client = algoliasearch(algoliaAppId, algoliaAPIKey);
    const index = client.initIndex(algoliaIndex);

    const res = await index.search('');
    roundedTotalHits = roundDownToNearestHundred(res?.nbHits);
  }

  return {
    roundedTotalHits,
    roundedTotalHitsLocalizedString: convertToLocalizedString(
      roundedTotalHits,
      currentLocale_i18nISOCode
    )
  };
};
