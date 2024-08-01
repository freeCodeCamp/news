const probe = require('probe-image-size');
const errorLogger = require('./error-logger');
const { getCache, setCache } = require('./cache');
const defaultDimensions = { width: 600, height: 400 };

const getImageDimensions = async (url, description) => {
  try {
    let imageDimensions = getCache(url);
    if (imageDimensions) return imageDimensions;

    const res = await probe(url);
    imageDimensions = {
      width: res?.width ? res?.width : defaultDimensions.width,
      height: res?.height ? res?.height : defaultDimensions.height
    };
    setCache(url, imageDimensions);

    return imageDimensions;
  } catch (err) {
    if (err.statusCode) errorLogger({ type: 'image', name: description }); // Only write HTTP status code errors to log

    return defaultDimensions;
  }
};

module.exports = getImageDimensions;
