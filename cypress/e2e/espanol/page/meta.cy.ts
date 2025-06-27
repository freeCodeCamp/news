import commonExpectedMeta from '../../../fixtures/common-expected-meta.json';
const ghostPageExpectedMeta = {
  title: 'Gracias por ser un partidario',
  url: 'http://localhost:8080/espanol/news/gracias-por-ser-un-partidario/',
  excerpt:
    'freeCodeCamp es una ONG educativa muy eficiente. Solo este año, hemos brindado millones de horas de educación gratuita a personas de todo el mundo. Con el presupuesto operativo actual de nuestra organización benéfica, cada dólar que donas a freeCodeCamp se traduce en 50 horas de educación tecnológica. Cuando donas a'
};

describe('Page metadata (Ghost sourced)', () => {
  before(() => {
    // Update baseUrl to include current language
    Cypress.config('baseUrl', 'http://localhost:8080/espanol/news/');
  });

  beforeEach(() => {
    cy.visit('/gracias-por-ser-un-partidario/');
  });

  it('<title>', () => {
    cy.title().should('eq', ghostPageExpectedMeta.title);
  });

  it('<meta> description', () => {
    cy.get('head meta[name="description"]').should(
      'have.attr',
      'content',
      ghostPageExpectedMeta.excerpt
    );
  });

  it('<link> canonical', () => {
    cy.get('head link[rel="canonical"]').should(
      'have.attr',
      'href',
      ghostPageExpectedMeta.url
    );
  });

  it('<meta> generator', () => {
    cy.get('head meta[name="generator"]').should(
      'have.attr',
      'content',
      commonExpectedMeta.generator
    );
  });

  it('<meta> og:site_name', () => {
    cy.get('head meta[property="og:site_name"]').should(
      'have.attr',
      'content',
      commonExpectedMeta.siteName
    );
  });

  it('<meta> og:type', () => {
    cy.get('head meta[property="og:type"]').should(
      'have.attr',
      'content',
      'article'
    );
  });

  it('<meta> og:title', () => {
    cy.get('head meta[property="og:title"]').should(
      'have.attr',
      'content',
      ghostPageExpectedMeta.title
    );
  });

  it('<meta> og:description', () => {
    cy.get('head meta[property="og:description"]').should(
      'have.attr',
      'content',
      ghostPageExpectedMeta.excerpt
    );
  });

  it('<meta> og:url', () => {
    cy.get('head meta[property="og:url"]').should(
      'have.attr',
      'content',
      ghostPageExpectedMeta.url
    );
  });

  it('<meta> article:published_time', () => {
    cy.get('head meta[property="article:published_time"]').should($metaEl => {
      const publishedTimeISO = new Date($metaEl.attr('content')).toISOString();

      expect(publishedTimeISO).to.equal('2024-09-13T10:11:05.000Z');
    });
  });

  it('<meta> article:modified_time', () => {
    cy.get('head meta[property="article:modified_time"]').should($metaEl => {
      const publishedTimeISO = new Date($metaEl.attr('content')).toISOString();

      expect(publishedTimeISO).to.equal('2024-09-13T10:11:05.000Z');
    });
  });

  it('<meta> article:publisher', () => {
    cy.get('head meta[property="article:publisher"]').should(
      'have.attr',
      'content',
      commonExpectedMeta.facebook.url
    );
  });

  it('<meta> twitter:card', () => {
    cy.get('head meta[name="twitter:card"]').should(
      'have.attr',
      'content',
      commonExpectedMeta.twitter.cardType
    );
  });

  it('<meta> twitter:title', () => {
    cy.get('head meta[name="twitter:title"]').should(
      'have.attr',
      'content',
      ghostPageExpectedMeta.title
    );
  });

  it('<meta> twitter:description', () => {
    cy.get('head meta[name="twitter:description"]').should(
      'have.attr',
      'content',
      ghostPageExpectedMeta.excerpt
    );
  });

  it('<meta> twitter:url', () => {
    cy.get('head meta[name="twitter:url"]').should(
      'have.attr',
      'content',
      ghostPageExpectedMeta.url
    );
  });

  it('<meta> twitter:label1', () => {
    cy.get('head meta[name="twitter:label1"]').should(
      'have.attr',
      'content',
      commonExpectedMeta.twitter.label1
    );
  });

  // This page was authored by the freeCodeCamp.org owner account
  it('<meta> twitter:data1', () => {
    cy.get('head meta[name="twitter:data1"]').should(
      'have.attr',
      'content',
      'freeCodeCamp.org'
    );
  });

  it('<meta> twitter:site', () => {
    cy.get('head meta[name="twitter:site"]').should(
      'have.attr',
      'content',
      commonExpectedMeta.espanol.twitterHandle
    );
  });
});
