describe('Landing', () => {
  before(() => {
    // Update baseUrl to include current language
    Cypress.config('baseUrl', 'http://localhost:8080/espanol/news');
    cy.visit('/');
  });

  it('should render basic components', () => {
    cy.get('nav').should('be.visible');
    cy.get('.banner').should('be.visible');
    cy.get('footer').should('be.visible');
  });
});
