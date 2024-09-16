const selectors = {
  tagPostCount: "[data-test-label='tag-post-count']"
};

describe('Tag page i18n (Ghost sourced)', () => {
  before(() => {
    // Update baseUrl to include current language
    Cypress.config('baseUrl', 'http://localhost:8080/espanol/news/');
  });

  it('a tag page with 1 post does not render its post count i18n key', () => {
    cy.visit('/tag/linux/');

    cy.get(selectors.tagPostCount)
      .invoke('text')
      .then(text => text.trim())
      .should('not.equal', 'tag.one-post');
  });

  it('a tag page with multiple posts does not render its post count i18n key', () => {
    cy.visit('/tag/javascript/');

    cy.get(selectors.tagPostCount)
      .invoke('text')
      .then(text => text.trim())
      .should('not.equal', 'tag.multiple-posts');
  });
});
