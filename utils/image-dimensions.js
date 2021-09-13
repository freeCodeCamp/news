const probe = require('probe-image-size');
// Cache image dimensions during build
const imageDimensionMap = {};

module.exports = async (url, title) => {
  if (!imageDimensionMap[url]) {
    try {
      const { width, height } = await probe(url);

      imageDimensionMap[url] = { width, height };
    } catch(err) {
      console.log(err, url, title);
      
      imageDimensionMap[url] = {
        width: null,
        height: null
      }
    }
  }

  return imageDimensionMap[url];
}
