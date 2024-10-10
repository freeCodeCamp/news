const commonExpectedJsonLd = require('../../../fixtures/common-expected-json-ld.json');
const authorExpectedJsonLd = {
  '@type': 'Person',
  sameAs: ['https://x.com/abbeyrenn'], // X / Twitter
  name: 'Abigail Rennemeyer',
  url: 'http://localhost:8080/news/author/abbeyrenn/',
  description:
    'I love editing articles and working with contributors. I also love the outdoors and good food.\n'
};
let jsonLdObj;

describe('Author page structured data (JSON-LD – Hashnode sourced)', () => {
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
    expect(jsonLdObj['@type']).to.equal(authorExpectedJsonLd['@type']);
    expect(jsonLdObj.sameAs).to.deep.equal(authorExpectedJsonLd.sameAs);
    expect(jsonLdObj.name).to.equal(authorExpectedJsonLd.name);
    expect(jsonLdObj.url).to.equal(authorExpectedJsonLd.url);
    expect(jsonLdObj.description).to.equal(authorExpectedJsonLd.description);
  });

  it('matches the expected mainEntityOfPage values', () => {
    expect(jsonLdObj.mainEntityOfPage).to.deep.equal(
      commonExpectedJsonLd.english.mainEntityOfPage
    );
  });
});
