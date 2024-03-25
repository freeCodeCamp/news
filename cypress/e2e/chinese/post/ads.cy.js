const selectors = {
  scripts: {
    adsense: 'script[src*="adsbygoogle.js"]'
  },
  adContainer: "[data-test-label='ad-wrapper']"
};

describe('Ads', () => {
  before(() => {
    // Update baseUrl to include current language
    Cypress.config('baseUrl', 'http://localhost:8080/chinese/news/');
  });

  beforeEach(() => {
    cy.visit('/javascript-array-length/');
  });

  it('the adsense script should not be within the `head` element', () => {
    cy.get(`head ${selectors.scripts.adsense}`).should('not.exist');
  });

  it('the post should not include any ad containers', () => {
    cy.get(selectors.adContainer).should('not.exist');
  });

  it('the post should not use the ad layout', () => {
    cy.get('.ad-layout').should('not.exist');
  });
});
