describe('Landing structured data (JSON-LD)', () => {
  const commonExpectedJsonLd = require('../../../fixtures/common-expected-json-ld.json');
  let jsonLdObj;

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
    expect(jsonLdObj.url).to.equal(commonExpectedJsonLd.url);
    expect(jsonLdObj.description).to.equal(commonExpectedJsonLd.description);
  });

  it('matches the expected publisher values', () => {
    expect(jsonLdObj.publisher).to.deep.equal(commonExpectedJsonLd.publisher);
  });

  it('matches the expected image values', () => {
    expect(jsonLdObj.image).to.deep.equal(commonExpectedJsonLd.image);
  });

  it('matches the expected mainEntityOfPage values', () => {
    expect(jsonLdObj.mainEntityOfPage).to.deep.equal(
      commonExpectedJsonLd.mainEntityOfPage
    );
  });
});
