const selectors = {
  bannerText: "[data-test-label='banner-text']"
}

describe('Landing', () => {
  before(() => {
    // Update baseUrl to include current language
    Cypress.config('baseUrl', 'http://localhost:8080/espanol/news');
    cy.visit('/');
  });

  it('should render', () => {
    cy.contains(selectors.bannerText, 'Charla con otros desarrolladores en español');
  });
});
