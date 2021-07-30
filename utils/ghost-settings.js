const { api } = require('./ghost-api');
const siteLangHandler = require('./site-lang-handler');
const getImageDimensions = require('./image-dimensions');
const { createReadStream } = require('fs');
const path = require('path');

const ghostSettings = async () => {
  const settings = await api.settings
    .browse({
      include: 'icon,url'
    })
    .catch(err => {
      console.error(err);
    });

  if (process.env.SITE_URL) settings.url = process.env.SITE_URL;

  // Note: Consider setting these through the CDN repo later
  // Add passthrough image URLs to settings object
  const logoPath = 'assets/images/fcc_primary_large_24X210.svg';
  const logoUrl = `${settings.url}/${logoPath}`;
  settings.logo = logoUrl;

  const coverImagePath = 'assets/images/fcc_ghost_publication_cover.png';
  const coverImageUrl = `${settings.url}/${coverImagePath}`;
  settings.cover_image = coverImageUrl;
  settings.og_image = coverImageUrl;
  settings.twitter_image = coverImageUrl;
  
  // Determine image dimensions before server runs for structured data
  const logoDimensions = await getImageDimensions(createReadStream(path.resolve(__dirname, `../src/_includes/${logoPath}`)));
  const coverImageDimensions = await getImageDimensions(createReadStream(path.resolve(__dirname, `../src/_includes/${coverImagePath}`)));

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
  settings.lang = siteLangHandler(settings.lang);

  return settings;
};

// Return promise to await in other config files
module.exports.settings = ghostSettings();
