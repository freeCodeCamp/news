const { eleventyEnv } = require('../config');
const { sourceApiUrl } = require('./ghost/api');

// Strip Ghost domain from urls
const stripDomain = url => {
  // To do: figure out a better way to strip out everything
  // up to and including /news
  const toReplace = eleventyEnv === 'ci' ?
    'https://www.freecodecamp.org/news' :
    sourceApiUrl;

  return url.replace(toReplace, '');
};

module.exports = stripDomain;
