const commonExpectedMeta = require('../../../fixtures/common-expected-meta.json');
const ghostAuthorExpectedMeta = {
  title: 'Quincy Larson - freeCodeCamp.org',
  url: 'http://localhost:8080/news/author/quincylarson/',
  image: {
    url: 'http://localhost:3010/content/images/2022/02/banner.png', // Custom banner image -- hidden on author page
    width: 1500,
    height: 500
  },
  description: 'The teacher who founded freeCodeCamp.org.'
};
const hashnodeAuthorExpectedMeta = {
  title: 'Abigail Rennemeyer - freeCodeCamp.org',
  url: 'http://localhost:8080/news/author/abbeyrenn/',
  description:
    'I love editing articles and working with contributors. I also love the outdoors and good food.\n'
};

describe('Author page metadata', () => {
  context('Ghost sourced authors', () => {
    context("Quincy's author page", () => {
      beforeEach(() => {
        cy.visit('/author/quincylarson/');
      });

      it('<title>', () => {
        cy.title().should('eq', ghostAuthorExpectedMeta.title);
      });

      it('<link> canonical', () => {
        cy.get('head link[rel="canonical"]').should(
          'have.attr',
          'href',
          ghostAuthorExpectedMeta.url
        );
      });

      it('<meta> description', () => {
        cy.get('head meta[name="description"]').should(
          'have.attr',
          'content',
          ghostAuthorExpectedMeta.description
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
          'profile'
        );
      });

      it('<meta> og:title', () => {
        cy.get('head meta[property="og:title"]').should(
          'have.attr',
          'content',
          ghostAuthorExpectedMeta.title
        );
      });

      it('<meta> og:description', () => {
        cy.get('head meta[property="og:description"]').should(
          'have.attr',
          'content',
          ghostAuthorExpectedMeta.description
        );
      });

      it('<meta> og:url', () => {
        cy.get('head meta[property="og:url"]').should(
          'have.attr',
          'content',
          ghostAuthorExpectedMeta.url
        );
      });

      // Has a custom banner image
      it('<meta> og:image', () => {
        cy.get('head meta[property="og:image"]').should(
          'have.attr',
          'content',
          ghostAuthorExpectedMeta.image.url
        );
      });

      it('<meta> og:image:width', () => {
        cy.get('head meta[property="og:image:width"]').should(
          'have.attr',
          'content',
          ghostAuthorExpectedMeta.image.width
        );
      });

      it('<meta> og:image:height', () => {
        cy.get('head meta[property="og:image:height"]').should(
          'have.attr',
          'content',
          ghostAuthorExpectedMeta.image.height
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
          ghostAuthorExpectedMeta.title
        );
      });

      it('<meta> twitter:description', () => {
        cy.get('head meta[name="twitter:description"]').should(
          'have.attr',
          'content',
          ghostAuthorExpectedMeta.description
        );
      });

      it('<meta> twitter:url', () => {
        cy.get('head meta[name="twitter:url"]').should(
          'have.attr',
          'content',
          ghostAuthorExpectedMeta.url
        );
      });

      it('<meta> twitter:image', () => {
        cy.get('head meta[name="twitter:image"]').should(
          'have.attr',
          'content',
          ghostAuthorExpectedMeta.image.url
        );
      });

      it('<meta> twitter:site', () => {
        cy.get('head meta[name="twitter:site"]').should(
          'have.attr',
          'content',
          commonExpectedMeta.twitter.username
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

    context('freeCodeCamp author page', () => {
      beforeEach(() => {
        cy.visit('/author/freecodecamp/');
      });

      it("<meta> og:image should be set to the site's publication cover image when there's no custom banner image", () => {
        cy.get('head meta[property="og:image"]').should(
          'have.attr',
          'content',
          commonExpectedMeta.publicationCover.url
        );
      });

      it("<meta> twitter:image should be set to the site's publication cover image when there's no custom banner image", () => {
        cy.get('head meta[name="twitter:image"]').should(
          'have.attr',
          'content',
          commonExpectedMeta.publicationCover.url
        );
      });
    });
  });

  context('Hashnode sourced authors', () => {
    context("Abbey's author page", () => {
      beforeEach(() => {
        cy.visit('/author/abbeyrenn/');
      });

      it('<title>', () => {
        cy.title().should('eq', hashnodeAuthorExpectedMeta.title);
      });

      it('<link> canonical', () => {
        cy.get('head link[rel="canonical"]').should(
          'have.attr',
          'href',
          hashnodeAuthorExpectedMeta.url
        );
      });

      it('<meta> description', () => {
        cy.get('head meta[name="description"]').should(
          'have.attr',
          'content',
          hashnodeAuthorExpectedMeta.description
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
          'profile'
        );
      });

      it('<meta> og:title', () => {
        cy.get('head meta[property="og:title"]').should(
          'have.attr',
          'content',
          hashnodeAuthorExpectedMeta.title
        );
      });

      it('<meta> og:description', () => {
        cy.get('head meta[property="og:description"]').should(
          'have.attr',
          'content',
          hashnodeAuthorExpectedMeta.description
        );
      });

      // No custom banner, so falls back to the site's publication cover image
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
          hashnodeAuthorExpectedMeta.title
        );
      });

      it('<meta> twitter:description', () => {
        cy.get('head meta[name="twitter:description"]').should(
          'have.attr',
          'content',
          hashnodeAuthorExpectedMeta.description
        );
      });

      it('<meta> twitter:url', () => {
        cy.get('head meta[name="twitter:url"]').should(
          'have.attr',
          'content',
          hashnodeAuthorExpectedMeta.url
        );
      });

      // No custom banner, so falls back to the site's publication cover image
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
          commonExpectedMeta.twitter.username
        );
      });

      // Only for authors with a Twitter account
      it('<meta> twitter:creator', () => {
        cy.get('head meta[name="twitter:creator"]').should(
          'have.attr',
          'content',
          '@abbeyrenn'
        );
      });
    });
  });
});
