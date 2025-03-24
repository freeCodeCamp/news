const probe = require('probe-image-size');
const errorLogger = require('./error-logger');
const { getCache, setCache } = require('./cache');

const getImageDimensions = async (url, description) => {
  let imageDimensions = { width: 600, height: 400 };

  try {
    if (url.startsWith('data:')) {
      console.warn(`
        ---------------------------------------------------------------
        Warning: Skipping data URL for image dimensions in ${description.substring(0, 350)}...
        ---------------------------------------------------------------
        `);

      throw new Error('Data URL');
    }
    const cachedDimensions = getCache(url);
    if (cachedDimensions) imageDimensions = cachedDimensions;

    const fetchedImageDimensions = await probe(url);
    imageDimensions = {
      width: fetchedImageDimensions?.width
        ? fetchedImageDimensions?.width
        : imageDimensions.width,
      height: fetchedImageDimensions?.height
        ? fetchedImageDimensions?.height
        : imageDimensions.height
    };

    setCache(url, imageDimensions);
  } catch (err) {
    errorLogger({ type: 'image', name: description });
  }

  return imageDimensions;
};

module.exports = getImageDimensions;
