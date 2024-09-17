const selectors = {
  authorList: "[data-test-label='author-list']",
  authorProfileImage: "[data-test-label='author-profile-image']",
  avatar: "[data-test-label='avatar']",
  postCard: "[data-test-label='post-card']"
};

// Tests here should apply to all search results pages, which are built dynamically from calls to Algolia
describe('Search results', () => {
  beforeEach(() => {
    // Note: 11ty's dev server expects a trailing slash
    // immediately after `/search`, before the `query` URL
    // parameter. This does not happen on production since we
    // don't redirect from the non-trailing slash version of the
    // page to the trailing slash version
    cy.visit('/search/?query=mock%20search%20results');
  });

  it('should render basic components', () => {
    cy.get('nav').should('be.visible');
    cy.get('.banner').should('be.visible');
    cy.get('footer').should('be.visible');
  });

  it("should show the author's profile image", () => {
    cy.get(selectors.postCard)
      .contains(
        'freeCodeCamp Just Got a Million Dollar Donation from an Alum to Build a Carbon-Neutral Web3 Curriculum'
      )
      .parentsUntil('article')
      .find(selectors.authorProfileImage)
      .then($el => expect($el[0].tagName.toLowerCase()).to.equal('img'));
  });

  it("the author profile image should contain an `alt` attribute with the author's name", () => {
    cy.get(selectors.postCard)
      .contains(
        'freeCodeCamp Just Got a Million Dollar Donation from an Alum to Build a Carbon-Neutral Web3 Curriculum'
      )
      .parentsUntil('article')
      .find<HTMLImageElement>(selectors.authorProfileImage)
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

  it("posts written by 'freeCodeCamp.org' should not show the `author-list`, which contain's the author's name and profile image", () => {
    cy.get(selectors.postCard)
      .contains('Common Technical Support Questions – freeCodeCamp FAQ')
      .parentsUntil('article')
      .find(selectors.authorList)
      .should('not.exist');
  });

  // To do: Finalize search schema and add tests for the original post / translator feature
});
