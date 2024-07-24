const { sourceAPI } = require('../../utils/ghost/api');
const getImageDimensions = require('../../utils/get-image-dimensions');
const {
  convertToLocalizedString,
  getRoundedTotalRecords
} = require('../../utils/search-bar-placeholder-number');
const { currentLocale_i18nISOCode, siteURL } = require('../../config');
const translate = require('../../utils/translate');

// Get Twitter profile based on links in config/i18n/locales/lang/links.json --
// falls back to English Twitter profile if one for the current UI locale
// isn't found
const getTwitterProfile = url => url.replace('https://twitter.com/', '@');
const twitterURL = translate('links:twitter');
const twitterProfile =
  twitterURL !== 'twitter' ? getTwitterProfile(twitterURL) : '@freecodecamp';

module.exports = async () => {
  const site = await sourceAPI.settings
    .browse({
      include: 'url'
    })
    .catch(err => {
      console.error(err);
    });

  site.url = siteURL;
  site.lang = currentLocale_i18nISOCode.toLowerCase();

  const logoUrl =
    'https://cdn.freecodecamp.org/platform/universal/fcc_primary.svg';
  site.logo = logoUrl;

  const coverImageUrl =
    'https://cdn.freecodecamp.org/platform/universal/fcc_meta_1920X1080-indigo.png';
  site.cover_image = coverImageUrl;
  site.og_image = coverImageUrl;
  site.twitter_image = coverImageUrl;

  const iconUrl = 'https://cdn.freecodecamp.org/universal/favicons/favicon.ico';
  site.icon = iconUrl;

  // Determine image dimensions before server runs for structured data
  const logoDimensions = await getImageDimensions(
    logoUrl,
    `Site logo: ${logoUrl}`
  );
  const coverImageDimensions = await getImageDimensions(
    coverImageUrl,
    `Site cover image: ${coverImageUrl}`
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

  // Set default title across all publications
  site.title = 'freeCodeCamp.org';

  // Set default Facebook account, and set Twitter account
  // based on UI locale
  site.facebook = 'https://www.facebook.com/freecodecamp';
  site.twitter = twitterProfile;

  // Dynamic search bar placeholder number
  const roundedTotalRecords = await getRoundedTotalRecords();
  site.roundedTotalRecords = roundedTotalRecords;
  site.roundedTotalRecordsLocalizedString = convertToLocalizedString(
    roundedTotalRecords,
    currentLocale_i18nISOCode
  );

  return site;
};
