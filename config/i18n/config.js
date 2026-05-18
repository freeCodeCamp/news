import i18next, { use } from 'i18next';
import Backend from 'i18next-fs-backend';
import gracefulFS from 'graceful-fs';
import { join } from 'path';

import { config } from '../index.js';

const { readdirSync, lstatSync } = gracefulFS;
const { currentLocale_i18n, currentLocale_i18nISOCode } = config;

use(Backend).init({
  lng: currentLocale_i18nISOCode,
  fallbackLng: 'en',
  initImmediate: false,
  // Suppress i18next's Locize promo banner — printed once per process, so it
  // showed up 11× (main + 10 Piscina workers). See node_modules/i18next/dist/
  // cjs/i18next.js:1771 (`showSupportNotice !== false` gate).
  showSupportNotice: false,
  preload: readdirSync(join(import.meta.dirname, './locales')).filter(
    fileName => {
      const joinedPath = join(join(import.meta.dirname, './locales'), fileName);
      const isDirectory = lstatSync(joinedPath).isDirectory();
      return isDirectory;
    }
  ),
  ns: ['translations', 'meta-tags', 'links', 'trending'],
  defaultNS: 'translations',
  backend: {
    loadPath: join(
      import.meta.dirname,
      `./locales/${currentLocale_i18n}/{{ ns }}.json`
    )
  }
});

export default i18next;
