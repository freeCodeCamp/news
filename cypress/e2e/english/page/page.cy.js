const selectors = {
  postContent: "[data-test-label='post-content']"
};

describe('Page', () => {
  context('General tests', () => {
    beforeEach(() => {
      cy.visit('/thank-you-for-donating');
    });

    it('should render', () => {
      cy.contains(
        'Please check your email for a donation receipt. Forward it to donors@freecodecamp.org.'
      );
    });
  });

  context('Embedded videos', () => {
    beforeEach(() => {
      cy.visit('/embedded-videos-page');
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
});
