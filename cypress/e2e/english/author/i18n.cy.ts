const selectors = {
  authorPostCount: "[data-test-label='author-post-count']"
};

describe('Author page i18n (Hashnode sourced)', () => {
  it('an author page with one post does not render its post count i18n key', () => {
    cy.visit('/author/abbeyrenn/');

    cy.get(selectors.authorPostCount)
      .invoke('text')
      .then(text => text.trim())
      .should('not.equal', 'author.one-post');
  });
});
