const selectors = {
  scripts: {
    adsense: 'script[src*="adsbygoogle.js"]',
    toggleAdLayout: '[data-test-label="toggle-ad-layout"]'
  },
  adContainer: "[data-test-label='ad-wrapper']"
};

describe('Ads', () => {
  before(() => {
    cy.visit('/javascript-array-length');
  });

  it('the adsense script should not be within the `head` element', () => {
    cy.get(`head ${selectors.scripts.adsense}`).should('not.exist');
  });

  it('the toggle ads layout script should not be within the `head` element', () => {
    cy.get(`head ${selectors.scripts.toggleAdLayout}`).should('not.exist');
  });

  it('the post should not include any ad containers', () => {
    cy.get(selectors.adContainer).should('not.exist');
  });
});
