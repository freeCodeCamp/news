const ghostContentAPI = require("@tryghost/content-api");
const { eleventyEnv, currentLocale_ghost } = require("../../config");

const fetchKeys = (locale) => {
  const upperLocale = locale.toUpperCase();

  return {
    url: process.env[`${upperLocale}_GHOST_API_URL`],
    key: process.env[`${upperLocale}_GHOST_CONTENT_API_KEY`],
    version: process.env[`${upperLocale}_GHOST_API_VERSION`],
  };
};

const { url, key, version } = fetchKeys(currentLocale_ghost);

const sourceApi =
  eleventyEnv === "ci" ? {} : new ghostContentAPI({ url, key, version });

// Export source API instance and target API URL for link swapping,
// fetching sitemaps, etc.
module.exports = {
  sourceApi,
  sourceApiUrl: eleventyEnv === "ci" ? "" : url,
  fetchKeys,
};
