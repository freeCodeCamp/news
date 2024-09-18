const selectors = {
  tagPostCount: "[data-test-label='tag-post-count']"
};

describe('Tag page i18n (Hashnode sourced)', () => {
  it('a tag page with 1 post does not render its post count i18n key', () => {
    cy.visit('/tag/music/');

    cy.get(selectors.tagPostCount)
      .invoke('text')
      .then(text => text.trim())
      .should('not.equal', 'tag.one-post');
  });

  it('a tag page with multiple posts does not render its post count i18n key', () => {
    cy.visit('/tag/freecodecamp/');

    cy.get(selectors.tagPostCount)
      .invoke('text')
      .then(text => text.trim())
      .should('not.equal', 'tag.multiple-posts');
  });
});
