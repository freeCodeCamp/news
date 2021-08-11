const dayjs = require('dayjs');
const localizedFormat = require('dayjs/plugin/localizedFormat');
const relativeTime = require('dayjs/plugin/relativeTime');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');
const { settings } = require('./ghost-settings');

// Include dayjs locales
require('dayjs/locale/es');
require('dayjs/locale/zh');

// Load dayjs plugins
dayjs.extend(localizedFormat);
dayjs.extend(relativeTime);
dayjs.extend(utc);
dayjs.extend(timezone);

(async () => {
  const { lang, timezone } = await settings;
  
  dayjs.locale(lang);
  dayjs.tz.setDefault(timezone);
})();

module.exports = dayjs;
