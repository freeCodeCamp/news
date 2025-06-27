import { getImageDimensions } from '../../utils/get-image-dimensions.js';
import {
  convertToLocalizedString,
  getRoundedTotalRecords
} from '../../utils/search-bar-placeholder-number.js';
import { getUsername } from '../../utils/get-username.js';
import { translate } from '../../utils/translate.js';
import { config } from '../../config/index.js';

const { currentLocale_i18nISOCode, siteURL } = config;

// Get X / Twitter profile based on links in config/i18n/locales/lang/links.json --
// falls back to English Twitter profile if one for the current UI locale
// isn't found
const twitterURL = translate('links:twitter');
const twitterHandle = twitterURL
  ? `@${getUsername(twitterURL)}`
  : '@freecodecamp';
const logoURL =
  'https://cdn.freecodecamp.org/platform/universal/fcc_primary.svg';
const coverImageURL =
  'https://cdn.freecodecamp.org/platform/universal/fcc_meta_1920X1080-indigo.png';
const iconURL = 'https://cdn.freecodecamp.org/universal/favicons/favicon.ico';

export default async () => {
  const site = {
    url: siteURL,
    lang: currentLocale_i18nISOCode.toLowerCase(),
    title: 'freeCodeCamp.org',
    facebook: 'https://www.facebook.com/freecodecamp',
    facebook_username: 'freecodecamp',
    twitter_handle: twitterHandle,
    twitter: `https://x.com/${twitterHandle}`,
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
