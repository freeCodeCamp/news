const commonExpectedMeta = require('../../../fixtures/common-expected-meta.json');
const postExpectedMeta = {
  title:
    'Cómo funciona el operador de signo de interrogación (?) en JavaScript',
  url: 'http://localhost:8080/espanol/news/como-funciona-el-operado-de-signo-de-interrogacion-javascript/',
  image: {
    url: 'https://www.freecodecamp.org/espanol/news/content/images/2022/02/Pink-Cute-Chic-Vintage-90s-Virtual-Trivia-Quiz-Presentations--5--1.png',
    width: 1000,
    height: 563
  },
  excerpt:
    'Artículo original escrito por: Nishant Kumar [https://www.freecodecamp.org/news/author/nishant-kumar/] Artículo original: How the Question Mark (?) Operator Works in JavaScript [https://www.freecodecamp.org/news/how-the-question-mark-works-in-javascript/] Traducido y adaptado por: Rafael D. Hernandez [/espanol/news/author/rafael/] El operador de signo de interrogación o condicional, representado por a ?, es una de las características más potentes de JavaScript. El operador'
};

describe('Post metadata (Ghost sourced)', () => {
  before(() => {
    // Update baseUrl to include current language
    Cypress.config('baseUrl', 'http://localhost:8080/espanol/news/');
  });

  beforeEach(() => {
    cy.visit('/como-funciona-el-operado-de-signo-de-interrogacion-javascript/');
  });

  it('<title>', () => {
    cy.title().should('eq', postExpectedMeta.title);
  });

  it('<meta> description', () => {
    cy.get('head meta[name="description"]').should(
      'have.attr',
      'content',
      postExpectedMeta.excerpt
    );
  });

  it('<link> canonical', () => {
    cy.get('head link[rel="canonical"]').should(
      'have.attr',
      'href',
      postExpectedMeta.url
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
      postExpectedMeta.title
    );
  });

  it('<meta> og:description', () => {
    cy.get('head meta[property="og:description"]').should(
      'have.attr',
      'content',
      postExpectedMeta.excerpt
    );
  });

  it('<meta> og:url', () => {
    cy.get('head meta[property="og:url"]').should(
      'have.attr',
      'content',
      postExpectedMeta.url
    );
  });

  it('<meta> og:image', () => {
    cy.get('head meta[property="og:image"]').should(
      'have.attr',
      'content',
      postExpectedMeta.image.url
    );
  });

  it('<meta> og:image:width', () => {
    cy.get('head meta[property="og:image:width"]').should(
      'have.attr',
      'content',
      postExpectedMeta.image.width
    );
  });

  it('<meta> og:image:height', () => {
    cy.get('head meta[property="og:image:height"]').should(
      'have.attr',
      'content',
      postExpectedMeta.image.height
    );
  });

  it('<meta> article:published_time', () => {
    cy.get('head meta[property="article:published_time"]').should($metaEl => {
      const publishedTimeISO = new Date($metaEl.attr('content')).toISOString();

      expect(publishedTimeISO).to.equal('2022-02-18T03:06:29.000Z');
    });
  });

  it('<meta> article:modified_time', () => {
    cy.get('head meta[property="article:modified_time"]').should($metaEl => {
      const modifiedTimeISO = new Date($metaEl.attr('content')).toISOString();

      expect(modifiedTimeISO).to.equal('2022-02-19T12:39:23.000Z');
    });
  });

  // This article has just one tag
  it('<meta> article:tag', () => {
    cy.get('head meta[property="article:tag"]').should(
      'have.attr',
      'content',
      'JavaScript'
    );
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
      postExpectedMeta.title
    );
  });

  it('<meta> twitter:description', () => {
    cy.get('head meta[name="twitter:description"]').should(
      'have.attr',
      'content',
      postExpectedMeta.excerpt
    );
  });

  it('<meta> twitter:url', () => {
    cy.get('head meta[name="twitter:url"]').should(
      'have.attr',
      'content',
      postExpectedMeta.url
    );
  });

  it('<meta> twitter:image', () => {
    cy.get('head meta[name="twitter:image"]').should(
      'have.attr',
      'content',
      postExpectedMeta.image.url
    );
  });

  it('<meta> twitter:label1', () => {
    cy.get('head meta[name="twitter:label1"]').should(
      'have.attr',
      'content',
      commonExpectedMeta.twitter.label1
    );
  });

  it('<meta> twitter:data1', () => {
    cy.get('head meta[name="twitter:data1"]').should(
      'have.attr',
      'content',
      'Rafael D. Hernandez'
    );
  });

  it('<meta> twitter:label2', () => {
    cy.get('head meta[name="twitter:label2"]').should(
      'have.attr',
      'content',
      commonExpectedMeta.twitter.label2
    );
  });

  // This article has just one tag
  it('<meta> twitter:data2', () => {
    cy.get('head meta[name="twitter:data2"]').should(
      'have.attr',
      'content',
      'JavaScript'
    );
  });

  it('<meta> twitter:site', () => {
    cy.get('head meta[name="twitter:site"]').should(
      'have.attr',
      'content',
      commonExpectedMeta.espanol.twitterUsername
    );
  });

  it('<meta> twitter:creator', () => {
    cy.get('head meta[name="twitter:creator"]').should(
      'have.attr',
      'content',
      '@RafaelDavisH'
    );
  });
});
