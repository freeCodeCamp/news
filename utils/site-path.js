const { URL } = require("url");
const { siteURL } = require("../config");
const sitePath = new URL(siteURL).pathname;

module.exports = sitePath;
