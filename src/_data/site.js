const getImageDimensions = require('../../utils/get-image-dimensions');
const {
  convertToLocalizedString,
  getRoundedTotalRecords
} = require('../../utils/search-bar-placeholder-number');
const { currentLocale_i18nISOCode, siteURL } = require('../../config');
const getUsername = require('../../utils/get-username');
const translate = require('../../utils/translate');

// Get Bluesky profile based on links in config/i18n/locales/lang/links.json --
// falls back to English Twitter profile if one for the current UI locale
// isn't found
const blueskyURL = translate('links:bluesky');
const blueskyHandle = blueskyURL
  ? `@${getUsername(blueskyURL)}`
  : '@freecodecamp.bsky.social';
const logoURL =
  'https://cdn.freecodecamp.org/platform/universal/fcc_primary.svg';
const coverImageURL =
  'https://cdn.freecodecamp.org/platform/universal/fcc_meta_1920X1080-indigo.png';
const iconURL = 'https://cdn.freecodecamp.org/universal/favicons/favicon.ico';

module.exports = async () => {
  const site = {
    url: siteURL,
    lang: currentLocale_i18nISOCode.toLowerCase(),
    title: 'freeCodeCamp.org',
    facebook: 'https://www.facebook.com/freecodecamp',
    facebook_username: 'freecodecamp',
    bluesky_handle: blueskyHandle,
    bluesky: `https://bsky.app/profile/${blueskyHandle}`,
    logo: logoURL,
    cover_image: coverImageURL,
    og_image: coverImageURL,
    twitter_image: coverImageURL,
    icon: iconURL
  };

  // Determine image dimensions before server runs for structured data
  const logoDimensions = await getImageDimensions(
    logoURL,
    `Site logo: ${logoURL}`
  );
  const coverImageDimensions = await getImageDimensions(
    coverImageURL,
    `Site cover image: ${coverImageURL}`
  );

  site.image_dimensions = {
    logo: {
      width: logoDimensions.width,
      height: logoDimensions.height
    },
    cover_image: {
      width: coverImageDimensions.width,
      height: coverImageDimensions.height
    }
  };

  // Dynamic search bar placeholder number
  const roundedTotalRecords = await getRoundedTotalRecords();
  site.roundedTotalRecords = roundedTotalRecords;
  site.roundedTotalRecordsLocalizedString = convertToLocalizedString(
    roundedTotalRecords,
    currentLocale_i18nISOCode
  );

  return site;
};
