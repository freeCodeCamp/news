const i18next = require("i18next");
const Backend = require("i18next-fs-backend");
const { readdirSync, lstatSync } = require("fs");
const { join } = require("path");
const { currentLocale_i18n, currentLocale_i18nISOCode } = require("../config");

i18next.use(Backend).init({
  lng: currentLocale_i18nISOCode,
  fallbackLng: "en",
  initImmediate: false,
  preload: readdirSync(join(__dirname, "./locales")).filter((fileName) => {
    const joinedPath = join(join(__dirname, "./locales"), fileName);
    const isDirectory = lstatSync(joinedPath).isDirectory();
    return isDirectory;
  }),
  ns: ["translations", "trending", "meta-tags", "links"],
  defaultNS: "translations",
  backend: {
    loadPath: join(__dirname, `./locales/${currentLocale_i18n}/{{ ns }}.json`),
  },
});

module.exports = i18next;
