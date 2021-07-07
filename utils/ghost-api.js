const ghostContentAPI = require("@tryghost/content-api");

// Init Ghost API
const api = new ghostContentAPI({
  url: process.env.GHOST_API_URL,
  key: process.env.GHOST_CONTENT_API_KEY,
  version: "v3"
});

const enApi = new ghostContentAPI({
  url: process.env.EN_GHOST_API_URL,
  key: process.env.EN_GHOST_CONTENT_API_KEY,
  version: "v3"
});

module.exports = {
  api,
  enApi
};
