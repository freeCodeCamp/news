const selectors = {
  comments: "[data-test-label='comments']",
  socialRow: "[data-test-label='social-row']"
};

describe('Post', () => {
  before(() => {
    cy.visit('/javascript-array-length');
  });

  it('should render', () => {
    cy.contains('JavaScript 数组的长度');
  });

  it('should display a comments section', () => {
    cy.get(selectors.comments).should('be.visible');
  });

  it('should not display a social row', () => {
    cy.get(selectors.socialRow).should('not.exist');
  });
});
