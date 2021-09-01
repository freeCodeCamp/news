const ghostContentApi = require('@tryghost/content-api');

const fetchKeys = (locale) => {
  const upperLocale = locale ?
    locale.toUpperCase() :
    process.env.GHOST_API_SOURCE.toUpperCase();

  return {
    url: process.env[`${upperLocale}_GHOST_API_URL`],
    key: process.env[`${upperLocale}_GHOST_CONTENT_API_KEY`],
    version: process.env[`${upperLocale}_GHOST_API_VERSION`]
  }
}

const { url, key, version } = fetchKeys();

// Init Ghost API
const api = new ghostContentApi({ url, key, version });

// For the translator / original author citation feature
// To do: Refactor this to work for any language using the keys above
const enApi = new ghostContentApi({ ...fetchKeys('en') });

// Export API instances and target API URL for link swapping,
// fetching sitemaps, etc.
module.exports = {
  api,
  enApi,
  apiUrl: url
};
