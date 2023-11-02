const { sourceUrl } = require('./ghost/api');

// Strip current Ghost domain from URLs
const stripDomain = url => url.replace(`${sourceUrl}/api`, '');

module.exports = stripDomain;
