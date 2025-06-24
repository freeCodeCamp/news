import probe from 'probe-image-size';

import { errorLogger } from './error-logger.js';
import { getCache, setCache } from './cache.js';

export const getImageDimensions = async (url, description) => {
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

    const fetchedImageDimensions = await probe(url, {
      open_timeout: 5000,
      response_timeout: 5000,
      read_timeout: 5000,
      // Don't follow redirects, which can
      // cause some localized builds to hang
      follow_max: 0
    });
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
