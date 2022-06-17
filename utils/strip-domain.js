const { sourceAPIURL } = require('./ghost/api');

// Strip current Ghost domain from URLs
const stripDomain = url => url.replace(sourceAPIURL, '');

module.exports = stripDomain;
