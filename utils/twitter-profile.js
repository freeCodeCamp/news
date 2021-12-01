const { currentLocale_i18n } = require('../config/index');

const getTwitterProfile = (url) => url.replace('https://twitter.com/', '@');

const twitterAccounts = {
  english: 'https://twitter.com/freecodecamp',
  espanol: 'https://twitter.com/freecodecampes',
  chinese: 'https://twitter.com/freeCodeCampZH',
  italian: 'https://twitter.com/freecodecampit',
  portuguese: 'https://twitter.com/freecodecampPT'
};

const currentLocaleTwitterURL = twitterAccounts[currentLocale_i18n] || twitterAccounts['english'];

module.exports = getTwitterProfile(currentLocaleTwitterURL);
