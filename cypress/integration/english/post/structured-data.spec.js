describe('Post structured data (JSON-LD)', () => {
  let jsonLdObj;
  const commonStructuredData = require('../../../fixtures/common-structured-data.json');
  const postStructuredData = {
    '@type': 'Article',
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
      'As you may know, I&#x27;ve been a fan of Replit since way back in 2012. I used early\nversions of the website when I was learning to code. \n\nFor me, Replit was a place to code my solutions for Project Euler problems, and\nto practice my Python and JavaScript skills.\n\nOver the past decade, Replit has come a long way [https://replit.com/]. Their\nteam has evolved the coding platform into a full-blown multiplayer IDE where you\ncan collaborate with other developers, and host your apps for free.\n\nOne way a l'
  };

  before(() => {
    cy.visit('/announcing-rust-course-replit-web');

    jsonLdObj = cy.get('head script[type="application/ld+json"]').then(($script) => {
      jsonLdObj = JSON.parse($script.text());
    });
  });

  it('matches the expected base values', () => {
    expect(jsonLdObj['@context']).to.equal(commonStructuredData['@context']);
    expect(jsonLdObj['@type']).to.equal(postStructuredData['@type']);
    expect(jsonLdObj.url).to.equal(postStructuredData.url);
    expect(jsonLdObj.datePublished).to.equal(postStructuredData.datePublished);
    expect(jsonLdObj.dateModified).to.equal(postStructuredData.dateModified);
    expect(jsonLdObj.description).to.equal(postStructuredData.description);
    expect(jsonLdObj.headline).to.equal(postStructuredData.headline);
    expect(jsonLdObj.keywords).to.equal(postStructuredData.keywords);
  });

  it('matches the expected publisher values', () => {
    expect(jsonLdObj.publisher).to.deep.equal(commonStructuredData.publisher);
  });

  it('matches the expected image values', () => {
    expect(jsonLdObj.image).to.deep.equal(postStructuredData.image);
  });

  it('matches the expected mainEntityOfPage values', () => {
    expect(jsonLdObj.mainEntityOfPage).to.deep.equal(commonStructuredData.mainEntityOfPage);
  });

  it('matches the expected author values', () => {
    expect(jsonLdObj.author).to.deep.equal(postStructuredData.author);
  });
});
