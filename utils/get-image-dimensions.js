const probe = require('probe-image-size');
const errorLogger = require('./error-logger');
// Cache image dimensions we know will be repeated, like author profile and cover images
const imageDimensionMap = {};
const defaultDimensions = { width: 600, height: 400 };

const getImageDimensions = async (url, title, cache) => {
  try {
    if (cache && imageDimensionMap[url]) return imageDimensionMap[url];

    const res = await probe(url);
    const width = res.width ? res.width : defaultDimensions.width;
    const height = res.height ? res.height : defaultDimensions.height;

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
      width: defaultDimensions.width,
      height: defaultDimensions.height
    };
  }
};

module.exports = getImageDimensions;
