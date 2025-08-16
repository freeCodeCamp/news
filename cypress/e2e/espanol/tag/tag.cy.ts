import { loadAndCountAllPostCards } from '../../../support/utils/post-cards';

const selectors = {
  tagName: "[data-test-label='tag-name']",
  tagPostCount: "[data-test-label='tag-post-count']"
};

describe('Tag pages', () => {
  before(() => {
    // Update baseUrl to include current language
    Cypress.config('baseUrl', 'http://localhost:8080/espanol/news/');
  });

  context('Ghost sourced', () => {
    beforeEach(() => {
      cy.visit('/tag/javascript/');
    });

    it('should render', () => {
      cy.contains(selectors.tagName, '#JAVASCRIPT');
    });

    it('the number of total posts should match the post count at the top of the page (4)', () => {
      loadAndCountAllPostCards(selectors.tagPostCount);
    });
  });

  context('Hashnode sourced', () => {
    beforeEach(() => {
      cy.visit('/tag/aprende-a-programar/');
    });

    it('should render', () => {
      cy.contains(selectors.tagName, '#APRENDE A PROGRAMAR');
    });

    it('the number of total posts should match the post count at the top of the page (1)', () => {
      loadAndCountAllPostCards(selectors.tagPostCount);
    });
  });
});
