const metaContent = {
  title: 'freeCodeCamp - freeCodeCamp.org',
  url: 'http://localhost:8080/news/tag/freecodecamp/',
  image: 'https://cdn.freecodecamp.org/platform/universal/fcc_meta_1920X1080-indigo.png', // No custom image -- fallback to base blog image
  description: "Browse thousands of programming tutorials written by experts. Learn Web Development, Data Science, DevOps, Security, and get developer career advice."
}

describe('Tag page metadata', () => {
  before(() => {
    cy.visit('/tag/freecodecamp');
  });

  it('<title>', () => {
    cy.title().should(
      'eq',
      metaContent.title
    );
  });

  it('canonical URL', () => {
    cy.get('head link[rel="canonical"]').should(
      'have.attr',
      'href',
      metaContent.url
    );
  });

  it('<meta> generator', () => {
    cy.get('head meta[name="generator"]').should(
      'have.attr',
      'content',
      'Eleventy'
    );
  });

  it('<meta> og:site_name', () => {
    cy.get('head meta[property="og:site_name"]').should(
      'have.attr',
      'content',
      'freeCodeCamp.org'
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
      metaContent.title
    );
  });

  it('<meta> og:description', () => {
    cy.get('head meta[property="og:description"]').should(
      'have.attr',
      'content',
      metaContent.description
    );
  });

  it('<meta> og:url', () => {
    cy.get('head meta[property="og:url"]').should(
      'have.attr',
      'content',
      metaContent.url
    );
  });

  it('<meta> og:image', () => {
    cy.get('head meta[property="og:image"]').should(
      'have.attr',
      'content',
      metaContent.image
    );
  });

  it('<meta> og:image:width', () => {
    cy.get('head meta[property="og:image:width"]').should(
      'have.attr',
      'content',
      1920
    );
  });

  it('<meta> og:image:height', () => {
    cy.get('head meta[property="og:image:height"]').should(
      'have.attr',
      'content',
      1080
    );
  });

  it('<meta> article:publisher', () => {
    cy.get('head meta[property="article:publisher"]').should(
      'have.attr',
      'content',
      'https://www.facebook.com/freecodecamp'
    );
  });

  it('<meta> twitter:card', () => {
    cy.get('head meta[name="twitter:card"]').should(
      'have.attr',
      'content',
      'summary_large_image'
    );
  });

  it('<meta> twitter:title', () => {
    cy.get('head meta[name="twitter:title"]').should(
      'have.attr',
      'content',
      metaContent.title
    );
  });

  it('<meta> twitter:description', () => {
    cy.get('head meta[name="twitter:description"]').should(
      'have.attr',
      'content',
      metaContent.description
    );
  });

  it('<meta> twitter:url', () => {
    cy.get('head meta[name="twitter:url"]').should(
      'have.attr',
      'content',
      metaContent.url
    );
  });

  it('<meta> twitter:image', () => {
    cy.get('head meta[name="twitter:image"]').should(
      'have.attr',
      'content',
      metaContent.image
    );
  });

  it('<meta> twitter:site', () => {
    cy.get('head meta[name="twitter:site"]').should(
      'have.attr',
      'content',
      '@freecodecamp'
    );
  });
});
