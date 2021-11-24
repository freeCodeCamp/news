describe('Tag page structured data (JSON-LD)', () => {
  let jsonLdObj;
  const jsonLdExpected = {
    '@context': 'https://schema.org',
    '@type': 'Series',
    publisher: {
      '@type': 'Organization',
      name: 'freeCodeCamp.org',
      url: 'http://localhost:8080/news/',
      logo: {
        '@type': 'ImageObject',
        url: 'https://cdn.freecodecamp.org/platform/universal/fcc_primary.svg',
        width: 2100,
        height: 240,
      },
    },
    url: 'http://localhost:8080/news/tag/freecodecamp/',
    name: 'freeCodeCamp',
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': 'http://localhost:8080/news/',
    },
  };
    

  before(() => {
    cy.visit('/tag/freecodecamp');

    jsonLdObj = cy.get('head script[type="application/ld+json"]').then(($script) => {
      jsonLdObj = JSON.parse($script.text());
    });
  });

  it('matches the expected base values', () => {
    expect(jsonLdObj['@context']).to.equal(jsonLdExpected['@context']);
    expect(jsonLdObj['@type']).to.equal(jsonLdExpected['@type']);
    expect(jsonLdObj.url).to.equal(jsonLdExpected.url);
    expect(jsonLdObj.name).to.equal(jsonLdExpected.name);
  });

  it('matches the expected publisher values', () => {
    expect(jsonLdObj.publisher).to.deep.equal(jsonLdExpected.publisher);
  });

  it('matches the expected mainEntityOfPage values', () => {
    expect(jsonLdObj.mainEntityOfPage).to.deep.equal(jsonLdExpected.mainEntityOfPage);
  });
});
