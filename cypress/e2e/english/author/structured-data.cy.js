describe('Author page structured data (JSON-LD)', () => {
  const commonExpectedJsonLd = require('../../../fixtures/common-expected-json-ld.json');
  const authorExpectedJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    sameAs: ['https://www.freecodecamp.org', 'https://twitter.com/ossia'], // Site, Twitter
    name: 'Quincy Larson',
    url: 'http://localhost:8080/news/author/quincylarson/',
    image: {
      '@type': 'ImageObject',
      url: 'http://localhost:3010/content/images/2022/02/banner.png',
      width: 1500,
      height: 500
    },
    description: 'The teacher who founded freeCodeCamp.org.'
  };
  let jsonLdObj;

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
      commonExpectedJsonLd.mainEntityOfPage
    );
  });
});
