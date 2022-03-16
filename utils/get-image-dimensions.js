const probe = require('probe-image-size');
const errorLogger = require('./error-logger');

const getImageDimensions = async (url, title) => {
  try {
    const { width, height } = await probe(url);

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
