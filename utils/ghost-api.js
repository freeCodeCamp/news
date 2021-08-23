const ghostContentApi = require('@tryghost/content-api');
const ghostApiSource = process.env.GHOST_API_SOURCE;
const keys = {
  local: {
    url: process.env.LOCAL_GHOST_API_URL,
    key: process.env.LOCAL_GHOST_CONTENT_API_KEY,
    version: process.env.LOCAL_GHOST_API_VERSION
  },
  en: {
    url: process.env.GHOST_API_URL,
    key: process.env.GHOST_CONTENT_API_KEY,
    version: process.env.GHOST_API_VERSION,
  },
  zh: {
    url: process.env.ZH_GHOST_API_URL,
    key: process.env.ZH_GHOST_CONTENT_API_KEY,
    version: process.env.ZH_GHOST_API_VERSION,
  },
  es: {
    url: process.env.ES_GHOST_API_URL,
    key: process.env.ES_GHOST_CONTENT_API_KEY,
    version: process.env.ES_GHOST_API_VERSION,
  }
};

// Init Ghost API
const api = new ghostContentApi(keys[ghostApiSource]);

// For the translator / original author citation feature
// To do: Refactor this to work for any language using the keys above
const enApi = new ghostContentApi(keys['en']);

// Export API instances and target API URL for link swapping,
// fetching sitemaps, etc.
module.exports = {
  api,
  enApi,
  apiUrl: keys[ghostApiSource].url
};
