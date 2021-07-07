const probe = require('probe-image-size');

module.exports = async (url) => {
  try {
    return await probe(url);
  } catch(err) {
    console.log(err, url);
    return {
      width: null,
      height: null
    }
  }
}
