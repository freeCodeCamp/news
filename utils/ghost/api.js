const ghostContentApi = require('@tryghost/content-api');

const { currentLocale_ghost } = require('../../config');

const fetchKeys = (ghostInstance) => {
  const upperGhostInstance = ghostInstance
    ? ghostInstance.toUpperCase()
    : currentLocale_ghost.toUpperCase();

  return {
    url: process.env[`${upperGhostInstance}_GHOST_API_URL`],
    key: process.env[`${upperGhostInstance}_GHOST_CONTENT_API_KEY`],
    version: process.env[`${upperGhostInstance}_GHOST_API_VERSION`]
  };
};

const { url, key, version } = fetchKeys();

// Init Ghost APIs
const sourceApi = new ghostContentApi({ url, key, version });
const englishApi = new ghostContentApi({ ...fetchKeys('english') });
const espanolApi = new ghostContentApi({ ...fetchKeys('espanol') });
const chineseApi = new ghostContentApi({ ...fetchKeys('chinese') });
const portugueseApi = new ghostContentApi({ ...fetchKeys('portuguese') });
const italianApi = new ghostContentApi({ ...fetchKeys('italian') });

// Export API instances and target API URL for link swapping,
// fetching sitemaps, etc.
module.exports = {
  sourceApi,
  sourceApiUrl: url,
  englishApi,
  espanolApi,
  chineseApi,
  portugueseApi,
  italianApi
};
