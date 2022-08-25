const selectors = {
  adText: "[data-test-label='ad-text']"
};

describe('Post i18n', () => {
  before(() => {
    cy.visit('/carbon-neutral-web3-curriculum-plans/amp');
  });

  it('the advertisement disclaimer text should not render its i18n key', () => {
    cy.get(selectors.adText)
      .invoke('text')
      .then(text => text.trim().toLowerCase())
      .should('not.equal', 'ad-text');
  });
});
