const selectors = {
  fccSource: "[data-test-label='x-fcc-source']",
  featureImage: "[data-test-label='feature-image']",
  authorProfileImage: "[data-test-label='profile-image']",
  ghostDefaultAvatar: "[data-test-label='avatar']",
  postContent: "[data-test-label='post-content']",
  socialRowCTA: "[data-test-label='social-row-cta']",
  tweetButton: "[data-test-label='tweet-button']"
};

describe('Post', () => {
  context('Ghost sourced posts', () => {
    context('General tests', () => {
      beforeEach(() => {
        cy.visit('/announcing-rust-course-replit-web/');
      });

      it('should render', () => {
        cy.contains(
          "We're Building New Courses on Rust and Python + the Replit.web Framework"
        );
      });

      it('should contain the fCC source meta tag with Ghost as a source', () => {
        cy.get(selectors.fccSource).should('have.attr', 'content', 'Ghost');
      });
    });

    context('Author with a Twitter handle', () => {
      beforeEach(() => {
        cy.visit('/announcing-rust-course-replit-web/');
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
            'https://twitter.com/intent/tweet?text=Thank%20you%20%40ossia%20for%20writing%20this%20helpful%20article.%0A%0AWe%27re%20Building%20New%20Courses%20on%20Rust%20and%20Python%20%2B%20the%20Replit.web%20Framework%0A%0Ahttp://localhost:8080/news/announcing-rust-course-replit-web/'
          )
          .should('include', 'share-twitter')
          .should('include', 'width=550, height=235')
          .should('include', 'return false');
      });
    });

    context('Author with no Twitter handle', () => {
      beforeEach(() => {
        cy.visit('/no-author-profile-pic/');
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
            'https://twitter.com/intent/tweet?text=No%20Author%20Profile%20Pic%0A%0Ahttp://localhost:8080/news/no-author-profile-pic/'
          )
          .should('include', 'share-twitter')
          .should('include', 'width=550, height=235')
          .should('include', 'return false');
      });
    });

    context('Author with no profile image', () => {
      beforeEach(() => {
        cy.visit('/no-author-profile-pic/');
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

    context('Embedded videos', () => {
      beforeEach(() => {
        cy.visit('/embedded-videos-post/');
      });

      it("the final element of the post's content block should be a `p` element, and not an embedded video modified by `fitvids` that was pushed to the bottom of the content block", () => {
        cy.get(selectors.postContent)
          .children()
          .last()
          .should('have.prop', 'tagName', 'P')
          .should('not.have.attr', 'data-test-label', 'fitted');
      });
    });

    context('No feature image', () => {
      beforeEach(() => {
        cy.visit('/ghost-no-feature-image/');
      });

      it('posts with no feature image should fall back to the default fCC indigo image', () => {
        cy.get(selectors.featureImage)
          .should('exist')
          .then($el =>
            expect($el[0].src).to.equal(
              'https://cdn.freecodecamp.org/platform/universal/fcc_meta_1920X1080-indigo.png'
            )
          );
      });
    });
  });

  context('Hashnode sourced posts', () => {
    context('General tests', () => {
      beforeEach(() => {
        cy.visit('/freecodecamp-press-books-handbooks/');
      });

      it('should render', () => {
        cy.contains(
          'Introducing freeCodeCamp Press – Free Books for Developers'
        );
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
        cy.get(selectors.authorProfileImage).then($el => {
          expect($el[0].src).to.include('cdn.hashnode.com');
          expect($el[0].tagName.toLowerCase()).to.equal('img');
        });
      });

      it("the default image in the bylines at the top and bottom of the article should contain an `alt` attribute with the author's name", () => {
        cy.get(selectors.authorProfileImage).then($el =>
          expect($el[0].alt).to.equal('Dionysia Lemonaki')
        );
      });
    });

    context('No feature image', () => {
      beforeEach(() => {
        cy.visit('/hashnode-no-feature-image/');
      });

      it('posts with no feature image should fall back to the default fCC indigo image', () => {
        cy.get(selectors.featureImage)
          .should('exist')
          .then($el =>
            expect($el[0].src).to.equal(
              'https://cdn.freecodecamp.org/platform/universal/fcc_meta_1920X1080-indigo.png'
            )
          );
      });
    });
  });
});
