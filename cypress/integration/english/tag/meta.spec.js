const commonMeta = require('../../../fixtures/common-meta.json');
const tagMeta = {
  title: 'freeCodeCamp - freeCodeCamp.org',
  url: 'http://localhost:8080/news/tag/freecodecamp/',
  description: "Browse thousands of programming tutorials written by experts. Learn Web Development, Data Science, DevOps, Security, and get developer career advice."
}

describe('Tag page metadata', () => {
  before(() => {
    cy.visit('/tag/freecodecamp');
  });

  it('<title>', () => {
    cy.title().should(
      'eq',
      tagMeta.title
    );
  });

  it('canonical URL', () => {
    cy.get('head link[rel="canonical"]').should(
      'have.attr',
      'href',
      tagMeta.url
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
      'website'
    );
  });

  it('<meta> og:title', () => {
    cy.get('head meta[property="og:title"]').should(
      'have.attr',
      'content',
      tagMeta.title
    );
  });

  it('<meta> og:description', () => {
    cy.get('head meta[property="og:description"]').should(
      'have.attr',
      'content',
      tagMeta.description
    );
  });

  it('<meta> og:url', () => {
    cy.get('head meta[property="og:url"]').should(
      'have.attr',
      'content',
      tagMeta.url
    );
  });

  // No custom image -- fall back to default publication cover
  it('<meta> og:image', () => {
    cy.get('head meta[property="og:image"]').should(
      'have.attr',
      'content',
      commonMeta.publicationCover.url
    );
  });

  it('<meta> og:image:width', () => {
    cy.get('head meta[property="og:image:width"]').should(
      'have.attr',
      'content',
      commonMeta.publicationCover.width
    );
  });

  it('<meta> og:image:height', () => {
    cy.get('head meta[property="og:image:height"]').should(
      'have.attr',
      'content',
      commonMeta.publicationCover.height
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
      tagMeta.title
    );
  });

  it('<meta> twitter:description', () => {
    cy.get('head meta[name="twitter:description"]').should(
      'have.attr',
      'content',
      tagMeta.description
    );
  });

  it('<meta> twitter:url', () => {
    cy.get('head meta[name="twitter:url"]').should(
      'have.attr',
      'content',
      tagMeta.url
    );
  });

  it('<meta> twitter:image', () => {
    cy.get('head meta[name="twitter:image"]').should(
      'have.attr',
      'content',
      commonMeta.publicationCover.url
    );
  });

  it('<meta> twitter:site', () => {
    cy.get('head meta[name="twitter:site"]').should(
      'have.attr',
      'content',
      commonMeta.twitter.username
    );
  });
});
