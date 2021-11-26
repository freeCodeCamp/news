const selectors = {
  tagName: "[data-test-label='tag-name']"
}

describe('Tag page', () => {
  before(() => {
    cy.visit('/tag/freecodecamp');
  });

  it('should render', () => {
    cy.contains(selectors.tagName, '#FREECODECAMP');
  });
});
