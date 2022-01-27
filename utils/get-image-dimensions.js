const probe = require("probe-image-size");
const errorLogger = require("./error-logger");
// Cache image dimensions during build
const imageDimensionMap = {};

const getImageDimensions = async (
  url,
  title,
  defaultDimensions = { width: 600, height: 400 }
) => {
  if (!imageDimensionMap[url]) {
    try {
      const { width, height } = await probe(url);

      imageDimensionMap[url] = { width, height };
    } catch (err) {
      if (err.statusCode) errorLogger({ type: "image", name: title }); // Only write HTTP status code errors to log

      // Don't cache dimensions
      return {
        width: defaultDimensions.width,
        height: defaultDimensions.height,
      };
    }
  }

  return imageDimensionMap[url];
};

module.exports = getImageDimensions;
