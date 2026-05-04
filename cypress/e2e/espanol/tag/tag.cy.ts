import { loadAndCountAllPostCards } from '../../../support/utils/post-cards';

const selectors = {
  tagName: "[data-test-label='tag-name']",
  tagPostCount: "[data-test-label='tag-post-count']",
  socialMedia: {
    rss: {
      link: "[data-test-label='rss-link']",
      icon: "[data-test-label='rss-icon']"
    }
  }
};

describe('Tag pages (Ghost sourced)', () => {
  before(() => {
    // Update baseUrl to include current language
    Cypress.config('baseUrl', 'http://localhost:8080/espanol/news/');
  });

  beforeEach(() => {
    cy.visit('/tag/javascript/');
  });

  context('General tests', () => {
    it('should render', () => {
      cy.contains(selectors.tagName, '#JAVASCRIPT');
    });

    it('the number of total posts should match the post count at the top of the page (4)', () => {
      loadAndCountAllPostCards(selectors.tagPostCount);
    });
  });

  // Note: All tags should have an RSS link and icon
  context('RSS', () => {
    it('should show an RSS link and icon with the expected attributes', () => {
      cy.get(selectors.socialMedia.rss.link)
        .should(
          'have.attr',
          'href',
          'http://localhost:8080/espanol/news/tag/javascript/rss/'
        )
        .find('svg')
        .should('have.attr', 'data-test-label', 'rss-icon');
    });
  });
});
