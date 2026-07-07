import { config } from '../../config/index.js';

const { locales, langNames, localeCodes, getSiteURL, currentLocale_i18n } =
  config;

// Data for the language switcher in the nav in the order of the locales array in
// the main config
export default [...locales].map(locale => ({
  label: langNames[locale],
  htmlLang: localeCodes[locale],
  baseURL: getSiteURL(locale),
  isCurrent: locale === currentLocale_i18n
}));
