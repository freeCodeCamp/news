const selectors = {
  scripts: {
    adsense: '[data-test-label="adsense"]',
    toggleAdLayout: '[data-test-label="toggle-ad-layout"]'
  },
  ads: {
    container: "[data-test-label='ad-container']",
    text: "[data-test-label='ad-text']"
  }
};

describe('Ads', () => {
  before(() => {
    cy.visit('/carbon-neutral-web3-curriculum-plans');
  });

  context('General tests', () => {
    it('the adsense script should be within the `head` element', () => {
      cy.get(`head ${selectors.scripts.adsense}`).should('have.length', 1);
    });

    it('the toggle ads layout script should be within the `head` element', () => {
      cy.get(`head ${selectors.scripts.toggleAdLayout}`).should(
        'have.length',
        1
      );
    });
  });

  context('Not authenticated', () => {
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

    it('each ad container should contain an inner `ins` element', () => {
      cy.get(selectors.ads.container).each($el => {
        cy.wrap($el).find('ins');
      });
    });

    it('each ad container should contain an inner `script` element', () => {
      cy.get(selectors.ads.container).each($el => {
        cy.wrap($el).find('script').should('have.length', 1);
      });
    });

    it('for ads within `section.post-full-content`, each `ins` element should have a `data-ad-format` attribute with the value `rectangle`', () => {
      cy.get(`section.post-full-content ${selectors.ads.container}`).each(
        $el => {
          cy.wrap($el)
            .find('ins')
            .should('have.attr', 'data-ad-format', 'rectangle');
        }
      );
    });

    it('for the banner ad at the bottom of the post, the `ins` element should have a `data-ad-format` attribute with the value `auto`', () => {
      cy.get(selectors.ads.container)
        .last()
        .find('ins')
        .should('have.attr', 'data-ad-format', 'auto');
    });

    it('ads within `section.post-full-content` should not be placed between two adjacent heading elements', () => {
      cy.get('section.post-full-content h1, h2, h3, h4, h5, h6').each(
        $heading => {
          cy.wrap($heading).next().should('not.have.class', 'ad-container');
        }
      );
    });
  });

  // To do: Add another context for authenticated donors once we start setting that cookie on Learn
  context('Authenticated', () => {
    before(() => {
      cy.setCookie('jwt_access_token', '0123456789');
      cy.reload(); // Reload the page to ensure the cookie is set and the styles to hide ad containers are applied
    });

    it('all ad containers in the post should not be visible', () => {
      cy.get(selectors.ads.container).should('not.be.visible');
    });
  });
});
