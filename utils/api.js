const GhostContentAPI = require('@tryghost/content-api');
const { currentLocale_ghost } = require('../config');

const upperLocale = currentLocale_ghost.toUpperCase();
const url = process.env[`${upperLocale}_GHOST_API_URL`];
const key = process.env[`${upperLocale}_GHOST_CONTENT_API_KEY`];
const version = process.env[`${upperLocale}_GHOST_API_VERSION`];

const ghostAPI = new GhostContentAPI({ url, key, version });

const hashnodeHost = process.env.ENGLISH_HASHNODE_HOST;

module.exports = {
  ghostAPI,
  ghostAPIURL: url,
  hashnodeHost
};
