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

describe('Author page', () => {
  context('General tests', () => {
    before(() => {
      cy.visit('/author/quincylarson');
    });

    it('should render', () => {
      cy.contains(selectors.authorName, 'Quincy Larson');
    });

    it("should show the author's profile image", () => {
      cy.get(selectors.authorProfileImage).then($el =>
        expect($el[0].tagName.toLowerCase()).to.equal('img')
      );
    });

    it("the author profile image should contain an `alt` attribute with the author's name", () => {
      cy.get(selectors.authorProfileImage).then($el =>
        expect($el[0].alt).to.equal('Quincy Larson')
      );
    });

    it("should show the author's location and post count on larger screens", () => {
      cy.get(selectors.authorLocation).should('be.visible');
      cy.get(selectors.authorPostCount).should('be.visible');
    });

    it(`should show 25 posts on load`, () => {
      getPostCards().should('have.length', 25);
    });

    it('should show the correct number of total posts', () => {
      loadAndCountAllPostCards(selectors.authorPostCount);
    });

    it("should not show the author's location and post count on screens < 500px", () => {
      cy.viewport(499, 660);
      cy.get(selectors.authorLocation).should('not.be.visible');
      cy.get(selectors.authorPostCount).should('not.be.visible');
    });

    it('should not show any bullet marks on screens < 500px', () => {
      cy.viewport(499, 660);
      cy.get(selectors.bullet).should('not.be.visible');
    });
  });

  context('Author with no profile image', () => {
    before(() => {
      cy.visit('/author/mrugesh');
    });

    it('should render', () => {
      cy.contains(selectors.authorName, 'Mrugesh Mohapatra');
    });

    it('should show the avatar SVG', () => {
      cy.get(selectors.avatar).then($el =>
        expect($el[0].tagName.toLowerCase()).to.equal('svg')
      );
    });

    it("the avatar SVG should contain a `title` element with the author's name", () => {
      cy.get(selectors.avatar).contains('title', 'Mrugesh Mohapatra');
    });
  });
});
