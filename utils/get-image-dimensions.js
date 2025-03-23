const probe = require('probe-image-size');
const errorLogger = require('./error-logger');
const { getCache, setCache } = require('./cache');
const defaultDimensions = { width: 600, height: 400 };

const getImageDimensions = async (url, description) => {
  try {
    if (url.startsWith('data:')) {
      console.warn(`
        ---------------------------------------------------------------
        Warning: Skipping data URL for image dimensions in ${description.substring(0, 350)}...
        ---------------------------------------------------------------
        `);

      // throw new Error('Data URL');
      return defaultDimensions;
    }
    let imageDimensions = getCache(url);
    if (imageDimensions) return imageDimensions;

    const res = await probe(url, {
      open_timeout: 5000,
      response_timeout: 3000,
      read_timeout: 3000
      // rejectUnauthorized: true
    });
    // const res = await probe(url);
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

// const getImageDimensions = async (url, description) => {
//   // try {
//   //   if (url.startsWith('data:')) {
//   //     console.warn(`
//   //       ---------------------------------------------------------------
//   //       Warning: Skipping data URL for image dimensions in ${description.substring(0, 350)}...
//   //       ---------------------------------------------------------------
//   //       `);

//   //     return defaultDimensions;
//   //   }
//   //   const res = await probe(url);

//   //   const imageDimensions = {
//   //     width: res?.width ? res?.width : defaultDimensions.width,
//   //     height: res?.height ? res?.height : defaultDimensions.height
//   //   };

//   //   return imageDimensions;
//   // } catch (err) {
//   //   errorLogger({ type: 'image', name: description });

//   //   return defaultDimensions;
//   // }

//   try {
//     const res = await probe(url);
//     const imageDimensions = {
//       width: res?.width ? res?.width : defaultDimensions.width,
//       height: res?.height ? res?.height : defaultDimensions.height
//     };

//     return imageDimensions;
//   } catch (err) {
//     errorLogger({ type: 'image', name: description });

//     return defaultDimensions;
//   }
// };

module.exports = getImageDimensions;
