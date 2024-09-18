const commonExpectedJsonLd = require('../../../fixtures/common-expected-json-ld.json');
const authorExpectedJsonLd = {
  '@type': 'Person',
  sameAs: ['https://twitter.com/RafaelDavisH'], // Twitter
  name: 'Rafael D. Hernandez',
  url: 'http://localhost:8080/espanol/news/author/rafael/',
  // Custom banner image
  image: {
    '@type': 'ImageObject',
    url: 'http://localhost:3030/content/images/2024/09/fccbg_25e868b401.png',
    width: 1500,
    height: 500
  },
  description:
    'Web Developer | Global Language Translations Lead at @freeCodeCamp'
};
let jsonLdObj;

describe('Author page structured data (JSON-LD – Ghost sourced)', () => {
  before(() => {
    // Update baseUrl to include current language
    Cypress.config('baseUrl', 'http://localhost:8080/espanol/news/');
  });

  beforeEach(() => {
    cy.visit('/author/rafael/');

    jsonLdObj = cy
      .get('head script[type="application/ld+json"]')
      .then($script => {
        jsonLdObj = JSON.parse($script.text());
      });
  });

  it('matches the expected base values', () => {
    expect(jsonLdObj['@context']).to.equal(commonExpectedJsonLd['@context']);
    expect(jsonLdObj['@type']).to.equal(authorExpectedJsonLd['@type']);
    expect(jsonLdObj.sameAs).to.deep.equal(authorExpectedJsonLd.sameAs);
    expect(jsonLdObj.name).to.equal(authorExpectedJsonLd.name);
    expect(jsonLdObj.url).to.equal(authorExpectedJsonLd.url);
    expect(jsonLdObj.description).to.equal(authorExpectedJsonLd.description);
  });

  it('matches the expected image values', () => {
    expect(jsonLdObj.image).to.deep.equal(authorExpectedJsonLd.image);
  });

  it('matches the expected mainEntityOfPage values', () => {
    expect(jsonLdObj.mainEntityOfPage).to.deep.equal(
      commonExpectedJsonLd.espanol.mainEntityOfPage
    );
  });
});
