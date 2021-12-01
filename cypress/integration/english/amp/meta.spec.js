const commonMeta = require('../../../fixtures/common-meta.json');
const ampMeta = {
  title: "We're Building New Courses on Rust and Python + the Replit.web Framework",
  url: 'http://localhost:8080/news/announcing-rust-course-replit-web/',
  image: {
    url: 'https://www.freecodecamp.org/news/content/images/2021/08/sean-lim-NPlv2pkYoUA-unsplash--2-.jpg',
    width: 1920,
    height: 1280
  },
  excerpt: "As you may know, I've been a fan of Replit since way back in 2012. I used early versions of the website when I was learning to code.  For me, Replit was a place to code my solutions for Project Euler problems, and to practice my Python and JavaScript"
}

describe('Post metadata', () => {
  before(() => {
    cy.visit('/announcing-rust-course-replit-web/amp');
  });

  it('<title>', () => {
    cy.title().should(
      'eq',
      ampMeta.title
    );
  });

  it('canonical URL', () => {
    cy.get('head link[rel="canonical"]').should(
      'have.attr',
      'href',
      ampMeta.url
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
      'article'
    );
  });

  it('<meta> og:title', () => {
    cy.get('head meta[property="og:title"]').should(
      'have.attr',
      'content',
      ampMeta.title
    );
  });

  it('<meta> og:description', () => {
    cy.get('head meta[property="og:description"]').should(
      'have.attr',
      'content',
      ampMeta.excerpt
    );
  });

  it('<meta> og:url', () => {
    cy.get('head meta[property="og:url"]').should(
      'have.attr',
      'content',
      ampMeta.url
    );
  });

  it('<meta> og:image', () => {
    cy.get('head meta[property="og:image"]').should(
      'have.attr',
      'content',
      ampMeta.image.url
    );
  });

  it('<meta> og:image:width', () => {
    cy.get('head meta[property="og:image:width"]').should(
      'have.attr',
      'content',
      ampMeta.image.width
    );
  });

  it('<meta> og:image:height', () => {
    cy.get('head meta[property="og:image:height"]').should(
      'have.attr',
      'content',
      ampMeta.image.height
    );
  });

  it('<meta> article:published_time', () => {
    cy.get('head meta[property="article:published_time"]').should(($metaEl) => {
      const publishedTimeISO = new Date($metaEl.attr('content')).toISOString();

      expect(publishedTimeISO).to.equal('2021-08-23T17:03:24.000Z');
    });
  });

  it('<meta> article:modified_time', () => {
    cy.get('head meta[property="article:modified_time"]').should(($metaEl) => {
      const publishedTimeISO = new Date($metaEl.attr('content')).toISOString();

      expect(publishedTimeISO).to.equal('2021-08-23T17:03:24.000Z');
    });
  });

  it('<meta> article:tag', () => {
    cy.get('head meta[property="article:tag"]').should(
      'have.attr',
      'content',
      'freeCodeCamp'
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
      ampMeta.title
    );
  });

  it('<meta> twitter:description', () => {
    cy.get('head meta[name="twitter:description"]').should(
      'have.attr',
      'content',
      ampMeta.excerpt
    );
  });

  it('<meta> twitter:url', () => {
    cy.get('head meta[name="twitter:url"]').should(
      'have.attr',
      'content',
      ampMeta.url
    );
  });

  it('<meta> twitter:image', () => {
    cy.get('head meta[name="twitter:image"]').should(
      'have.attr',
      'content',
      ampMeta.image.url
    );
  });

  it('<meta> twitter:label1', () => {
    cy.get('head meta[name="twitter:label1"]').should(
      'have.attr',
      'content',
      commonMeta.twitter.label1
    );
  });

  it('<meta> twitter:data1', () => {
    cy.get('head meta[name="twitter:data1"]').should(
      'have.attr',
      'content',
      'Quincy Larson'
    );
  });

  it('<meta> twitter:label2', () => {
    cy.get('head meta[name="twitter:label2"]').should(
      'have.attr',
      'content',
      commonMeta.twitter.label2
    );
  });

  it('<meta> twitter:data2', () => {
    cy.get('head meta[name="twitter:data2"]').should(
      'have.attr',
      'content',
      'freeCodeCamp'
    );
  });

  it('<meta> twitter:site', () => {
    cy.get('head meta[name="twitter:site"]').should(
      'have.attr',
      'content',
      commonMeta.twitter.username
    );
  });

  it('<meta> twitter:creator', () => {
    cy.get('head meta[name="twitter:creator"]').should(
      'have.attr',
      'content',
      '@ossia'
    );
  });
});
