const i18next = require('i18next');
const Backend = require('i18next-fs-backend');
const { readdirSync, lstatSync } = require('fs');
const { join } = require('path');
const lang = process.env.CLIENT_LOCALE;

i18next
  .use(Backend)
  .init({
    lng: lang,
    fallbackLng: 'en',
    initImmediate: false,
    preload: readdirSync(join(__dirname, './locales')).filter((fileName) => {
      const joinedPath = join(join(__dirname, './locales'), fileName)
      const isDirectory = lstatSync(joinedPath).isDirectory()
      return isDirectory
    }),
    ns: ['translations', 'trending', 'meta', 'links'],
    defaultNS: 'translations',
    backend: {
      loadPath: join(__dirname, './locales/{{lng}}/{{ns}}.json')
    }
  });

module.exports = i18next;
