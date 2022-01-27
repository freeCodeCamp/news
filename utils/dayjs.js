const dayjs = require("dayjs");
const localizedFormat = require("dayjs/plugin/localizedFormat");
const relativeTime = require("dayjs/plugin/relativeTime");
const utc = require("dayjs/plugin/utc");
const timezone = require("dayjs/plugin/timezone");
const { currentLocale_i18nISOCode } = require("../config");
const localeCode = currentLocale_i18nISOCode.toLowerCase();

// Dynamically include dayjs locale
require(`dayjs/locale/${localeCode}`);

// Load dayjs plugins
dayjs.extend(localizedFormat);
dayjs.extend(relativeTime);
dayjs.extend(utc);
dayjs.extend(timezone);

dayjs.locale(localeCode);

module.exports = dayjs;
