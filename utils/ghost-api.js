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

const { url, key, version } = keys[ghostApiSource];

// Init Ghost API
const api = new ghostContentApi({
  url: url,
  key: key,
  version: version,
});

// For the translator / original author citation feature
// To do: Refactor this to work for any language using the keys above
const enApi = new ghostContentApi({
  url: process.env.GHOST_API_URL,
  key: process.env.GHOST_CONTENT_API_KEY,
  version: process.env.GHOST_API_VERSION,
});

// Export API instances and target API URL for link swapping,
// fetching sitemaps, etc.
module.exports = {
  api,
  enApi,
  apiUrl: url
};
