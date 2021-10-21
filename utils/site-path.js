const { URL } = require('url');

const sitePath = new URL(process.env.SITE_URL).pathname;

module.exports = sitePath;
