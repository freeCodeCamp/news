const selectors = {
  fccSource: "[data-test-label='x-fcc-source']",
  featureImage: "[data-test-label='feature-image']",
  postContent: "[data-test-label='post-content']"
};

describe('Page', () => {
  context('General tests', () => {
    beforeEach(() => {
      cy.visit('/thank-you-for-donating/');
    });

    it('should render', () => {
      cy.contains(
        'Please check your email for a donation receipt. Forward it to donors@freecodecamp.org.'
      );
    });

    it('should contain the fCC source meta tag with Ghost as a source', () => {
      cy.get(selectors.fccSource).should('have.attr', 'content', 'Ghost');
    });
  });

  context('Embedded videos', () => {
    beforeEach(() => {
      cy.visit('/embedded-videos-page/');
    });

    it('should render', () => {
      cy.contains('Embedded Videos Page');
    });

    it("the final element of the page's content block should be a `p` element, and not an embedded video modified by `fitvids` that was pushed to the bottom of the content block", () => {
      cy.get(selectors.postContent)
        .children()
        .last()
        .should('have.prop', 'tagName', 'P')
        .should('not.have.attr', 'data-test-label', 'fitted');
    });
  });

  context('Includes feature image', () => {
    beforeEach(() => {
      cy.visit('/thank-you-for-donating/');
    });

    it('pages with a feature image should include a feature image element', () => {
      cy.get(selectors.featureImage).should('exist');
    });
  });

  context('No feature image', () => {
    beforeEach(() => {
      cy.visit('/embedded-videos-page/');
    });

    it('pages with no feature image should **not** fall back to the default fCC indigo image', () => {
      cy.get(selectors.featureImage).should('not.exist');
    });
  });
});
