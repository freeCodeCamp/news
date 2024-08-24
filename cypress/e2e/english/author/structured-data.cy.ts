const commonExpectedJsonLd = require('../../../fixtures/common-expected-json-ld.json');
const ghostAuthorExpectedJsonLd = {
  '@type': 'Person',
  sameAs: ['https://www.freecodecamp.org', 'https://twitter.com/ossia'], // Site, Twitter
  name: 'Quincy Larson',
  url: 'http://localhost:8080/news/author/quincylarson/',
  // Custom banner image
  image: {
    '@type': 'ImageObject',
    url: 'http://localhost:3010/content/images/2022/02/banner.png',
    width: 1500,
    height: 500
  },
  description: 'The teacher who founded freeCodeCamp.org.'
};
const hashnodeAuthorExpectedJsonLd = {
  '@type': 'Person',
  sameAs: ['https://twitter.com/abbeyrenn'], // Twitter
  name: 'Abigail Rennemeyer',
  url: 'http://localhost:8080/news/author/abbeyrenn/',
  description:
    'I love editing articles and working with contributors. I also love the outdoors and good food.\n'
};
let jsonLdObj;

describe('Author page structured data (JSON-LD)', () => {
  context('Ghost sourced authors', () => {
    beforeEach(() => {
      cy.visit('/author/quincylarson/');

      jsonLdObj = cy
        .get('head script[type="application/ld+json"]')
        .then($script => {
          jsonLdObj = JSON.parse($script.text());
        });
    });

    it('matches the expected base values', () => {
      expect(jsonLdObj['@context']).to.equal(commonExpectedJsonLd['@context']);
      expect(jsonLdObj['@type']).to.equal(ghostAuthorExpectedJsonLd['@type']);
      expect(jsonLdObj.sameAs).to.deep.equal(ghostAuthorExpectedJsonLd.sameAs);
      expect(jsonLdObj.name).to.equal(ghostAuthorExpectedJsonLd.name);
      expect(jsonLdObj.url).to.equal(ghostAuthorExpectedJsonLd.url);
      expect(jsonLdObj.description).to.equal(
        ghostAuthorExpectedJsonLd.description
      );
    });

    it('matches the expected image values', () => {
      expect(jsonLdObj.image).to.deep.equal(ghostAuthorExpectedJsonLd.image);
    });

    it('matches the expected mainEntityOfPage values', () => {
      expect(jsonLdObj.mainEntityOfPage).to.deep.equal(
        commonExpectedJsonLd.mainEntityOfPage
      );
    });
  });

  context('Hashnode sourced authors', () => {
    beforeEach(() => {
      cy.visit('/author/abbeyrenn/');

      jsonLdObj = cy
        .get('head script[type="application/ld+json"]')
        .then($script => {
          jsonLdObj = JSON.parse($script.text());
        });
    });

    it('matches the expected base values', () => {
      expect(jsonLdObj['@context']).to.equal(commonExpectedJsonLd['@context']);
      expect(jsonLdObj['@type']).to.equal(
        hashnodeAuthorExpectedJsonLd['@type']
      );
      expect(jsonLdObj.sameAs).to.deep.equal(
        hashnodeAuthorExpectedJsonLd.sameAs
      );
      expect(jsonLdObj.name).to.equal(hashnodeAuthorExpectedJsonLd.name);
      expect(jsonLdObj.url).to.equal(hashnodeAuthorExpectedJsonLd.url);
      expect(jsonLdObj.description).to.equal(
        hashnodeAuthorExpectedJsonLd.description
      );
    });

    it('matches the expected mainEntityOfPage values', () => {
      expect(jsonLdObj.mainEntityOfPage).to.deep.equal(
        commonExpectedJsonLd.mainEntityOfPage
      );
    });
  });
});
