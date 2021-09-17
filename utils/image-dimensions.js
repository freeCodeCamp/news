const probe = require('probe-image-size');
// Cache image dimensions during build
const imageDimensionMap = {};

const getImageDimensions = async (url, title, defaultDimensions) => {
  if (!imageDimensionMap[url]) {
    try {
      const { width, height } = await probe(url);

      imageDimensionMap[url] = { width, height };
    } catch(err) {
      console.log(err, url, title);

      const { width = null, height = null } = defaultDimensions;
      
      imageDimensionMap[url] = {
        width,
        height
      }
    }
  }

  return imageDimensionMap[url];
}

module.exports = {
  getImageDimensions
}
