describe('Tag page structured data (JSON-LD)', () => {
  const commonStructuredData = require('../../../fixtures/common-structured-data.json');
  const tagStructuredData = {
    '@type': 'Series',
    url: 'http://localhost:8080/news/tag/freecodecamp/',
    name: 'freeCodeCamp',
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': 'http://localhost:8080/news/',
    },
  };
  let jsonLdObj;
    

  before(() => {
    cy.visit('/tag/freecodecamp');

    jsonLdObj = cy.get('head script[type="application/ld+json"]').then(($script) => {
      jsonLdObj = JSON.parse($script.text());
    });
  });

  it('matches the expected base values', () => {
    expect(jsonLdObj['@context']).to.equal(commonStructuredData['@context']);
    expect(jsonLdObj['@type']).to.equal(tagStructuredData['@type']);
    expect(jsonLdObj.url).to.equal(tagStructuredData.url);
    expect(jsonLdObj.name).to.equal(tagStructuredData.name);
  });

  it('matches the expected publisher values', () => {
    expect(jsonLdObj.publisher).to.deep.equal(commonStructuredData.publisher);
  });

  it('matches the expected mainEntityOfPage values', () => {
    expect(jsonLdObj.mainEntityOfPage).to.deep.equal(commonStructuredData.mainEntityOfPage);
  });
});
