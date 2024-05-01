const {
  loadAndCountAllPostCards
} = require('../../../support/utils/post-cards');

const selectors = {
  tagName: "[data-test-label='tag-name']",
  tagPostCount: "[data-test-label='tag-post-count']"
};

describe('Tag pages', () => {
  context('General tests', () => {
    // Tests here should apply to all tag pages, regardless of the source
    beforeEach(() => {
      cy.visit('/tag/gamedev/');
    });

    // Note: This test can be removed once we migrate everything to Hashnode.
    it('pages for tags with the same slug on both Ghost and Hashnode should show all posts', () => {
      // Hashnode sourced post
      cy.contains(
        'Ben Awad is a GameDev Who Sleeps 9 Hours EVERY NIGHT to be Productive [Podcast #121]'
      );
      // Ghost sourced post
      cy.contains('Learn to Code RPG – Full Soundtrack + How I Made It');
    });
  });

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
