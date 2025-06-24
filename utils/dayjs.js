import dayjs from 'dayjs';
import localizedFormat from 'dayjs/plugin/localizedFormat.js';
import relativeTime from 'dayjs/plugin/relativeTime.js';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';

import { config } from '../config/index.js';
const { currentLocale_i18nISOCode } = config;

const localeCode = currentLocale_i18nISOCode.toLowerCase();

// Dynamically include dayjs locale
import(`dayjs/locale/${localeCode}.js`)
  .then(() => {
    console.log(`Day.js locale ${localeCode} loaded successfully.`);
  })
  .catch(err => {
    console.error(`Error loading Day.js locale ${localeCode}:`, err);
  });

// Load dayjs plugins
dayjs.extend(localizedFormat);
dayjs.extend(relativeTime);
dayjs.extend(utc);
dayjs.extend(timezone);

dayjs.locale(localeCode);

export default dayjs;
