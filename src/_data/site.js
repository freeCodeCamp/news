const { api } = require('../../utils/ghost-api');
const getImageDimensions = require('../../utils/image-dimensions');

module.exports = async () => {
  const settings = await api.settings
    .browse({
      include: 'icon,url'
    })
    .catch(err => {
      console.error(err);
    });

  settings.url = process.env.SITE_URL;
  settings.lang = process.env.CLIENT_LOCALE;

  const logoUrl = 'https://cdn.freecodecamp.org/platform/universal/fcc_primary.svg'
  settings.logo = logoUrl;

  const coverImageUrl = 'https://cdn.freecodecamp.org/platform/universal/fcc_meta_1920X1080-indigo.png';
  settings.cover_image = coverImageUrl;
  settings.og_image = coverImageUrl;
  settings.twitter_image = coverImageUrl;
  
  // Determine image dimensions before server runs for structured data
  const logoDimensions = await getImageDimensions(logoUrl);
  const coverImageDimensions = await getImageDimensions(coverImageUrl);

  settings.image_dimensions = {
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
  settings.title = 'freeCodeCamp.org';

  return settings;
};
