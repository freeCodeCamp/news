describe('Landing structured data (JSON-LD)', () => {
  let jsonLdObj;
  const jsonLdExpected = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    publisher: {
      '@type': 'Organization',
      name: 'freeCodeCamp.org',
      url: 'http://localhost:8080/news/',
      logo: {
        '@type': 'ImageObject',
        url: 'https://cdn.freecodecamp.org/platform/universal/fcc_primary.svg',
        width: 2100,
        height: 240
      }
    },
    image: {
      '@type': 'ImageObject',
      url: 'https://cdn.freecodecamp.org/platform/universal/fcc_meta_1920X1080-indigo.png',
      width: 1920,
      height: 1080
    },
    url: 'http://localhost:8080/news/',
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': 'http://localhost:8080/news/'
    },
    description: 'Browse thousands of programming tutorials written by experts. Learn Web Development, Data Science, DevOps, Security, and get developer career advice.'
  }

  before(() => {
    cy.visit('/');

    jsonLdObj = cy.get('head script[type="application/ld+json"]').then(($script) => {
      jsonLdObj = JSON.parse($script.text());
    });
  });

  it('matches the expected base values', () => {
    expect(jsonLdObj['@context']).to.equal(jsonLdExpected['@context']);
    expect(jsonLdObj['@type']).to.equal(jsonLdExpected['@type']);
    expect(jsonLdObj.url).to.equal(jsonLdExpected.url);
    expect(jsonLdObj.description).to.equal(jsonLdExpected.description);
  });

  it('matches the expected publisher values', () => {
    expect(jsonLdObj.publisher).to.deep.equal(jsonLdExpected.publisher);
  });

  it('matches the expected image values', () => {
    expect(jsonLdObj.image).to.deep.equal(jsonLdExpected.image);
  });

  it('matches the expected mainEntityOfPage values', () => {
    expect(jsonLdObj.mainEntityOfPage).to.deep.equal(jsonLdExpected.mainEntityOfPage);
  });
});
