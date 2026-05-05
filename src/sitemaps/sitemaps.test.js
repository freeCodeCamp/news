import gracefulFS from 'graceful-fs';
import { XMLParser, XMLValidator } from 'fast-xml-parser';
import { join } from 'path';

const { readFileSync } = gracefulFS;
const xmlParser = new XMLParser();

const sitemapFilenames = [
  'sitemap.xml',
  'sitemap-pages.xml',
  'sitemap-posts.xml',
  'sitemap-tags.xml',
  'sitemap-authors.xml'
];
const distPath = join(import.meta.dirname, '../../dist');

describe('Sitemap tests:', () => {
  describe('Validate sitemaps', () => {
    sitemapFilenames.forEach(sitemapFilename => {
      test(`${sitemapFilename} is valid`, () => {
        try {
          const sitemap = readFileSync(join(distPath, sitemapFilename), 'utf8');
          const result = XMLValidator.validate(sitemap);

          if (result.err) {
            throw new Error(
              `${sitemapFilename} is not valid: ${result.err.msg} at line ${result.err.line}, column ${result.err.col}`
            );
          }

          expect(result).toBeTruthy();
        } catch (err) {
          // Throw error again to fail test if a sitemap cannot be parsed correctly
          throw new Error(err, { cause: err });
        }
      });
    });
  });

  describe('Posts sitemap', () => {
    describe('Last modified date', () => {
      test('All posts should have a valid last modified date', () => {
        const postsSitemap = readFileSync(
          join(distPath, 'sitemap-posts.xml'),
          'utf8'
        );
        const postsSitemapDoc = xmlParser.parse(postsSitemap);
        const postURLNodes = postsSitemapDoc.urlset.url;

        // Ensure all posts have a last modified date
        expect(postURLNodes.every(node => node.lastmod)).toBeTruthy();

        // Ensure all last modified dates are valid dates
        expect(
          postURLNodes.every(node => !isNaN(new Date(node.lastmod)))
        ).toBeTruthy();
      });
    });
  });
});
