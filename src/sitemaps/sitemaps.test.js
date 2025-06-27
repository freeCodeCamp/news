import gracefulFS from 'graceful-fs';
import libxmljs from 'libxmljs';
import { join } from 'path';

const { readFileSync } = gracefulFS;
const { parseXml } = libxmljs;

const sitemapFilenames = [
  'sitemap.xml',
  'sitemap-pages.xml',
  'sitemap-posts.xml',
  'sitemap-tags.xml',
  'sitemap-authors.xml'
];
const distPath = join(import.meta.dirname, '../../dist');

describe('Sitemap tests:', () => {
  describe('Validate sitemaps against schemas', () => {
    sitemapFilenames.forEach(sitemapFilename => {
      test(`${sitemapFilename} is valid`, () => {
        try {
          const sitemap = readFileSync(join(distPath, sitemapFilename), 'utf8');
          const schemaFilename =
            sitemapFilename === 'sitemap.xml' ? 'siteindex.xsd' : 'sitemap.xsd';
          const schema = readFileSync(
            join(import.meta.dirname, `./schemas/${schemaFilename}`),
            'utf8'
          );
          const sitemapDoc = parseXml(sitemap);
          const schemaDoc = parseXml(schema);
          const isValid = sitemapDoc.validate(schemaDoc);

          if (!isValid) {
            throw new Error(
              `${sitemapFilename} is not valid: ${sitemapDoc.validationErrors}`
            );
          }

          expect(isValid).toBeTruthy();
        } catch (err) {
          // Throw error again to fail test if a sitemap cannot be parsed correctly
          throw new Error(err);
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
        const postsSitemapDoc = parseXml(postsSitemap);
        const postURLNodes = postsSitemapDoc
          .root()
          .childNodes()
          .filter(node => {
            return node.name() === 'url';
          });
        const lastmodDates = postURLNodes
          .map(node => {
            return node
              .childNodes()
              .filter(node => node.name() === 'lastmod')
              .map(node => node.text());
          })
          .flat();

        // Ensure all posts have a last modified date
        expect(lastmodDates).toHaveLength(postURLNodes.length);

        // Ensure all last modified dates are valid dates
        lastmodDates.forEach(date => {
          expect(new Date(date)).toBeInstanceOf(Date);
        });
      });
    });
  });
});
