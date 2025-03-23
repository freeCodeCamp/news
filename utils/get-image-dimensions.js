const fetch = require('node-fetch');
const { imageSize } = require('image-size');
const errorLogger = require('./error-logger');
const { getCache, setCache } = require('./cache');
const defaultDimensions = { width: 600, height: 400 };

// Minimum required bytes for common image formats (approximate)
const imageMinBytes = {
  jpg: 410,
  png: 33,
  gif: 14,
  webp: 30,
  bmp: 26,
  default: 256 // Fallback for other image types
};

const probeImage = async url => {
  const response = await fetch(url);
  if (!response.ok)
    throw new Error(`Failed to fetch image: ${response.statusText}`);

  const chunks = [];
  let totalLength = 0;
  const reader = response.body;

  for await (const chunk of reader) {
    chunks.push(chunk);
    totalLength += chunk.length;

    try {
      const buffer = Buffer.concat(chunks, totalLength);

      // Try to detect image format (first few bytes)
      const { type } = imageSize(buffer);
      const minBytes = imageMinBytes[type] || imageMinBytes.default;

      // Check buffer length before probing image
      if (buffer.length < minBytes) continue;

      // Get dimensions
      const dimensions = imageSize(buffer);
      if (dimensions.width && dimensions.height) {
        response.body.destroy(); // Stop downloading
        return dimensions;
      }
    } catch (err) {
      // Continue reading if more data is needed
    }
  }

  throw new Error('Could not determine image size');
};

const getImageDimensions = async (url, description) => {
  try {
    if (url.startsWith('data:')) {
      console.warn(`
        ---------------------------------------------------------------
        Warning: Skipping data URL for image dimensions in ${description.substring(0, 350)}...
        ---------------------------------------------------------------
        `);

      throw new Error('Data URL');
    }
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
