const selectors = {
  authorPostCount: "[data-test-label='author-post-count']"
};

describe('Author page i18n', () => {
  it('an author page with multiple posts does not render its post count i18n key', () => {
    cy.visit('/author/quincylarson/');

    cy.get(selectors.authorPostCount)
      .invoke('text')
      .then(text => text.trim())
      .should('not.equal', 'author.multiple-posts');
  });
});
