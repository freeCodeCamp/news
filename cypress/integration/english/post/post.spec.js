const selectors = {
  comments: "[data-test-label='comments']",
  socialRow: "[data-test-label='social-row']",
  tweetButton: "[data-test-label='tweet-button']"
};

describe('Post', () => {
  before(() => {
    cy.visit('/announcing-rust-course-replit-web');
  });

  it('should render', () => {
    cy.contains(
      "We're Building New Courses on Rust and Python + the Replit.web Framework"
    );
  });

  it('should not display a comments section', () => {
    cy.get(selectors.comments).should('not.exist');
  });

  it('should display the social row', () => {
    cy.get(selectors.socialRow).should('be.visible');
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
