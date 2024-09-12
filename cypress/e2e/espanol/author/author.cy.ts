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

describe('Author page (Ghost sourced)', () => {
  before(() => {
    // Update baseUrl to include current language
    Cypress.config('baseUrl', 'http://localhost:8080/espanol/news/');
  });

  context('Author with profile image', () => {
    beforeEach(() => {
      cy.visit('/author/rafael/');
    });

    it('should render', () => {
      cy.contains(selectors.authorName, 'Rafael D. Hernandez');
    });

    it("should show the author's profile image", () => {
      cy.get(selectors.authorProfileImage).then($el =>
        expect($el[0].tagName.toLowerCase()).to.equal('img')
      );
    });

    it("the author profile image should contain an `alt` attribute with the author's name", () => {
      cy.get<HTMLImageElement>(selectors.authorProfileImage).then($el =>
        expect($el[0].alt).to.equal('Rafael D. Hernandez')
      );
    });

    it("should show the author's location and post count on larger screens", () => {
      cy.get(selectors.authorLocation).should('be.visible');
      cy.get(selectors.authorPostCount).should('be.visible');
    });

    it(`should show 16 posts on load`, () => {
      getPostCards().should('have.length', 16);
    });

    it('should show the correct number of total posts', () => {
      loadAndCountAllPostCards(selectors.authorPostCount);
    });
  });

  context('Author with no profile image', () => {
    beforeEach(() => {
      cy.visit('/author/mrugesh/');
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
