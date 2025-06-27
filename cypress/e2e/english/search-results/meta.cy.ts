import commonExpectedMeta from '../../../fixtures/common-expected-meta.json';

// Tests here should apply to search result page meta, regardless of the source
describe('Landing metadata', () => {
  beforeEach(() => {
    cy.visit('/search/?query=mock%20search%20results');
  });

  it('<title>', () => {
    cy.title().should('eq', `Search - ${commonExpectedMeta.siteName}`);
  });

  it('<meta> keywords', () => {
    cy.get('head meta[name="keywords"]').should(
      'have.attr',
      'content',
      commonExpectedMeta.english.keywords
    );
  });

  it('<meta> description', () => {
    cy.get('head meta[name="description"]').should(
      'have.attr',
      'content',
      commonExpectedMeta.english.description
    );
  });

  it('<link> canonical', () => {
    cy.get('head link[rel="canonical"]').should(
      'have.attr',
      'href',
      commonExpectedMeta.english.siteUrl + 'search/'
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
      'website'
    );
  });

  it('<meta> og:title', () => {
    cy.get('head meta[property="og:title"]').should(
      'have.attr',
      'content',
      commonExpectedMeta.siteName
    );
  });

  it('<meta> og:description', () => {
    cy.get('head meta[property="og:description"]').should(
      'have.attr',
      'content',
      commonExpectedMeta.english.description
    );
  });

  it('<meta> og:url', () => {
    cy.get('head meta[property="og:url"]').should(
      'have.attr',
      'content',
      commonExpectedMeta.english.siteUrl + 'search/'
    );
  });

  it('<meta> og:image', () => {
    cy.get('head meta[property="og:image"]').should(
      'have.attr',
      'content',
      commonExpectedMeta.publicationCover.url
    );
  });

  it('<meta> og:image:width', () => {
    cy.get('head meta[property="og:image:width"]').should(
      'have.attr',
      'content',
      commonExpectedMeta.publicationCover.width
    );
  });

  it('<meta> og:image:height', () => {
    cy.get('head meta[property="og:image:height"]').should(
      'have.attr',
      'content',
      commonExpectedMeta.publicationCover.height
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
      commonExpectedMeta.siteName
    );
  });

  it('<meta> twitter:description', () => {
    cy.get('head meta[name="twitter:description"]').should(
      'have.attr',
      'content',
      commonExpectedMeta.english.description
    );
  });

  it('<meta> twitter:url', () => {
    cy.get('head meta[name="twitter:url"]').should(
      'have.attr',
      'content',
      commonExpectedMeta.english.siteUrl + 'search/'
    );
  });

  it('<meta> twitter:image', () => {
    cy.get('head meta[name="twitter:image"]').should(
      'have.attr',
      'content',
      commonExpectedMeta.publicationCover.url
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
