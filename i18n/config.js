const i18next = require('i18next');
const Backend = require('i18next-fs-backend');
const fetch = require('node-fetch');
const yaml = require('js-yaml');
const { readdirSync, lstatSync } = require('fs');
const { join } = require('path');
const { currentLocale_i18n, currentLocale_i18nISOCode } = require('../config');

i18next.use(Backend).init({
  lng: currentLocale_i18nISOCode,
  fallbackLng: 'en',
  initImmediate: false,
  preload: readdirSync(join(__dirname, './locales')).filter(fileName => {
    const joinedPath = join(join(__dirname, './locales'), fileName);
    const isDirectory = lstatSync(joinedPath).isDirectory();
    return isDirectory;
  }),
  ns: ['translations', 'meta-tags', 'links'],
  defaultNS: 'translations',
  backend: {
    loadPath: join(__dirname, `./locales/${currentLocale_i18n}/{{ ns }}.json`)
  }
});

(async () => {
  const url = `https://cdn.freecodecamp.org/universal/trending/${currentLocale_i18n}.yaml`;
  const trendingYAML = await fetch(url)
    .then(res => {
      if (!res.ok) {
        throw new Error(
          `


          ----------------------------------------------------
          Error: The CDN is missing the trending YAML file.
          ----------------------------------------------------
          Unable to fetch the ${currentLocale_i18n} footer: ${res.statusText}


          `
        );
      }
      return res;
    })
    .then(res => res.text());
  const trendingJSON = yaml.load(trendingYAML);

  i18next.addResources(currentLocale_i18nISOCode, 'trending', trendingJSON);
})().catch(err => {
  console.log(err); // Log js-yaml or fetch errors
  process.exit(1); // Forcefully exit
});

module.exports = i18next;
