const {
  getPostCards,
  loadAndCountAllPostCards
} = require('../../../support/utils/post-cards');

const selectors = {
  tagName: "[data-test-label='tag-name']",
  tagPostCount: "[data-test-label='tag-post-count']"
};

describe('Tag pages', () => {
  context('Ghost sourced tags', () => {
    beforeEach(() => {
      cy.visit('/tag/javascript/');
    });

    it('should render', () => {
      cy.contains(selectors.tagName, '#JAVASCRIPT');
    });

    it('the number of total posts should match the post count at the top of the page (3)', () => {
      loadAndCountAllPostCards(selectors.tagPostCount);
    });
  });

  context('Hashnode sourced tags', () => {
    beforeEach(() => {
      cy.visit('/tag/c-programming/');
    });

    it('should render', () => {
      cy.contains(selectors.tagName, '#C PROGRAMMING');
    });

    it('the number of total posts should match the post count at the top of the page (1)', () => {
      loadAndCountAllPostCards(selectors.tagPostCount);
    });
  });

  context('Ghost and Hashnode sourced tags', () => {
    beforeEach(() => {
      cy.visit('/tag/freecodecamp/');
    });

    it('should render', () => {
      cy.contains(selectors.tagName, '#FREECODECAMP');
    });

    it('the number of total posts should match the post count at the top of the page (12)', () => {
      loadAndCountAllPostCards(selectors.tagPostCount);
    });
  });
});
