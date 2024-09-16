const selectors = {
  fccSource: "[data-test-label='x-fcc-source']",
  fullMetaDate: "[data-test-label='post-full-meta-date']",
  featureImage: "[data-test-label='feature-image']",
  authorProfileImage: "[data-test-label='profile-image']",
  ghostDefaultAvatar: "[data-test-label='avatar']",
  postFullTitle: "[data-test-label='post-full-title']",
  postContent: "[data-test-label='post-content']",
  socialRowCTA: "[data-test-label='social-row-cta']",
  tweetButton: "[data-test-label='tweet-button']",
  mathJaxScript: "[data-test-label='mathjax-script']"
};

describe('Post (Ghost sourced)', () => {
  before(() => {
    // Update baseUrl to include current language
    Cypress.config('baseUrl', 'http://localhost:8080/espanol/news/');
  });

  context('General tests', () => {
    beforeEach(() => {
      cy.visit(
        '/como-funciona-el-operado-de-signo-de-interrogacion-javascript/'
      );
    });

    it('should render', () => {
      cy.contains(
        'Cómo funciona el operador de signo de interrogación (?) en JavaScript'
      );
    });

    it('should contain the fCC source meta tag with Ghost as a source', () => {
      cy.get(selectors.fccSource).should('have.attr', 'content', 'Ghost');
    });
  });

  context('Author with a Twitter handle', () => {
    beforeEach(() => {
      cy.visit(
        '/como-funciona-el-operado-de-signo-de-interrogacion-javascript/'
      );
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
          'https://twitter.com/intent/tweet?text=Gracias%20%40RafaelDavisH%20por%20escribir%20este%20%C3%BAtil%20art%C3%ADculo.%0A%0AC%C3%B3mo%20funciona%20el%20operador%20de%20signo%20de%20interrogaci%C3%B3n%20(%3F)%20en%20JavaScript%0A%0Ahttp://localhost:8080/espanol/news/como-funciona-el-operado-de-signo-de-interrogacion-javascript/'
        )
        .should('include', 'share-twitter')
        .should('include', 'width=550, height=235')
        .should('include', 'return false');
    });
  });

  context('Author with no Twitter handle', () => {
    beforeEach(() => {
      cy.visit('/ghost-no-author-profile-pic/');
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
          'https://twitter.com/intent/tweet?text=Ghost%20No%20Author%20Profile%20Pic%0A%0Ahttp://localhost:8080/espanol/news/ghost-no-author-profile-pic/'
        )
        .should('include', 'share-twitter')
        .should('include', 'width=550, height=235')
        .should('include', 'return false');
    });
  });

  context('Author with no profile image', () => {
    beforeEach(() => {
      cy.visit('/ghost-no-author-profile-pic/');
    });

    it('should show the avatar SVG in the bylines at the top and bottom of the article', () => {
      cy.get(selectors.ghostDefaultAvatar).then($el =>
        expect($el[0].tagName.toLowerCase()).to.equal('svg')
      );
    });

    it("all avatar SVGs should contain a `title` element with the author's name", () => {
      cy.get(selectors.ghostDefaultAvatar).contains(
        'title',
        'Mrugesh Mohapatra'
      );
    });
  });

  context('No feature image', () => {
    beforeEach(() => {
      cy.visit('/ghost-no-feature-image/');
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
        cy.visit(
          '/como-funcionan-las-conversiones-numericas-en-los-sistemas-informaticos-explicado-con-ejemplos/'
        );
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
        cy.visit(
          '/como-funciona-el-operado-de-signo-de-interrogacion-javascript/'
        );
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
