const GhostContentAPI = require('@tryghost/content-api');
const { currentLocale_ghost, locales, getSiteURL } = require('../../config');

// Create an object of Ghost API instances, API URLs, and final siteURLs for
// each locale
const allGhostAPIInstances = ['local', ...locales].reduce((obj, currLocale) => {
  const upperLocale = currLocale.toUpperCase();

  try {
    const url = process.env[`${upperLocale}_GHOST_API_URL`];
    const key = process.env[`${upperLocale}_GHOST_CONTENT_API_KEY`];
    const version = process.env[`${upperLocale}_GHOST_API_VERSION`];

    if (url && key && version) {
      obj[currLocale] = {
        api: new GhostContentAPI({ url, key, version }),
        ghostAPIURL: url,
        siteURL: getSiteURL(currLocale, true)
      };
    }
  } catch (err) {
    console.warn(`
      ---------------------------------------------------------------
      Warning: Unable to initialize the Content API for ${currLocale}
      ---------------------------------------------------------------
      Please double check that the correct keys are included in the
      .env file.
      You can ignore this warning if this instance of Ghost is set 
      to private, if you don't need the original / author translator
      feature for this locale, or if a test suite is running.
      ---------------------------------------------------------------
    `);
  }

  return obj;
}, {});

const { api, ghostAPIURL } = allGhostAPIInstances[currentLocale_ghost];

// Export the source API instance and source API URL to strip domains for
// relative links for the current site build and fetch the current sitemap.
// Also export all Ghost API instances for the original author / translator
// feature
module.exports = {
  sourceAPI: api,
  sourceAPIURL: ghostAPIURL,
  allGhostAPIInstances
};
