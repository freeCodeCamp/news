import commonExpectedJsonLd from '../../../fixtures/common-expected-json-ld.json';
const pageExpectedJsonLd = {
  '@type': 'Article',
  author: {
    '@type': 'Person',
    name: 'freeCodeCamp.org',
    image: {
      '@type': 'ImageObject',
      url: 'http://localhost:3030/content/images/2022/02/freecodecamp-org-gravatar.jpeg',
      width: 250,
      height: 250
    },
    url: 'http://localhost:8080/espanol/news/author/freecodecamp/',
    sameAs: [
      'https://www.freecodecamp.org',
      'https://www.facebook.com/freecodecamp',
      'https://x.com/freecodecamp'
    ]
  },
  headline: 'Gracias por ser un partidario',
  url: 'http://localhost:8080/espanol/news/gracias-por-ser-un-partidario/',
  datePublished: '2024-09-13T10:11:05.000Z',
  dateModified: '2024-09-13T10:11:05.000Z',
  image: {
    '@type': 'ImageObject',
    url: 'https://cdn.freecodecamp.org/platform/universal/fcc_meta_1920X1080-indigo.png',
    width: 1920,
    height: 1080
  },
  description:
    'freeCodeCamp es una ONG educativa muy eficiente. Solo este año, hemos brindado\nmillones de horas de educación gratuita a personas de todo el mundo.\n\nCon el presupuesto operativo actual de nuestra organización benéfica, cada dólar\nque donas a freeCodeCamp se traduce en 50 horas de educación tecnológica.\n\nCuando donas a freeCodeCamp, ayudas a las personas a aprender nuevas habilidades\ny a mantener a sus familias.\n\nTambién nos ayudas a crear nuevos recursos para que tú y tu familia los utilicen\npar'
};
let jsonLdObj;

describe('Page structured data (JSON-LD – Ghost sourced)', () => {
  before(() => {
    // Update baseUrl to include current language
    Cypress.config('baseUrl', 'http://localhost:8080/espanol/news/');
  });

  beforeEach(() => {
    cy.visit('/gracias-por-ser-un-partidario/');

    jsonLdObj = cy
      .get('head script[type="application/ld+json"]')
      .then($script => {
        jsonLdObj = JSON.parse($script.text());
      });
  });

  it('matches the expected base values', () => {
    expect(jsonLdObj['@context']).to.equal(commonExpectedJsonLd['@context']);
    expect(jsonLdObj['@type']).to.equal(pageExpectedJsonLd['@type']);
    expect(jsonLdObj.url).to.equal(pageExpectedJsonLd.url);
    expect(jsonLdObj.datePublished).to.equal(pageExpectedJsonLd.datePublished);
    expect(jsonLdObj.dateModified).to.equal(pageExpectedJsonLd.dateModified);
    expect(jsonLdObj.description).to.equal(pageExpectedJsonLd.description);
    expect(jsonLdObj.headline).to.equal(pageExpectedJsonLd.headline);
  });

  it('matches the expected publisher values', () => {
    expect(jsonLdObj.publisher).to.deep.equal(
      commonExpectedJsonLd.espanol.publisher
    );
  });

  it('matches the expected image values', () => {
    expect(jsonLdObj.image).to.deep.equal(pageExpectedJsonLd.image);
  });

  it('matches the expected mainEntityOfPage values', () => {
    expect(jsonLdObj.mainEntityOfPage).to.deep.equal(
      commonExpectedJsonLd.espanol.mainEntityOfPage
    );
  });

  it('matches the expected author values', () => {
    expect(jsonLdObj.author).to.deep.equal(pageExpectedJsonLd.author);
  });
});
