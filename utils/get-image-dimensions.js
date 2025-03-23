const fetch = require('node-fetch');
const { imageSize } = require('image-size');
const errorLogger = require('./error-logger');
const { getCache, setCache } = require('./cache');
const defaultDimensions = { width: 600, height: 400 };

const probeImage = async url => {
  const response = await fetch(url);
  if (!response.ok)
    throw new Error(`Failed to fetch image: ${response.statusText}`);

  const chunks = [];
  const reader = response.body;

  for await (const chunk of reader) {
    chunks.push(chunk);

    try {
      // Try to determine image size with available data
      const dimensions = imageSize(Buffer.concat(chunks));
      if (dimensions.width && dimensions.height) {
        response.body.destroy(); // Stop data stream
        return dimensions;
      }
    } catch (err) {
      // Keep reading if more data is needed
    }
  }

  throw new Error('Could not determine image size');
};

const getImageDimensions = async (url, description) => {
  try {
    if (url.startsWith('data:'))
      throw new Error('Data URI images are not supported');
    let imageDimensions = getCache(url);
    if (imageDimensions) return imageDimensions;

    const res = await probeImage(url);
    imageDimensions = {
      width: res?.width ? res?.width : defaultDimensions.width,
      height: res?.height ? res?.height : defaultDimensions.height
    };
    setCache(url, imageDimensions);

    return imageDimensions;
  } catch (err) {
    errorLogger({ type: 'image', name: description });

    return defaultDimensions;
  }
};

module.exports = getImageDimensions;
