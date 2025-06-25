import { existsSync } from 'fs';
import { setup } from 'jest-json-schema-extended';

import { config } from '../index.js';
const { locales, localeCodes, algoliaIndices } = config;

setup();

const filesThatShouldExist = [
  {
    name: 'links.json'
  },
  {
    name: 'meta-tags.json'
  },
  {
    name: 'redirects.json'
  },
  {
    name: 'translations.json'
  }
];

const path = `${import.meta.dirname}/locales`;

describe('Locale tests:', () => {
  locales.forEach(lang => {
    describe(`-- ${lang} --`, () => {
      filesThatShouldExist.forEach(file => {
        // check that each json file exists
        test(`${file.name} file exists`, () => {
          const exists = existsSync(`${path}/${lang}/${file.name}`);
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
