import commonExpectedMeta from '../../../fixtures/common-expected-meta.json';
const hashnodePageExpectedMeta = {
  title: 'Thank You for Being a Supporter',
  url: 'http://localhost:8080/news/thank-you-for-being-a-supporter/',
  excerpt:
    "freeCodeCamp is a highly-efficient education NGO. This year alone, we've provided million hours of free education to people around the world. At our charity's current operating budget, every dollar you donate to freeCodeCamp translates into 50 hours worth of technology education. When you donate to freeCodeCamp, you help people learn"
};

describe('Page metadata (Hashnode sourced)', () => {
  beforeEach(() => {
    cy.visit('/thank-you-for-being-a-supporter/');
  });

  it('<title>', () => {
    cy.title().should('eq', hashnodePageExpectedMeta.title);
  });

  it('<meta> description', () => {
    cy.get('head meta[name="description"]').should(
      'have.attr',
      'content',
      hashnodePageExpectedMeta.excerpt
    );
  });

  it('<link> canonical', () => {
    cy.get('head link[rel="canonical"]').should(
      'have.attr',
      'href',
      hashnodePageExpectedMeta.url
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
      hashnodePageExpectedMeta.title
    );
  });

  it('<meta> og:description', () => {
    cy.get('head meta[property="og:description"]').should(
      'have.attr',
      'content',
      hashnodePageExpectedMeta.excerpt
    );
  });

  it('<meta> og:url', () => {
    cy.get('head meta[property="og:url"]').should(
      'have.attr',
      'content',
      hashnodePageExpectedMeta.url
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
      hashnodePageExpectedMeta.title
    );
  });

  it('<meta> twitter:description', () => {
    cy.get('head meta[name="twitter:description"]').should(
      'have.attr',
      'content',
      hashnodePageExpectedMeta.excerpt
    );
  });

  it('<meta> twitter:url', () => {
    cy.get('head meta[name="twitter:url"]').should(
      'have.attr',
      'content',
      hashnodePageExpectedMeta.url
    );
  });

  it('<meta> twitter:label1', () => {
    cy.get('head meta[name="twitter:label1"]').should(
      'have.attr',
      'content',
      commonExpectedMeta.twitter.label1
    );
  });

  // Hashnode pages don't have an author associated with them, so we
  // handle this in the doc.njk template directly
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
      commonExpectedMeta.english.twitterHandle
    );
  });
});
