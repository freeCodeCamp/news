const selectors = {
  authorPostCount: "[data-test-label='author-post-count']"
};

describe('Author page i18n', () => {
  context('Ghost sourced author page', () => {
    it('an author page with multiple posts does not render its post count i18n key', () => {
      cy.visit('/author/quincylarson/');

      cy.get(selectors.authorPostCount)
        .invoke('text')
        .then(text => text.trim())
        .should('not.equal', 'author.multiple-posts');
    });
  });

  context('Hashnode sourced author page', () => {
    it('an author page with one post does not render its post count i18n key', () => {
      cy.visit('/author/abbeyrenn/');

      cy.get(selectors.authorPostCount)
        .invoke('text')
        .then(text => text.trim())
        .should('not.equal', 'author.one-post');
    });
  });
});
