const selectors = {
  authorPostCount: "[data-test-label='author-post-count']"
};

describe('Author page i18n (Ghost sourced)', () => {
  before(() => {
    // Update baseUrl to include current language
    Cypress.config('baseUrl', 'http://localhost:8080/espanol/news/');
  });

  it('an author page with one post does not render its post count i18n key', () => {
    cy.visit('/author/rafael/');

    cy.get(selectors.authorPostCount)
      .invoke('text')
      .then(text => text.trim())
      .should('not.equal', 'author.one-post');
  });
});
