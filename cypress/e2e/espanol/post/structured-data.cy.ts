const commonExpectedJsonLd = require('../../../fixtures/common-expected-json-ld.json');
const postExpectedJsonLd = {
  '@type': 'Article',
  author: {
    '@type': 'Person',
    name: 'Rafael D. Hernandez',
    image: {
      '@type': 'ImageObject',
      url: 'http://localhost:3030/content/images/2022/02/rafael-photo.jpeg',
      width: 2000,
      height: 2150
    },
    url: 'http://localhost:8080/espanol/news/author/rafael/',
    sameAs: ['https://twitter.com/RafaelDavisH']
  },
  headline:
    'Cómo funciona el operador de signo de interrogación (?) en JavaScript',
  url: 'http://localhost:8080/espanol/news/como-funciona-el-operado-de-signo-de-interrogacion-javascript/',
  datePublished: '2022-02-18T03:06:29.000Z',
  dateModified: '2022-02-19T12:39:23.000Z',
  image: {
    '@type': 'ImageObject',
    url: 'https://www.freecodecamp.org/espanol/news/content/images/2022/02/Pink-Cute-Chic-Vintage-90s-Virtual-Trivia-Quiz-Presentations--5--1.png',
    width: 1000,
    height: 563
  },
  keywords: 'JavaScript',
  description:
    'Artículo original escrito por: Nishant Kumar\n[https://www.freecodecamp.org/news/author/nishant-kumar/]\nArtículo original: How the Question Mark (?) Operator Works in JavaScript\n[https://www.freecodecamp.org/news/how-the-question-mark-works-in-javascript/]\nTraducido y adaptado por: Rafael D. Hernandez [/espanol/news/author/rafael/]\n\nEl operador de signo de interrogación o condicional, representado por a ?, es\nuna de las características más potentes de JavaScript. El operador ? se usa en\nsentencia'
};
let jsonLdObj;

describe('Post structured data (JSON-LD – Ghost sourced)', () => {
  before(() => {
    // Update baseUrl to include current language
    Cypress.config('baseUrl', 'http://localhost:8080/espanol/news/');
  });

  beforeEach(() => {
    cy.visit('/como-funciona-el-operado-de-signo-de-interrogacion-javascript/');

    jsonLdObj = cy
      .get('head script[type="application/ld+json"]')
      .then($script => {
        jsonLdObj = JSON.parse($script.text());
      });
  });

  it('matches the expected base values', () => {
    expect(jsonLdObj['@context']).to.equal(commonExpectedJsonLd['@context']);
    expect(jsonLdObj['@type']).to.equal(postExpectedJsonLd['@type']);
    expect(jsonLdObj.url).to.equal(postExpectedJsonLd.url);
    expect(jsonLdObj.datePublished).to.equal(postExpectedJsonLd.datePublished);
    expect(jsonLdObj.dateModified).to.equal(postExpectedJsonLd.dateModified);
    expect(jsonLdObj.description).to.equal(postExpectedJsonLd.description);
    expect(jsonLdObj.headline).to.equal(postExpectedJsonLd.headline);
    expect(jsonLdObj.keywords).to.equal(postExpectedJsonLd.keywords);
  });

  it('matches the expected publisher values', () => {
    expect(jsonLdObj.publisher).to.deep.equal(
      commonExpectedJsonLd.espanol.publisher
    );
  });

  it('matches the expected image values', () => {
    expect(jsonLdObj.image).to.deep.equal(postExpectedJsonLd.image);
  });

  it('matches the expected mainEntityOfPage values', () => {
    expect(jsonLdObj.mainEntityOfPage).to.deep.equal(
      commonExpectedJsonLd.espanol.mainEntityOfPage
    );
  });

  it('matches the expected author values', () => {
    expect(jsonLdObj.author).to.deep.equal(postExpectedJsonLd.author);
  });
});
