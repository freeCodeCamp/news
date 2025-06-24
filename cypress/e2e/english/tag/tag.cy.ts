import { loadAndCountAllPostCards } from '../../../support/utils/post-cards';

const selectors = {
  tagName: "[data-test-label='tag-name']",
  tagPostCount: "[data-test-label='tag-post-count']"
};

describe('Tag pages (Hashnode sourced)', () => {
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
