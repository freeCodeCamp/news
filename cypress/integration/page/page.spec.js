describe('Page', () => {
  before(() => {
    cy.visit('/thank-you-for-donating');
  });

  it('should render', () => {
    cy.contains("Please check your email for a donation receipt. Forward it to donors@freecodecamp.org.");
  });
});
