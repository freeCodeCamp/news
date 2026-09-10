const selectors = {
  rail: "[data-test-label='class-central-course-rail']",
  banner: "[data-test-label='class-central-course-banner']"
};

describe('Sponsored courses (Class Central)', () => {
  before(() => {
    // Update baseUrl to include current language
    Cypress.config('baseUrl', 'http://localhost:8080/espanol/news/');
  });

  beforeEach(() => {
    cy.visit('/como-funciona-el-operado-de-signo-de-interrogacion-javascript/');
  });

  it('does not render sponsored courses on a non-English publication', () => {
    cy.get(selectors.rail).should('not.exist');
    cy.get(selectors.banner).should('not.exist');
  });
});
