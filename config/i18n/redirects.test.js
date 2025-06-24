import { locales } from '../index.js';
import { loadJSON } from '../../utils/load-json.js';
const testLocales = [...locales, 'dothraki'];

const path = `${import.meta.dirname}`;

// To do: Simplify the npm scripts and test the generated serve.json files
// in the docker directory. Add a test for the first /slug/amp to
// /news/slug or /lang/news/slug redirect.
describe('Redirect and rewrite tests:', () => {
  testLocales.forEach(lang => {
    describe(`-- ${lang} --`, () => {
      const redirects = loadJSON(`${path}/locales/${lang}/redirects.json`);

      test('redirects is an array', () => {
        expect(Array.isArray(redirects)).toBe(true);
      });

      test('redirect sources start with /', () => {
        redirects.map(redirect => expect(redirect.source).toMatch(/^\//));
      });

      test('redirect destinations start with / or https://', () => {
        redirects.map(redirect =>
          expect(redirect.destination).toMatch(/^\/|^https:\/\//)
        );
      });

      test('redirect sources do not end with /', () => {
        redirects.map(redirect => expect(redirect.source).not.toMatch(/\/$/));
      });

      test('redirect destinations do not end with /', () => {
        redirects.map(redirect =>
          expect(redirect.destination).not.toMatch(/\/$/)
        );
      });

      test('internal redirects point to the correct base path', () => {
        redirects
          .filter(redirect => redirect.destination.startsWith('/'))
          .map(redirect => {
            const expectedBasePath =
              lang === 'english'
                ? new RegExp(`^/news(/|$)`)
                : new RegExp(`^/${lang}/news(/|$)`);

            expect(redirect.destination).toMatch(expectedBasePath);
          });
      });

      test('there are no duplicate redirects', () => {
        const sources = redirects.map(obj => obj.source);
        const uniqueSources = [...new Set(sources)];

        expect(sources.length).toEqual(uniqueSources.length);
      });
    });
  });
});
