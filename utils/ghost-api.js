const ghostContentAPI = require('@tryghost/content-api');
const ghostVersion = process.env.GHOST_API_VERSION ?? 'v3';

// Init Ghost API
const api = new ghostContentAPI({
  url: process.env.GHOST_API_URL,
  key: process.env.GHOST_CONTENT_API_KEY,
  version: ghostVersion,
});

const enApi = new ghostContentAPI({
  url: process.env.EN_GHOST_API_URL,
  key: process.env.EN_GHOST_CONTENT_API_KEY,
  version: ghostVersion,
});

module.exports = {
  api,
  enApi,
};
