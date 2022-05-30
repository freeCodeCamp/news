const { locales, localeCodes, algoliaIndices } = require('../index.js');

const fs = require('fs');
const { setup } = require('jest-json-schema-extended');

setup();

const filesThatShouldExist = [
  {
    name: 'links.json'
  },
  {
    name: 'meta-tags.json'
  },
  {
    name: 'serve.json'
  },
  {
    name: 'translations.json'
  }
];

const path = `${__dirname}/locales`;

describe('Locale tests:', () => {
  locales.forEach(lang => {
    describe(`-- ${lang} --`, () => {
      filesThatShouldExist.forEach(file => {
        // check that each json file exists
        test(`${file.name} file exists`, () => {
          const exists = fs.existsSync(`${path}/${lang}/${file.name}`);
          expect(exists).toBeTruthy();
        });
      });

      test(`has an entry in the localeCodes array`, () => {
        expect(localeCodes[lang].length).toBeGreaterThan(0);
      });

      test(`has an entry in the algoliaIndices array`, () => {
        expect(algoliaIndices[lang].length).toBeGreaterThan(0);
      });
    });
  });
});
