const dayjs = require('dayjs');
const localizedFormat = require('dayjs/plugin/localizedFormat');
const relativeTime = require('dayjs/plugin/relativeTime');
const { settings } = require('./ghost-settings');

// Include dayjs locales
require('dayjs/locale/es');
require('dayjs/locale/zh');

// Load dayjs plugins
dayjs.extend(localizedFormat);
dayjs.extend(relativeTime);

(async () => {
  const { lang } = await settings;
  
  dayjs.locale(lang);
})();

module.exports = dayjs;
