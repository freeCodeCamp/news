const selectors = {
  AMPAdScript: 'script[src*="amp-ad-0.1.js"]',
  adContainer: "[data-test-label='ad-wrapper']"
};

describe('Ads', () => {
  before(() => {
    cy.visit('/javascript-array-length');
  });

  it('the adsense script should not be within the `head` element', () => {
    cy.get(`head ${selectors.ampAdScript}`).should('not.exist');
  });

  it('the post should not include any ad containers', () => {
    cy.get(selectors.adContainer).should('not.exist');
  });
});
