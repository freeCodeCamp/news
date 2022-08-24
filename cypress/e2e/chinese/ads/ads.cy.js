const selectors = {
  scripts: {
    adsense: '[data-test-label="adsense"]',
    toggleAdLayout: '[data-test-label="toggle-ad-layout"]'
  },
  ads: {
    container: "[data-test-label='ad-container']"
  }
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
    cy.get(selectors.ads.container).should('not.exist');
  });
});
