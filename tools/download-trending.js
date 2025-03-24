const { readFileSync, writeFileSync } = require('fs');
const path = require('path');
// const fetch = require('node-fetch');
const fetch = (...args) =>
  import('node-fetch').then(({ default: fetch }) => fetch(...args));
const yaml = require('js-yaml');

const { currentLocale_i18n } = require('../config');
const trendingSchemaValidator = require('./schemas/trending-schema');

const download = async clientLocale => {
  const trendingURL = `https://cdn.freecodecamp.org/universal/trending/${clientLocale}.yaml`;
  const trendingLocation = path.resolve(
    __dirname,
    `../config/i18n/locales/${clientLocale}/trending.json`
  );

  const loadLocalTrendingJSON = () => {
    const localTrendingJSON = readFileSync(trendingLocation, 'utf8');

    if (!localTrendingJSON) {
      throw new Error(
        `
        ----------------------------------------------------
        Error: ${trendingLocation} is missing.
        ----------------------------------------------------
        `
      );
    }

    return localTrendingJSON;
  };

  const loadTrendingJSON = async () => {
    try {
      const res = await fetch(trendingURL);

      if (!res.ok) {
        throw new Error(
          `
          ----------------------------------------------------
          Error: The CDN is missing the trending YAML file.
          ----------------------------------------------------
          Unable to fetch the ${clientLocale} footer: ${res.statusText}
          `
        );
      }

      const data = await res.text();
      const trendingJSON = JSON.stringify(yaml.load(data));

      return trendingJSON;
    } catch (err) {
      if (process.env.FREECODECAMP_NODE_ENV === 'production') {
        throw new Error(err.message);
      }

      return loadLocalTrendingJSON();
    }
  };

  const trendingJSON = await loadTrendingJSON();

  writeFileSync(trendingLocation, trendingJSON);

  const trendingObject = JSON.parse(trendingJSON);
  const validationError = trendingSchemaValidator(trendingObject).error || null;

  if (validationError) {
    throw new Error(
      `
    ----------------------------------------------------
    Error: The trending JSON is invalid.
    ----------------------------------------------------
    Unable to validate the ${clientLocale} trending JSON schema: ${validationError.message}
    `
    );
  }
};

if (!currentLocale_i18n)
  throw Error('currentLocale_i18n must be set to a valid locale');

download(currentLocale_i18n);
