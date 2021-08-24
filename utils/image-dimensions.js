const probe = require('probe-image-size');

module.exports = async (url, title) => {
  try {
    return await probe(url);
  } catch(err) {
    console.log(err, url, title);
    return {
      width: null,
      height: null
    }
  }
}
