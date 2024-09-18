const selectors = {
  errorMessage: "[data-test-label='error-message']"
};

// Tests here should apply to all 404 pages, regardless of the source
describe('404 i18n', () => {
  beforeEach(() => {
    cy.visit('/testing-testing-1-2/', { failOnStatusCode: false });
  });

  it('the error message elements do not render their i18n keys', () => {
    cy.get(`${selectors.errorMessage} .error-description`)
      .invoke('text')
      .then(text => text.trim())
      .should('not.equal', '404.page-not-found');
    cy.get(`${selectors.errorMessage} .error-link`)
      .invoke('text')
      .then(text => text.trim())
      .should('not.contain', '404.go-to-front-page');
  });
});
