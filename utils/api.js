const GhostContentAPI = require('@tryghost/content-api');
const { currentLocale_ghost } = require('../config');

const upperLocale = currentLocale_ghost.toUpperCase();
const url = process.env[`${upperLocale}_GHOST_API_URL`];
const key = process.env[`${upperLocale}_GHOST_CONTENT_API_KEY`];
const version = process.env[`${upperLocale}_GHOST_API_VERSION`];

const ghostAPI = process.env.DO_NOT_FETCH_FROM_GHOST
  ? null
  : new GhostContentAPI({ url, key, version });

const hashnodeHost = process.env[`${upperLocale}_HASHNODE_HOST`];

module.exports = {
  ghostAPI,
  ghostAPIURL: url,
  hashnodeHost
};
