const selectors = {
  AMPAdScript: 'script[src*="amp-ad-0.1.js"]',
  ads: {
    container: "[data-test-label='ad-container']",
    text: "[data-test-label='ad-text']"
  }
};

describe('Ads', () => {
  before(() => {
    cy.visit('/carbon-neutral-web3-curriculum-plans/amp');
  });

  it('the amp-ad script should be within the `head` element', () => {
    cy.get(`head ${selectors.AMPAdScript}`).should('have.length', 1);
  });

  it('the post should contain at least one ad', () => {
    cy.get(selectors.ads.container).should('have.length.gte', 1);
  });

  it('all ad containers in the post should be visible', () => {
    cy.get(selectors.ads.container).should('be.visible');
  });

  it('each ad container should contain a visible text disclaimer', () => {
    cy.get(selectors.ads.container).each($el => {
      cy.wrap($el).find(selectors.ads.text).should('be.visible');
    });
  });

  it('each ad container should contain an inner `amp-ad` element', () => {
    cy.get(selectors.ads.container).each($el => {
      cy.wrap($el).find('amp-ad');
    });
  });

  it('ads within `section.post-full-content` should not be placed between two adjacent heading elements', () => {
    cy.get('section.post-full-content h1, h2, h3, h4, h5, h6').each(
      $heading => {
        cy.wrap($heading).next().should('not.have.class', 'ad-container');
      }
    );
  });
});
