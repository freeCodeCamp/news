const path = require('path');

const envPath = path.resolve(__dirname, '../.env');
const { error } = require('dotenv').config({ path: envPath });

if (error) {
  console.warn(`
  ----------------------------------------------------
  Warning: .env file not found.
  ----------------------------------------------------
  Please copy sample.env to .env
  You can ignore this warning if using a different way
  to setup this environment.
  ----------------------------------------------------
  `);
}

const locales = ['english', 'espanol', 'chinese', 'italian', 'portuguese'];

/* These strings set the i18next language. It needs to be the two character
 * string for the language to take advantage of available functionality.
 * Use a 639-1 code here https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes
 */
const localeCodes = {
  english: 'en',
  espanol: 'es',
  chinese: 'zh',
  italian: 'it',
  portuguese: 'pt-BR'
};

const {
  LOCALE_FOR_UI: localeForUI,
  LOCALE_FOR_GHOST: localeForGhost,
  SITE_DOMAIN: siteDomain,
  POSTS_PER_PAGE: postsPerPage,
  ALGOLIA_APP_ID: algoliaAppId,
  ALGOLIA_API_KEY: algoliaAPIKey
} = process.env;

// Validations
const lang = locales.find((e) => e === localeForGhost);
if (!lang) {
  throw new Error(`Unsupported locale: ${localeForGhost}`);
}
if (lang !== localeForUI) {
  console.warn(`
    ----------------------------------------------------
    Warning: Mismatch between UI locale and Ghost locale.
    ----------------------------------------------------
    You have set the LOCALE_FOR_UI and LOCALE_FOR_GHOST 
    to different values. This is not recommended.
    ----------------------------------------------------
  `);
}

// Config Computations
const computedDomain = siteDomain || 'freecodecamp.org';
const siteURL =
  lang !== 'chinese'
    ? `https://www.${computedDomain}/${lang}/news`
    : `https://chinese.${computedDomain}/news`;

module.exports = Object.assign(
  {},
  {
    currentLocale_i18n: localeForUI || 'italian',
    currentLocale_i18nISOCode: !localeCodes[localeForUI]
      ? localeCodes['italian']
      : localeCodes[localeForUI],
    currentLocale_ghost: localeForGhost || 'italian',
    siteURL,
    postsPerPage: postsPerPage || 25,
    algoliaAppId:
      !algoliaAppId || algoliaAppId === 'app_id_from_algolia_dashboard'
        ? ''
        : algoliaAppId,
    algoliaAPIKey:
      !algoliaAPIKey || algoliaAPIKey === 'api_key_from_algolia_dashboard'
        ? ''
        : algoliaAPIKey
  }
);
