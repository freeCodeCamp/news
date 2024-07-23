const selectors = {
  fccSource: "[data-test-label='x-fcc-source']",
  featureImage: "[data-test-label='feature-image']",
  postFullTitle: "[data-test-label='post-full-title']",
  postContent: "[data-test-label='post-content']",
  articlePublishedTime: 'head meta[property="article:published_time"]'
};

describe('Page', () => {
  context('Ghost sourced pages', () => {
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

  context('Hashnode sourced pages', () => {
    context('General tests', () => {
      beforeEach(() => {
        cy.visit('/thank-you-for-being-a-supporter/');
      });

      it('should render', () => {
        cy.contains('Thank You for Being a Supporter');
      });

      it('should contain the fCC source meta tag with Hashnode as a source', () => {
        cy.get(selectors.fccSource).should('have.attr', 'content', 'Hashnode');
      });

      it('should not contain the article:published_time meta tag', () => {
        cy.get(selectors.articlePublishedTime).should('not.exist');
      });
    });
  });

  // Note: Remove this testing block once we migrate all posts to Hashnode
  context('Duplicate slugs', () => {
    // We only test for Ghost sourced pages here when a Ghost and Hashnode
    // page have the same slug because Hashnode pages do not show a published
    // date, so Ghost sourced pages are the only ones that will be built in this
    // scenario.
    it('should build the Ghost page if a Hashnode page has the same slug', () => {
      cy.visit('/thank-you-for-donating/');
      cy.get(selectors.postFullTitle).then($el => {
        expect($el.text().trim()).to.equal(
          'Please check your email for a donation receipt. Forward it to donors@freecodecamp.org.'
        );
      });
      cy.get(selectors.articlePublishedTime).should(
        'have.attr',
        'content',
        '2020-03-16T17:03:46.000Z'
      );
      cy.get(selectors.fccSource).should('have.attr', 'content', 'Ghost');
    });

    it('should build the original Ghost page if a more recent Hashnode post has the same slug', () => {
      cy.visit('/top-contributors-2023/');
      cy.get(selectors.postFullTitle).then($el => {
        expect($el.text().trim()).to.equal('Top Contributors 2023');
      });
      cy.get(selectors.articlePublishedTime).should(
        'have.attr',
        'content',
        '2023-12-20T07:53:00.000Z'
      );
      cy.get(selectors.fccSource).should('have.attr', 'content', 'Ghost');
    });
  });
});
