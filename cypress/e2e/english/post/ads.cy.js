const selectors = {
  scripts: {
    adsense: 'script[src*="adsbygoogle.js"]',
    toggleAdLayout: '[data-test-label="toggle-ad-layout"]'
  },
  ads: {
    wrapper: "[data-test-label='ad-wrapper']",
    text: "[data-test-label='ad-text']"
  }
};

describe('Ads', () => {
  context('General tests', () => {
    before(() => {
      cy.visit('/carbon-neutral-web3-curriculum-plans');
    });

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
    context('Ad wrappers and containers', () => {
      before(() => {
        cy.visit('/carbon-neutral-web3-curriculum-plans');
      });

      it('the post should contain at least one ad', () => {
        cy.get(selectors.ads.wrapper).should('have.length.gte', 1);
      });

      it('all ad containers in the post should be visible', () => {
        cy.get(selectors.ads.wrapper).should('be.visible');
      });

      it('each ad container should contain a visible text disclaimer', () => {
        cy.get(selectors.ads.wrapper).each($el => {
          cy.wrap($el).find(selectors.ads.text).should('be.visible');
        });
      });

      it('each ad container should contain an inner `ins` element', () => {
        cy.get(selectors.ads.wrapper).each($el => {
          cy.wrap($el).find('ins');
        });
      });

      it('each ad container should contain an inner `script` element', () => {
        cy.get(selectors.ads.wrapper).each($el => {
          cy.wrap($el).find('script').should('have.length', 1);
        });
      });

      it('ad elements should have the expected attributes and values', () => {
        cy.get('.ad-wrapper ins').each($el => {
          // Test for the bare essential attributes since data-ad-format can cause other attributes to change dynamically
          // To do: Refactor npm scripts and config to use Cypress env vars for data-ad-client and data-ad-slot. Might also
          // be able to get rid of the .env.ci file altogether
          expect($el.attr('data-ad-client')).to.equal('ca-pub-1234567890');
          expect($el.attr('data-ad-slot')).to.equal('1234567890');
          expect($el.attr('data-ad-format')).to.equal('auto');
          expect($el.attr('data-full-width-responsive')).to.equal('true');
        });
      });
    });

    context('Images and videos', () => {
      before(() => {
        cy.visit('/ad-layout-images-and-videos');
      });

      it('All Ghost editor images in the post body should have a max-width of 100%', () => {
        cy.get('.ad-layout .post-full-content .kg-image-card img').each($el => {
          expect($el.css('max-width')).to.equal('100%');
        });
      });

      it('All markdown images in the post body should have a max-width of 100%', () => {
        cy.get('.ad-layout .post-full-content p img').each($el => {
          expect($el.css('max-width')).to.equal('100%');
        });
      });

      // Note: HTML and markdown video embeds are rendered the same way
      it('All HTML videos in the post body should have a max-width of 100%', () => {
        cy.get('video').each($el => {
          expect($el.css('max-width')).to.equal('100%');
        });
      });
    });
  });

  // To do: Add another context for authenticated donors once we start setting that cookie on Learn
  context('Authenticated', () => {
    context('Ad wrappers and containers', () => {
      before(() => {
        cy.visit('/carbon-neutral-web3-curriculum-plans');
        cy.setCookie('jwt_access_token', '0123456789');
        cy.reload(); // Reload the page to ensure the cookie is set and the styles to hide ad containers are applied
      });

      it('all ad containers in the post should not exist', () => {
        cy.get(selectors.ads.wrapper).should('not.exist');
      });
    });
  });
});
