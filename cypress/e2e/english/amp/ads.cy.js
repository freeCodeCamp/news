const {
  testAllowedAMPAttributes
} = require('../../../support/utils/amp-helpers');

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

  it('amp-ad elements should have the expected attributes and values', () => {
    cy.get('.ad-container amp-ad').each($el => {
      // Test for the bare essential attributes since data-auto-format and data-full-width can cause other attributes
      // to change dynamically
      // To do: Refactor npm scripts and config to use Cypress env vars for data-ad-client and data-ad-slot. Might also
      // be able to get rid of the .env.ci file altogether
      expect($el.attr('data-ad-client')).to.equal('ca-pub-1234567890');
      expect($el.attr('data-ad-slot')).to.equal('1234567890');
      expect($el.attr('width')).to.exist;
      expect(Number($el.attr('height'))).to.be.at.least(320); // Responsive amp-ads must have a height of at least 320
      expect($el.attr('type')).to.equal('adsense');
    });
  });

  it('all amp-ad elements should only contain the allowed attributes', () => {
    cy.document().then(doc => {
      const AMPAdElements = [...doc.querySelectorAll('amp-ad')];

      AMPAdElements.forEach(el => testAllowedAMPAttributes('amp-ad', el));
    });
  });
});
