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
          cy.visit('/graph-neural-networks-explained-with-examples/');
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
            '/what-programming-language-should-i-learn-first-19a33b0a467d/'
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

  // Note: Remove this testing block once we migrate all posts to Hashnode
  context('Duplicate slugs', () => {
    it('should build the original Ghost post if a more recent Hashnode post has the same slug', () => {
      cy.visit('/learn-react-in-spanish-course-for-beginners/');
      cy.get(selectors.postFullTitle).then($el => {
        expect($el.text().trim()).to.equal(
          'Learn React in Spanish – Course for Beginners'
        );
      });
      cy.get(selectors.fullMetaDate).then($el => {
        const publishedTimeUTC = new Date($el.attr('datetime')).toUTCString();
        expect(publishedTimeUTC).to.deep.equal('Tue, 15 Mar 2022 11:30:00 GMT');
      });
      cy.get(selectors.fccSource).should('have.attr', 'content', 'Ghost');
    });

    it('should build the original Ghost post if a more recent Hashnode page has the same slug', () => {
      cy.visit('/2021-top-contributors/');
      cy.get(selectors.postFullTitle).then($el => {
        expect($el.text().trim()).to.equal(
          'The Top freeCodeCamp Contributors of 2021'
        );
      });
      cy.get(selectors.fullMetaDate).then($el => {
        const publishedTimeUTC = new Date($el.attr('datetime')).toUTCString();
        expect(publishedTimeUTC).to.deep.equal('Thu, 30 Dec 2021 14:56:08 GMT');
      });
      cy.get(selectors.fccSource).should('have.attr', 'content', 'Ghost');
    });

    it('should build the original Hashnode post if a more recent Ghost post has the same slug', () => {
      cy.visit(
        '/ben-awad-is-a-gamedev-who-sleeps-9-hours-every-night-to-be-productive-podcast-121/'
      );
      cy.get(selectors.postFullTitle).then($el => {
        expect($el.text().trim()).to.equal(
          'Ben Awad is a GameDev Who Sleeps 9 Hours EVERY NIGHT to be Productive [Podcast #121]'
        );
      });
      cy.get(selectors.fullMetaDate).then($el => {
        const publishedTimeUTC = new Date($el.attr('datetime')).toUTCString();

        expect(publishedTimeUTC).to.deep.equal('Fri, 26 Apr 2024 15:29:48 GMT');
      });
      cy.get(selectors.fccSource).should('have.attr', 'content', 'Hashnode');
    });

    it('should build the original Hashnode post if a more recent Ghost page has the same slug', () => {
      cy.visit('/how-do-numerical-conversions-work/');
      cy.get(selectors.postFullTitle).then($el => {
        expect($el.text().trim()).to.equal(
          'How Do Numerical Conversions Work in Computer Systems? Explained With Examples'
        );
      });
      cy.get(selectors.fullMetaDate).then($el => {
        const publishedTimeUTC = new Date($el.attr('datetime')).toUTCString();
        expect(publishedTimeUTC).to.deep.equal('Wed, 29 May 2024 19:56:06 GMT');
      });
      cy.get(selectors.fccSource).should('have.attr', 'content', 'Hashnode');
    });
  });
});
