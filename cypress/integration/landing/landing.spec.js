const selectors = {
  bannerText: "[data-test-label='banner-text']"
}

describe('Landing page', () => {
  before(() => {
    cy.visit('/');
  });

  it('should render', () => {
    cy.contains(selectors.bannerText, 'Learn to code — free 3,000-hour curriculum');
  });
});
