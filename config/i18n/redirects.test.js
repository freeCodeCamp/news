let { locales } = require('../index.js');
locales = [...locales, 'dothraki'];

const path = `${__dirname}`;

describe('Redirect and rewrite tests:', () => {
  locales.forEach(lang => {
    describe(`-- ${lang} --`, () => {
      const serveObj = require(`${path}/locales/${lang}/serve.json`);
      const redirects = serveObj.redirects;

      test('has a non-empty serve.json file', () => {
        expect(serveObj).toBeTruthy();
      });

      // test('has a rewrite for RSS feeds', () => {
      //   const expectedRSSRewrite = {
      //     source: '/:authorOrTag?/:name?/rss',
      //     destination: '/:authorOrTag?/:name?/rss.xml'
      //   };

      //   expect(serveObj.rewrites).toEqual(
      //     expect.arrayContaining([expectedRSSRewrite])
      //   );
      // });

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
