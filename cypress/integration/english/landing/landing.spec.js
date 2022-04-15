const { loadAllPosts } = require('../../../support/utils/post-cards');

const selectors = {
  authorProfileImage: "[data-test-label='author-profile-image']",
  avatar: "[data-test-label='avatar']",
  postCard: "[data-test-label='post-card']"
};

describe('Landing', () => {
  before(() => {
    cy.visit('/');
    loadAllPosts();
  });

  it('should render basic components', () => {
    cy.get('nav').should('be.visible');
    cy.get('.banner').should('be.visible');
    cy.get('footer').should('be.visible');
  });

  it("should show the author's profile image", () => {
    cy.get(selectors.postCard)
      .contains(
        'Learn Responsive Web Design by Building 20 Projects – a Major freeCodeCamp Curriculum Update'
      )
      .parentsUntil('article')
      .find(selectors.authorProfileImage)
      .then($el => expect($el[0].tagName.toLowerCase()).to.equal('img'));
  });

  it("the author profile image should contain an `alt` attribute with the author's name", () => {
    cy.get(selectors.postCard)
      .contains(
        'Learn Responsive Web Design by Building 20 Projects – a Major freeCodeCamp Curriculum Update'
      )
      .parentsUntil('article')
      .find(selectors.authorProfileImage)
      .then($el => expect($el[0].alt).to.equal('Quincy Larson'));
  });

  it('post cards written by an author with no profile image should show the author SVG', () => {
    cy.get(selectors.postCard)
      .contains('No Author Profile Pic')
      .parentsUntil('article')
      .find(selectors.avatar)
      .then($el => expect($el[0].tagName.toLowerCase()).to.equal('svg'));
  });

  it("the avatar SVG should contain a `title` element with the author's name", () => {
    cy.get(selectors.postCard)
      .contains('No Author Profile Pic')
      .parentsUntil('article')
      .find(selectors.avatar)
      .contains('title', 'Mrugesh Mohapatra');
  });
});
