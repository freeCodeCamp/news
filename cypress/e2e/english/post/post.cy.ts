const selectors = {
  fccSource: "[data-test-label='x-fcc-source']",
  fullMetaDate: "[data-test-label='post-full-meta-date']",
  featureImage: "[data-test-label='feature-image']",
  authorProfileImage: "[data-test-label='profile-image']",
  postFullTitle: "[data-test-label='post-full-title']",
  postContent: "[data-test-label='post-content']",
  socialRowCTA: "[data-test-label='social-row-cta']",
  tweetButton: "[data-test-label='tweet-button']",
  mathJaxScript: "[data-test-label='mathjax-script']"
};

describe('Post (Hashnode sourced)', () => {
  context('General tests', () => {
    beforeEach(() => {
      cy.visit('/freecodecamp-press-books-handbooks/');
    });

    it('should render', () => {
      cy.contains('Introducing freeCodeCamp Press – Free Books for Developers');
    });

    it('should contain the fCC source meta tag with Hashnode as a source', () => {
      cy.get(selectors.fccSource).should('have.attr', 'content', 'Hashnode');
    });
  });

  context('Author with a Twitter handle', () => {
    beforeEach(() => {
      cy.visit('/freecodecamp-press-books-handbooks/');
    });

    it('should display the social row', () => {
      cy.get(selectors.socialRowCTA).should('be.visible');
    });

    it('the tweet button should open a Twitter window with the correct message and dimensions', () => {
      cy.get(selectors.tweetButton)
        .invoke('attr', 'onclick')
        .should('include', 'window.open')
        .should(
          'include',
          'https://twitter.com/intent/tweet?text=Thank%20you%20%40abbeyrenn%20for%20writing%20this%20helpful%20article.%0A%0AIntroducing%20freeCodeCamp%20Press%20%E2%80%93%20Free%20Books%20for%20Developers%0A%0Ahttp://localhost:8080/news/freecodecamp-press-books-handbooks/'
        )
        .should('include', 'share-twitter')
        .should('include', 'width=550, height=235')
        .should('include', 'return false');
    });
  });

  context('Author with no Twitter handle', () => {
    beforeEach(() => {
      cy.visit('/the-c-programming-handbook-for-beginners/');
    });

    it('should display the social row', () => {
      cy.get(selectors.socialRowCTA).should('be.visible');
    });

    it('the tweet button should open a Twitter window with the correct message and dimensions', () => {
      cy.get(selectors.tweetButton)
        .invoke('attr', 'onclick')
        .should('include', 'window.open')
        .should(
          'include',
          'https://twitter.com/intent/tweet?text=The%20C%20Programming%20Handbook%20for%20Beginners%0A%0Ahttp://localhost:8080/news/the-c-programming-handbook-for-beginners/'
        )
        .should('include', 'share-twitter')
        .should('include', 'width=550, height=235')
        .should('include', 'return false');
    });
  });

  context('Author with no profile image', () => {
    beforeEach(() => {
      cy.visit('/the-c-programming-handbook-for-beginners/');
    });

    it("should show a default image from Hashnode's CDN in the bylines at the top and bottom of the article", () => {
      cy.get<HTMLImageElement>(selectors.authorProfileImage).then($el => {
        expect($el[0].src).to.include('cdn.hashnode.com');
        expect($el[0].tagName.toLowerCase()).to.equal('img');
      });
    });

    it("the default image in the bylines at the top and bottom of the article should contain an `alt` attribute with the author's name", () => {
      cy.get<HTMLImageElement>(selectors.authorProfileImage).then($el =>
        expect($el[0].alt).to.equal('Dionysia Lemonaki')
      );
    });
  });

  context('No feature image', () => {
    beforeEach(() => {
      cy.visit('/hashnode-no-feature-image/');
    });

    it('posts with no feature image should fall back to the default fCC indigo image', () => {
      cy.get<HTMLImageElement>(selectors.featureImage)
        .should('exist')
        .then($el =>
          expect($el[0].src).to.equal(
            'https://cdn.freecodecamp.org/platform/universal/fcc_meta_1920X1080-indigo.png'
          )
        );
    });
  });

  context('MathJax', () => {
    context('Contains MathJax equations', () => {
      beforeEach(() => {
        cy.visit('/how-do-numerical-conversions-work/');
      });

      it('should have the MathJax script', () => {
        cy.get(selectors.mathJaxScript).should('exist');
      });

      it('should render MathJax equations within the post', () => {
        cy.get('mjx-container').should('exist');
      });
    });

    context('Does not contain MathJax equations', () => {
      beforeEach(() => {
        cy.visit('/freecodecamp-press-books-handbooks/');
      });

      it('should not have the MathJax script', () => {
        cy.get(selectors.mathJaxScript).should('not.exist');
      });

      it('should not render MathJax equations within the post', () => {
        cy.get('mjx-container').should('not.exist');
      });
    });
  });
});
