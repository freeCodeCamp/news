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
  'chinese',
  'english',
  'espanol',
  'french',
  'italian',
  'japanese',
  'korean',
  'portuguese',
  'ukrainian',
  'urdu'
];

/* These strings set the i18next language. It needs to be the two character
 * string for the language to take advantage of available functionality.
 * Use a 639-1 code here https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes
 */
const localeCodes = {
  chinese: 'zh',
  english: 'en',
  espanol: 'es',
  french: 'fr',
  italian: 'it',
  japanese: 'ja',
  korean: 'ko',
  portuguese: 'pt-BR',
  ukrainian: 'uk',
  urdu: 'ur'
};

const algoliaIndices = {
  chinese: 'news-zh',
  english: 'news',
  espanol: 'news-es',
  french: 'news-fr',
  italian: 'news-it',
  japanese: 'news-ja',
  korean: 'news-ko',
  portuguese: 'news-pt-br',
  ukrainian: 'news-uk',
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
  GOOGLE_ADSENSE_DATA_AD_SLOT: googleAdsenseDataAdSlot,
  HASHNODE_API_URL: hashnodeAPIURL,
  CHAT_WEBHOOK_KEY: chatWebhookKey,
  CHAT_WEBHOOK_TOKEN: chatWebhookToken
} = process.env;

// Validations
const lang = locales.find(e => e === localeForUI);
if (!lang) {
  throw new Error(`
    ----------------------------------------------------
    Error: Unsupported locale: ${localeForUI}
    ----------------------------------------------------
    Looks like you requested build for the ${localeForUI}
    locale, but that locale is not configured somewhere.

    You should check all the configs, pipelines or rebase
    with the latest version of the code.
    ----------------------------------------------------

  `);
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

// Config Computations
const getSiteURL = (lang, forOriginalArticle) => {
  // Special handling for original article feature, where we always want the final siteURL
  const computedDomain =
    !siteDomain || forOriginalArticle ? 'freecodecamp.org' : siteDomain;
  const computedPath = lang === 'english' ? '/news' : `/${lang}/news`;

  if (computedDomain.startsWith('localhost')) {
    return `http://${computedDomain}${computedPath}/`;
  } else {
    return `https://www.${computedDomain}${computedPath}/`;
  }
};

const siteURL = getSiteURL(lang);

module.exports = Object.assign(
  {},
  {
    locales,
    localeCodes,
    algoliaIndices,
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
    adsEnabled: (adsEnabled === 'true' && localeForUI !== 'chinese') || false, // Convert to boolean and exclude Chinese until move to subpath, otherwise default to false
    googleAdsenseDataAdClient: !googleAdsenseDataAdClient
      ? ''
      : googleAdsenseDataAdClient,
    googleAdsenseDataAdSlot: !googleAdsenseDataAdSlot
      ? ''
      : googleAdsenseDataAdSlot,
    eleventyEnv: eleventyEnv || 'dev',
    hashnodeAPIURL:
      !hashnodeAPIURL || hashnodeAPIURL === 'api_url_from_hashnode_dashboard'
        ? ''
        : hashnodeAPIURL,
    chatWebhookKey:
      !chatWebhookKey ||
      chatWebhookKey === 'chat_webhook_key_from_space_settings'
        ? ''
        : chatWebhookKey,
    chatWebhookToken:
      !chatWebhookToken ||
      chatWebhookToken === 'chat_webhook_token_from_space_settings'
        ? ''
        : chatWebhookToken
  }
);
