const selectors = {
  socialRow: "[data-test-label='social-row']"
};

describe('Post', () => {
  before(() => {
    // Update baseUrl to include current language
    Cypress.config('baseUrl', 'http://localhost:8080/chinese/news');
  });

  beforeEach(() => {
    cy.visit('/javascript-array-length');
  });

  it('should render', () => {
    cy.contains('JavaScript 数组的长度');
  });

  it('should not display a social row', () => {
    cy.get(selectors.socialRow).should('not.exist');
  });
});
