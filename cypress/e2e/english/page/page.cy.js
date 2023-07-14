const selectors = {
  postContent: "[data-test-label='post-content']"
};

describe('Page', () => {
  context('General tests', () => {
    before(() => {
      cy.visit('/thank-you-for-donating');
    });

    it('should render', () => {
      cy.contains(
        'Please check your email for a donation receipt. Forward it to donors@freecodecamp.org.'
      );
    });
  });

  context('Embedded videos', () => {
    before(() => {
      cy.visit('/embedded-videos-page');
    });

    it('should render', () => {
      cy.contains('Embedded Videos Page');
    });

    it('the final element of the page content should be a `p` element', () => {
      cy.get(selectors.postContent)
        .children()
        .last()
        .then($el => {
          const finalEl = $el[0];

          expect(finalEl.tagName.toLowerCase()).to.equal('p');
        });
    });
  });
});
