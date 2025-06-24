import commonExpectedJsonLd from '../../../fixtures/common-expected-json-ld.json';
let jsonLdObj;

describe('Landing structured data (JSON-LD – Ghost sourced)', () => {
  before(() => {
    // Update baseUrl to include current language
    Cypress.config('baseUrl', 'http://localhost:8080/espanol/news/');
  });

  beforeEach(() => {
    cy.visit('/');

    jsonLdObj = cy
      .get('head script[type="application/ld+json"]')
      .then($script => {
        jsonLdObj = JSON.parse($script.text());
      });
  });

  it('matches the expected base values', () => {
    expect(jsonLdObj['@context']).to.equal(commonExpectedJsonLd['@context']);
    expect(jsonLdObj['@type']).to.equal(commonExpectedJsonLd['@type']);
    expect(jsonLdObj.url).to.equal(commonExpectedJsonLd.espanol.url);
    expect(jsonLdObj.description).to.equal(
      commonExpectedJsonLd.espanol.description
    );
  });

  it('matches the expected publisher values', () => {
    expect(jsonLdObj.publisher).to.deep.equal(
      commonExpectedJsonLd.espanol.publisher
    );
  });

  it('matches the expected image values', () => {
    expect(jsonLdObj.image).to.deep.equal(commonExpectedJsonLd.image);
  });

  it('matches the expected mainEntityOfPage values', () => {
    expect(jsonLdObj.mainEntityOfPage).to.deep.equal(
      commonExpectedJsonLd.espanol.mainEntityOfPage
    );
  });
});
