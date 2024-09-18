const commonExpectedJsonLd = require('../../../fixtures/common-expected-json-ld.json');
const tagExpectedJsonLd = {
  '@type': 'Series',
  url: 'http://localhost:8080/news/tag/freecodecamp/',
  name: 'freeCodeCamp.org'
};
let jsonLdObj;

describe('Tag page structured data (JSON-LD – Hashnode sourced)', () => {
  beforeEach(() => {
    cy.visit('/tag/freecodecamp/');

    jsonLdObj = cy
      .get('head script[type="application/ld+json"]')
      .then($script => {
        jsonLdObj = JSON.parse($script.text());
      });
  });

  it('matches the expected base values', () => {
    expect(jsonLdObj['@context']).to.equal(commonExpectedJsonLd['@context']);
    expect(jsonLdObj['@type']).to.equal(tagExpectedJsonLd['@type']);
    expect(jsonLdObj.url).to.equal(tagExpectedJsonLd.url);
    expect(jsonLdObj.name).to.equal(tagExpectedJsonLd.name);
  });

  it('matches the expected publisher values', () => {
    expect(jsonLdObj.publisher).to.deep.equal(
      commonExpectedJsonLd.english.publisher
    );
  });

  it('matches the expected mainEntityOfPage values', () => {
    expect(jsonLdObj.mainEntityOfPage).to.deep.equal(
      commonExpectedJsonLd.english.mainEntityOfPage
    );
  });
});
