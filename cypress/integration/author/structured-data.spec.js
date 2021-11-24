describe('Author page structured data (JSON-LD)', () => {
  let jsonLdObj;
  const jsonLdExpected = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    sameAs: ['https://www.freecodecamp.org', 'https://twitter.com/ossia'], // Site, Twitter
    name: 'Quincy Larson',
    url: 'http://localhost:8080/news/author/quincylarson/',
    image: {
      '@type': 'ImageObject',
      url: 'https://www.freecodecamp.org/news/content/images/2019/07/banner.png',
      width: 1500,
      height: 500,
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': 'http://localhost:8080/news/',
    },
    description: 'The teacher who founded freeCodeCamp.org.',
  };  

  before(() => {
    cy.visit('/author/quincylarson');

    jsonLdObj = cy.get('head script[type="application/ld+json"]').then(($script) => {
      jsonLdObj = JSON.parse($script.text());
    });
  });

  it('matches the expected base values', () => {
    expect(jsonLdObj['@context']).to.equal(jsonLdExpected['@context']);
    expect(jsonLdObj['@type']).to.equal(jsonLdExpected['@type']);
    expect(jsonLdObj.sameAs).to.deep.equal(jsonLdExpected.sameAs);
    expect(jsonLdObj.name).to.equal(jsonLdExpected.name);
    expect(jsonLdObj.url).to.equal(jsonLdExpected.url);
    expect(jsonLdObj.description).to.equal(jsonLdExpected.description);
  });

  it('matches the expected image values', () => {
    expect(jsonLdObj.image).to.deep.equal(jsonLdExpected.image);
  });

  it('matches the expected mainEntityOfPage values', () => {
    expect(jsonLdObj.mainEntityOfPage).to.deep.equal(jsonLdExpected.mainEntityOfPage);
  });
});
