const probe = require('probe-image-size');
const errorLogger = require('./error-logger');
// Cache image dimensions we know will be repeated, like author profile and cover images
const imageDimensionMap = {};

const getImageDimensions = async (url, title, cache) => {
  try {
    if (cache && imageDimensionMap[url]) return imageDimensionMap[url];

    const { width, height } = await probe(url);

    if (cache) {
      imageDimensionMap[url] = { width, height };
    }

    return {
      width,
      height
    };
  } catch (err) {
    if (err.statusCode) errorLogger({ type: 'image', name: title }); // Only write HTTP status code errors to log

    return {
      width: 600,
      height: 400
    };
  }
};

module.exports = getImageDimensions;
