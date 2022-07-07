const path = require('path');

const eleventyEnv = process.env.ELEVENTY_ENV;
const envPath = path.resolve(
  __dirname,
  eleventyEnv === 'ci' ? '../.env.ci' : '../.env'
);
const envFileName = eleventyEnv === 'ci' ? '.env.ci' : '.env';
const { error } = require('dotenv').config({ path: envPath });

if (error) {
  console.warn(`
    ----------------------------------------------------
    Warning: ${envFileName} file not found.
    ----------------------------------------------------
    Please copy sample.env to ${envFileName}
    You can ignore this warning if using a different way
    to set up this environment.
    ----------------------------------------------------
  `);
}

const locales = [
  'arabic',
  'bengali',
  'chinese',
  'english',
  'espanol',
  'italian',
  'japanese',
  'portuguese',
  'swahili',
  'urdu'
];

/* These strings set the i18next language. It needs to be the two character
 * string for the language to take advantage of available functionality.
 * Use a 639-1 code here https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes
 */
const localeCodes = {
  arabic: 'ar',
  bengali: 'bn',
  chinese: 'zh',
  english: 'en',
  espanol: 'es',
  italian: 'it',
  japanese: 'ja',
  portuguese: 'pt-BR',
  swahili: 'sw',
  urdu: 'ur'
};

const algoliaIndices = {
  arabic: 'news-ar',
  bengali: 'news-bn',
  chinese: 'news-zh',
  english: 'news',
  espanol: 'news-es',
  italian: 'news-it',
  japanese: 'news-ja',
  portuguese: 'news-pt-br',
  swahili: 'news-sw',
  urdu: 'news-ur'
};

const {
  LOCALE_FOR_UI: localeForUI,
  LOCALE_FOR_GHOST: localeForGhost,
  SITE_DOMAIN: siteDomain,
  POSTS_PER_PAGE: postsPerPage,
  ALGOLIA_APP_ID: algoliaAppId,
  ALGOLIA_API_KEY: algoliaAPIKey,
  ADS_ENABLED: adsEnabled,
  GOOGLE_ADSENSE_DATA_AD_CLIENT: googleAdsenseDataAdClient,
  GOOGLE_ADSENSE_DATA_AD_SLOT: googleAdsenseDataAdSlot
} = process.env;

// Validations
const lang = locales.find(e => e === localeForUI);
if (!lang) {
  throw new Error(`Unsupported locale: ${localeForUI}`);
}
if (lang !== localeForGhost && localeForGhost !== 'local') {
  console.warn(`
    ----------------------------------------------------
    Warning: Mismatch between UI locale and Ghost locale.
    ----------------------------------------------------
    You have set the LOCALE_FOR_UI and LOCALE_FOR_GHOST
    to different values. This is not recommended.
    ----------------------------------------------------
  `);
}

let computedPath;

// Config Computations
const getSiteURL = (lang, forOriginalArticle) => {
  // Special handling for original article feature, where we always want the final siteURL
  const computedDomain =
    !siteDomain || forOriginalArticle ? 'freecodecamp.org' : siteDomain;
  computedPath =
    lang === 'english' || lang === 'chinese' ? 'news' : `${lang}/news`;

  if (computedDomain.startsWith('localhost')) {
    return `http://${computedDomain}/${computedPath}`;
  } else if (lang === 'chinese') {
    return `https://chinese.${computedDomain}/${computedPath}`;
  } else {
    return `https://www.${computedDomain}/${computedPath}`;
  }
};

const siteURL = getSiteURL(lang);

module.exports = Object.assign(
  {},
  {
    locales,
    localeCodes,
    algoliaIndices,
    computedPath,
    getSiteURL,
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
        : algoliaAPIKey,
    algoliaIndex: algoliaIndices[localeForUI] || 'news',
    adsEnabled: adsEnabled || 'false',
    googleAdsenseDataAdClient:
      !googleAdsenseDataAdClient ||
      googleAdsenseDataAdClient === 'pub-1234567890'
        ? ''
        : googleAdsenseDataAdClient,
    googleAdsenseDataAdSlot:
      !googleAdsenseDataAdSlot || googleAdsenseDataAdSlot === '1234567890'
        ? ''
        : googleAdsenseDataAdSlot,
    eleventyEnv: eleventyEnv || 'dev'
  }
);
