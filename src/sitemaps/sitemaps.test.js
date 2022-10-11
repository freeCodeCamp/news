const libxmljs = require('libxmljs');
const fs = require('fs');
const { join } = require('path');

const sitemapFilenames = [
  'sitemap.xml',
  'sitemap-pages.xml',
  'sitemap-posts.xml',
  'sitemap-tags.xml',
  'sitemap-authors.xml'
];
const distPath = join(__dirname, '../../dist');

describe('Sitemap tests:', () => {
  describe('Validate sitemaps against schemas', () => {
    sitemapFilenames.forEach(sitemapFilename => {
      test(`${sitemapFilename} is valid`, () => {
        try {
          const sitemap = fs.readFileSync(
            join(distPath, sitemapFilename),
            'utf8'
          );
          const schemaFilename =
            sitemapFilename === 'sitemap.xml' ? 'siteindex.xsd' : 'sitemap.xsd';
          const schema = fs.readFileSync(
            join(__dirname, `./schemas/${schemaFilename}`),
            'utf8'
          );
          const sitemapDoc = libxmljs.parseXml(sitemap);
          const schemaDoc = libxmljs.parseXml(schema);
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
});
