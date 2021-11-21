describe('Page structured data (JSON-LD)', () => {
  let jsonLdObj;
  const jsonLdExpected = {
    '@context': 'https://schema.org',
    '@type': 'Article',
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
    author: {
      '@type': 'Person',
      name: 'freeCodeCamp.org',
      image: {
        '@type': 'ImageObject',
        url: 'https://www.freecodecamp.org/news/content/images/2021/05/freecodecamp-org-gravatar.jpeg',
        width: 250,
        height: 250,
      },
      url: 'http://localhost:8080/news/author/freecodecamp/',
      sameAs: [],
    },
    headline:
      'Please check your email for a donation receipt. Forward it to donors@freecodecamp.org.',
    url: 'http://localhost:8080/news/thank-you-for-donating/',
    datePublished: '2020-03-16T17:03:46.000Z',
    dateModified: '2021-11-18T09:16:21.000Z',
    image: {
      '@type': 'ImageObject',
      url: 'https://www.freecodecamp.org/news/content/images/2020/03/fcc-banner.jpg',
      width: 1500,
      height: 500,
    },
    description:
      'Once you&amp;amp;#39;ve forwarded this receipt, we will award you with your donor badge on your freeCodeCamp profile. We will also turn off donation prompts for you. Thank you again for supporting our nonprofit. freeCodeCamp is a highly-efficient education NGO. This year alone, we&amp;amp;#39;ve provided million hours of free education to',
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': 'http://localhost:8080/news/',
    },
  };    

  before(() => {
    cy.visit('/thank-you-for-donating');

    jsonLdObj = cy.get('head script[type="application/ld+json"]').then(($script) => {
      jsonLdObj = JSON.parse($script.text());
    });
  });

  it('matches the expected base values', () => {
    expect(jsonLdObj['@context']).to.equal(jsonLdExpected['@context']);
    expect(jsonLdObj['@type']).to.equal(jsonLdExpected['@type']);
    expect(jsonLdObj.url).to.equal(jsonLdExpected.url);
    expect(jsonLdObj.datePublished).to.equal(jsonLdExpected.datePublished);
    expect(jsonLdObj.dateModified).to.equal(jsonLdExpected.dateModified);
    expect(jsonLdObj.description).to.equal(jsonLdExpected.description);
    expect(jsonLdObj.headline).to.equal(jsonLdExpected.headline);
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

  it('matches the expected author values', () => {
    expect(jsonLdObj.author).to.deep.equal(jsonLdExpected.author);
  });
});
