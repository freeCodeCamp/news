const { api } = require('../../utils/ghost-api');
const getImageDimensions = require('../../utils/image-dimensions');

module.exports = async () => {
  const site = await api.settings
    .browse({
      include: 'url'
    })
    .catch(err => {
      console.error(err);
    });

  site.url = process.env.SITE_URL;
  site.lang = process.env.CLIENT_LOCALE;

  const logoUrl = 'https://cdn.freecodecamp.org/platform/universal/fcc_primary.svg'
  site.logo = logoUrl;

  const coverImageUrl = 'https://cdn.freecodecamp.org/platform/universal/fcc_meta_1920X1080-indigo.png';
  site.cover_image = coverImageUrl;
  site.og_image = coverImageUrl;
  site.twitter_image = coverImageUrl;

  const iconUrl = 'https://cdn.freecodecamp.org/universal/favicons/favicon.ico';
  site.icon = iconUrl;
  
  // Determine image dimensions before server runs for structured data
  const logoDimensions = await getImageDimensions(logoUrl);
  const coverImageDimensions = await getImageDimensions(coverImageUrl);

  site.image_dimensions = {
    logo: {
      width: logoDimensions.width,
      height: logoDimensions.height
    },
    cover_image: {
      width: coverImageDimensions.width,
      height: coverImageDimensions.height
    }
  }

  // Set default title across all publications
  site.title = 'freeCodeCamp.org';

  return site;
};
