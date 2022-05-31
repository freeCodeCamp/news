const selectors = {
  authorProfileImage: "[data-test-label='profile-image']",
  avatars: {
    top: "[data-test-label='author-header-no-bio'] [data-test-label='avatar']",
    bottom:
      "[data-test-label='author-header-with-bio'] [data-test-label='avatar']"
  },
  comments: "[data-test-label='comments']",
  socialRowCTA: "[data-test-label='social-row-cta']",
  tweetButton: "[data-test-label='tweet-button']"
};

describe('Post', () => {
  context('General tests', () => {
    before(() => {
      cy.visit('/announcing-rust-course-replit-web');
    });

    it('should render', () => {
      cy.contains(
        "We're Building New Courses on Rust and Python + the Replit.web Framework"
      );
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

    it('should not display a comments section', () => {
      cy.get(selectors.comments).should('not.exist');
    });

    it('should display the social row', () => {
      cy.get(selectors.socialRowCTA).should('be.visible');
    });

    it('the tweet button should open a Twitter window with the correct message and dimensions', () => {
      cy.get(selectors.tweetButton)
        .invoke('attr', 'onclick')
        .should('include', 'window.open')
        .should(
          'include',
          'https://twitter.com/intent/tweet?text=Thank%20you%20%40ossia%20for%20writing%20this%20helpful%20article.%0A%0AWe%27re%20Building%20New%20Courses%20on%20Rust%20and%20Python%20%2B%20the%20Replit.web%20Framework%0A%0Ahttp://localhost:8080/news/announcing-rust-course-replit-web/'
        )
        .should('include', 'share-twitter')
        .should('include', 'width=550, height=235')
        .should('include', 'return false');
    });
  });

  context('Author with no profile picture', () => {
    before(() => {
      cy.visit('/no-author-profile-pic');
    });

    it('should render', () => {
      cy.contains('No Author Profile Pic');
    });

    it('should show the avatar SVG in the byline at the top of the article', () => {
      cy.get(selectors.avatars.top).then($el =>
        expect($el[0].tagName.toLowerCase()).to.equal('svg')
      );
    });

    it('should show the avatar SVG in the second byline at the bottom of the article', () => {
      cy.get(selectors.avatars.bottom).then($el =>
        expect($el[0].tagName.toLowerCase()).to.equal('svg')
      );
    });

    it("all avatar SVGs should contain a `title` element with the author's name", () => {
      Object.values(selectors.avatars).forEach(selector => {
        cy.get(selector).contains('title', 'Mrugesh Mohapatra');
      });
    });
  });
});
