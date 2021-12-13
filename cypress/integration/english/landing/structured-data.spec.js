describe('Landing structured data (JSON-LD)', () => {
  let jsonLdObj;
  const commonStructuredData = require('../../../fixtures/common-structured-data.json');

  before(() => {
    cy.visit('/');

    jsonLdObj = cy.get('head script[type="application/ld+json"]').then(($script) => {
      jsonLdObj = JSON.parse($script.text());
    });
  });

  it('matches the expected base values', () => {
    expect(jsonLdObj['@context']).to.equal(commonStructuredData['@context']);
    expect(jsonLdObj['@type']).to.equal(commonStructuredData['@type']);
    expect(jsonLdObj.url).to.equal(commonStructuredData.url);
    expect(jsonLdObj.description).to.equal(commonStructuredData.description);
  });

  it('matches the expected publisher values', () => {
    expect(jsonLdObj.publisher).to.deep.equal(commonStructuredData.publisher);
  });

  it('matches the expected image values', () => {
    expect(jsonLdObj.image).to.deep.equal(commonStructuredData.image);
  });

  it('matches the expected mainEntityOfPage values', () => {
    expect(jsonLdObj.mainEntityOfPage).to.deep.equal(commonStructuredData.mainEntityOfPage);
  });
});
