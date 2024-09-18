const {
  getPostCards,
  loadAndCountAllPostCards
} = require('../../../support/utils/post-cards');

const selectors = {
  authorProfileImage: ".under-header-content [data-test-label='profile-image']",
  avatar: ".under-header-content [data-test-label='avatar']",
  authorName: "[data-test-label='author-name']",
  authorLocation: "[data-test-label='author-location']",
  authorPostCount: "[data-test-label='author-post-count']",
  bullet: "[data-test-label='bullet']"
};

describe('Author page (Hashnode sourced)', () => {
  context('General tests', () => {
    // Tests here should apply to all author pages, regardless of the source
    beforeEach(() => {
      cy.visit('/author/abbeyrenn/');
    });

    it('should render', () => {
      cy.contains(selectors.authorName, 'Abigail Rennemeyer');
    });

    it("should show the author's location and post count on larger screens", () => {
      cy.get(selectors.authorLocation).should('be.visible');
      cy.get(selectors.authorPostCount).should('be.visible');
    });

    it("should not show the author's location and post count on screens < 500px", () => {
      cy.viewport(499, 660);
      cy.get(selectors.authorLocation).should('not.be.visible');
      cy.get(selectors.authorPostCount).should('not.be.visible');
    });

    it(`should show 1 posts on load`, () => {
      getPostCards().should('have.length', 1);
    });

    it('should show the correct number of total posts', () => {
      loadAndCountAllPostCards(selectors.authorPostCount);
    });

    it('should not show any bullet marks on screens < 500px', () => {
      cy.viewport(499, 660);
      cy.get(selectors.bullet).should('not.be.visible');
    });
  });

  // Hashnode provides a default image for authors who don't upload a profile picture,
  // so basic tests for profile images are fine
  context('Author with profile image', () => {
    beforeEach(() => {
      cy.visit('/author/abbeyrenn/');
    });

    it("should show the author's profile image", () => {
      cy.get(selectors.authorProfileImage).then($el =>
        expect($el[0].tagName.toLowerCase()).to.equal('img')
      );
    });

    it("the author profile image should contain an `alt` attribute with the author's name", () => {
      cy.get<HTMLImageElement>(selectors.authorProfileImage).then($el =>
        expect($el[0].alt).to.equal('Abigail Rennemeyer')
      );
    });
  });
});
