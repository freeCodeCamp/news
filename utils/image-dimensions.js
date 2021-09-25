const probe = require('probe-image-size');
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
      if (err.status) console.log(err, url, title); // Only print HTTP status code errors

      const { width, height } = defaultDimensions;

      imageDimensionMap[url] = {
        width,
        height,
      };
    }
  }

  return imageDimensionMap[url];
};

module.exports = {
  getImageDimensions,
};
