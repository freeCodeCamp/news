const commonMeta = require('../../../fixtures/common-meta.json');
const authorMeta = {
  title: 'Quincy Larson - freeCodeCamp.org',
  url: 'http://localhost:8080/news/author/quincylarson/',
  image: {
    url: 'https://www.freecodecamp.org/news/content/images/2019/07/banner.png', // Custom banner image -- hidden on author page
    width: 1500,
    height: 500
  },
  description: "The teacher who founded freeCodeCamp.org." // Custom author bio
}

describe('Author page metadata', () => {
  before(() => {
    cy.visit('/author/quincylarson');
  });

  it('<title>', () => {
    cy.title().should(
      'eq',
      authorMeta.title
    );
  });

  it('canonical URL', () => {
    cy.get('head link[rel="canonical"]').should(
      'have.attr',
      'href',
      authorMeta.url
    );
  });

  it('<meta> description', () => {
    cy.get('head meta[name="description"]').should(
      'have.attr',
      'content',
      authorMeta.description
    );
  });

  it('<meta> generator', () => {
    cy.get('head meta[name="generator"]').should(
      'have.attr',
      'content',
      commonMeta.generator
    );
  });

  it('<meta> og:site_name', () => {
    cy.get('head meta[property="og:site_name"]').should(
      'have.attr',
      'content',
      commonMeta.siteName
    );
  });

  it('<meta> og:type', () => {
    cy.get('head meta[property="og:type"]').should(
      'have.attr',
      'content',
      'profile'
    );
  });

  it('<meta> og:title', () => {
    cy.get('head meta[property="og:title"]').should(
      'have.attr',
      'content',
      authorMeta.title
    );
  });

  it('<meta> og:description', () => {
    cy.get('head meta[property="og:description"]').should(
      'have.attr',
      'content',
      authorMeta.description
    );
  });

  it('<meta> og:url', () => {
    cy.get('head meta[property="og:url"]').should(
      'have.attr',
      'content',
      authorMeta.url
    );
  });

  it('<meta> og:image', () => {
    cy.get('head meta[property="og:image"]').should(
      'have.attr',
      'content',
      authorMeta.image.url
    );
  });

  it('<meta> og:image:width', () => {
    cy.get('head meta[property="og:image:width"]').should(
      'have.attr',
      'content',
      authorMeta.image.width
    );
  });

  it('<meta> og:image:height', () => {
    cy.get('head meta[property="og:image:height"]').should(
      'have.attr',
      'content',
      authorMeta.image.height
    );
  });

  it('<meta> article:publisher', () => {
    cy.get('head meta[property="article:publisher"]').should(
      'have.attr',
      'content',
      commonMeta.facebook.url
    );
  });

  it('<meta> twitter:card', () => {
    cy.get('head meta[name="twitter:card"]').should(
      'have.attr',
      'content',
      commonMeta.twitter.cardType
    );
  });

  it('<meta> twitter:title', () => {
    cy.get('head meta[name="twitter:title"]').should(
      'have.attr',
      'content',
      authorMeta.title
    );
  });

  it('<meta> twitter:description', () => {
    cy.get('head meta[name="twitter:description"]').should(
      'have.attr',
      'content',
      authorMeta.description
    );
  });

  it('<meta> twitter:url', () => {
    cy.get('head meta[name="twitter:url"]').should(
      'have.attr',
      'content',
      authorMeta.url
    );
  });

  it('<meta> twitter:image', () => {
    cy.get('head meta[name="twitter:image"]').should(
      'have.attr',
      'content',
      authorMeta.image.url
    );
  });

  it('<meta> twitter:site', () => {
    cy.get('head meta[name="twitter:site"]').should(
      'have.attr',
      'content',
      commonMeta.twitter.username
    );
  });

  // Only for authors with a Twitter account
  it('<meta> twitter:creator', () => {
    cy.get('head meta[name="twitter:creator"]').should(
      'have.attr',
      'content',
      '@ossia'
    );
  });
});
