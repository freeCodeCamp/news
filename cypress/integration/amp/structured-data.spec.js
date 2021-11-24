describe('Amp structured data (JSON-LD)', () => {
  let jsonLdObj;
  const jsonLdExpected = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    publisher: {
      '@type': 'Organization',
      'name': 'freeCodeCamp.org',
      'url': 'http://localhost:8080/news/',
      'logo': {
          '@type': 'ImageObject',
          'url': 'https://cdn.freecodecamp.org/platform/universal/fcc_primary.svg',
          'width': 2100,
          'height': 240
      }
    },
    author: {
      '@type': 'Person',
      name: 'Quincy Larson',
      image: {
        '@type': 'ImageObject',
        url: 'https://www.freecodecamp.org/news/content/images/2021/03/Quincy-Larson-photo.jpg',
        width: 2000,
        height: 2000,
      },
      url: 'http://localhost:8080/news/author/quincylarson/',
      sameAs: ['https://www.freecodecamp.org', 'https://twitter.com/ossia'],
    },
    headline:
      'We&#x27;re Building New Courses on Rust and Python + the Replit.web Framework',
    url: 'http://localhost:8080/news/announcing-rust-course-replit-web/',
    datePublished: '2021-08-23T17:03:24.000Z',
    dateModified: '2021-08-23T17:03:24.000Z',
    image: {
      '@type': 'ImageObject',
      url: 'https://www.freecodecamp.org/news/content/images/2021/08/sean-lim-NPlv2pkYoUA-unsplash--2-.jpg',
      width: 1920,
      height: 1280,
    },
    keywords: 'freeCodeCamp',
    description:
      'As you may know, I&#x27;ve been a fan of Replit since way back in 2012. I used early\nversions of the website when I was learning to code. \n\nFor me, Replit was a place to code my solutions for Project Euler problems, and\nto practice my Python and JavaScript skills.\n\nOver the past decade, Replit has come a long way [https://replit.com/]. Their\nteam has evolved the coding platform into a full-blown multiplayer IDE where you\ncan collaborate with other developers, and host your apps for free.\n\nOne way a l',
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': 'http://localhost:8080/news/',
    },
  };
    

  before(() => {
    cy.visit('/announcing-rust-course-replit-web/amp');

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
