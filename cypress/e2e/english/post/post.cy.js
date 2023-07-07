const selectors = {
  authorProfileImage: "[data-test-label='profile-image']",
  avatars: {
    top: "[data-test-label='author-header-no-bio'] [data-test-label='avatar']",
    bottom:
      "[data-test-label='author-header-with-bio'] [data-test-label='avatar']"
  },
  embeddedVideos: {
    fluidWidthVideoContainer: "[data-test-label='fluid-width-video-container']",
    fluidWidthVideoWrapper: "[data-test-label='fluid-width-video-wrapper']",
    ghostEditor: {
      youtubeHeading:
        "[data-test-label='youtube-link-pasted-into-ghost-editor-heading']",
      vimeoHeading:
        "[data-test-label='vimeo-link-pasted-into-ghost-editor-heading']"
    },
    markdown: {
      youtubeHeading: "[data-test-label='youtube-embedded-iframe-heading']",
      vimeoHeading: "[data-test-label='vimeo-embedded-iframe-heading']",
      bilibiliHeading: "[data-test-label='bilibili-embedded-iframe-heading']"
    },
    postContent: "[data-test-label='post-content']"
  },
  socialRowCTA: "[data-test-label='social-row-cta']",
  tweetButton: "[data-test-label='tweet-button']"
};

describe('Post', () => {
  context('General tests', () => {
    before(() => {
      cy.visit('/announcing-rust-course-replit-web');
    });

    it('should render', () => {
      cy.contains(
        "We're Building New Courses on Rust and Python + the Replit.web Framework"
      );
    });

    it("should show the author's profile image", () => {
      cy.get(selectors.authorProfileImage).then($el =>
        expect($el[0].tagName.toLowerCase()).to.equal('img')
      );
    });

    it("the author profile image should contain an `alt` attribute with the author's name", () => {
      cy.get(selectors.authorProfileImage).then($el =>
        expect($el[0].alt).to.equal('Quincy Larson')
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
          'https://twitter.com/intent/tweet?text=Thank%20you%20%40ossia%20for%20writing%20this%20helpful%20article.%0A%0AWe%27re%20Building%20New%20Courses%20on%20Rust%20and%20Python%20%2B%20the%20Replit.web%20Framework%0A%0Ahttp://localhost:8080/news/announcing-rust-course-replit-web/'
        )
        .should('include', 'share-twitter')
        .should('include', 'width=550, height=235')
        .should('include', 'return false');
    });
  });

  context('Author with no profile picture', () => {
    before(() => {
      cy.visit('/no-author-profile-pic');
    });

    it('should render', () => {
      cy.contains('No Author Profile Pic');
    });

    it('should show the avatar SVG in the byline at the top of the article', () => {
      cy.get(selectors.avatars.top).then($el =>
        expect($el[0].tagName.toLowerCase()).to.equal('svg')
      );
    });

    it('should show the avatar SVG in the second byline at the bottom of the article', () => {
      cy.get(selectors.avatars.bottom).then($el =>
        expect($el[0].tagName.toLowerCase()).to.equal('svg')
      );
    });

    it("all avatar SVGs should contain a `title` element with the author's name", () => {
      Object.values(selectors.avatars).forEach(selector => {
        cy.get(selector).contains('title', 'Mrugesh Mohapatra');
      });
    });
  });

  context('Embedded videos', () => {
    before(() => {
      cy.visit('/embedded-videos-post');
    });

    it('should render', () => {
      cy.contains('Embedded Videos Post');
    });

    context('Ghost editor', () => {
      it('should render the YouTube video with the expected wrappers and attributes', () => {
        cy.get(selectors.embeddedVideos.ghostEditor.youtubeHeading)
          .next()
          .next()
          .then($el => {
            const figure = $el[0];

            expect(figure.tagName.toLowerCase()).to.equal('figure');
            expect(figure.className).to.equal('kg-card kg-embed-card');
            cy.wrap(figure).find(
              selectors.embeddedVideos.fluidWidthVideoContainer
            );
            cy.wrap(figure)
              .find(selectors.embeddedVideos.fluidWidthVideoWrapper)
              .then($el => {
                const fluidWidthVideoWrapper = $el[0];

                expect(fluidWidthVideoWrapper.style.paddingTop).to.equal(
                  '56.5%'
                );
              });
            cy.wrap(figure)
              .find('iframe')
              .then($el => {
                const iframe = $el[0];

                expect(iframe.src).to.include(
                  'https://www.youtube.com/embed/rfscVS0vtbw'
                );
                expect(iframe.name).to.equal('fitvid0');
              });
          });
      });

      it('should render the Vimeo video with the expected wrappers and attributes', () => {
        cy.get(selectors.embeddedVideos.ghostEditor.vimeoHeading)
          .next()
          .next()
          .then($el => {
            const figure = $el[0];

            expect(figure.tagName.toLowerCase()).to.equal('figure');
            expect(figure.className).to.equal('kg-card kg-embed-card');
            cy.wrap(figure).find(
              selectors.embeddedVideos.fluidWidthVideoContainer
            );
            cy.wrap(figure)
              .find(selectors.embeddedVideos.fluidWidthVideoWrapper)
              .then($el => {
                const fluidWidthVideoWrapper = $el[0];

                expect(fluidWidthVideoWrapper.style.paddingTop).to.equal(
                  '53.0516%'
                );
              });
            cy.wrap(figure)
              .find('iframe')
              .then($el => {
                const iframe = $el[0];

                expect(iframe.src).to.include(
                  'https://player.vimeo.com/video/700486996'
                );
                expect(iframe.name).to.equal('fitvid1');
              });
          });
      });
    });

    context('Markdown', () => {
      it('should render the YouTube video with the expected wrappers and attributes', () => {
        cy.get(selectors.embeddedVideos.markdown.youtubeHeading)
          .next()
          .next()
          .then($el => {
            const fluidWidthVideoContainer = $el[0];

            expect(fluidWidthVideoContainer.tagName.toLowerCase()).to.equal(
              'div'
            );
            expect(fluidWidthVideoContainer.className).to.equal(
              'fluid-width-video-container'
            );

            cy.wrap(fluidWidthVideoContainer)
              .find(selectors.embeddedVideos.fluidWidthVideoWrapper)
              .then($el => {
                const fluidWidthVideoWrapper = $el[0];

                expect(fluidWidthVideoWrapper.style.paddingTop).to.equal(
                  '56.25%'
                );
              });
            cy.wrap(fluidWidthVideoContainer)
              .find('iframe')
              .then($el => {
                const iframe = $el[0];

                expect(iframe.src).to.include(
                  'https://www.youtube.com/embed/PkZNo7MFNFg'
                );
                expect(iframe.name).to.equal('fitvid2');
              });
          });
      });

      it('should render the Vimeo video with the expected wrappers and attributes', () => {
        cy.get(selectors.embeddedVideos.markdown.vimeoHeading)
          .next()
          .next()
          .then($el => {
            const fluidWidthVideoContainer = $el[0];

            expect(fluidWidthVideoContainer.tagName.toLowerCase()).to.equal(
              'div'
            );
            expect(fluidWidthVideoContainer.className).to.equal(
              'fluid-width-video-container'
            );

            cy.wrap(fluidWidthVideoContainer)
              .find(selectors.embeddedVideos.fluidWidthVideoWrapper)
              .then($el => {
                const fluidWidthVideoWrapper = $el[0];

                expect(fluidWidthVideoWrapper.style.paddingTop).to.equal(
                  '52.9688%'
                );
              });
            cy.wrap(fluidWidthVideoContainer)
              .find('iframe')
              .then($el => {
                const iframe = $el[0];

                expect(iframe.src).to.include(
                  'https://player.vimeo.com/video/700486996'
                );
                expect(iframe.name).to.equal('fitvid3');
              });
          });
      });

      it('should render the Bilibili video with the expected wrappers and attributes', () => {
        cy.get(selectors.embeddedVideos.markdown.bilibiliHeading)
          .next()
          .next()
          .then($el => {
            const fluidWidthVideoContainer = $el[0];

            expect(fluidWidthVideoContainer.tagName.toLowerCase()).to.equal(
              'div'
            );
            expect(fluidWidthVideoContainer.className).to.equal(
              'fluid-width-video-container'
            );

            cy.wrap(fluidWidthVideoContainer)
              .find(selectors.embeddedVideos.fluidWidthVideoWrapper)
              .then($el => {
                const fluidWidthVideoWrapper = $el[0];

                expect(fluidWidthVideoWrapper.style.paddingTop).to.equal('50%');
              });
            cy.wrap(fluidWidthVideoContainer)
              .find('iframe')
              .then($el => {
                const iframe = $el[0];

                expect(iframe.src).to.include(
                  '//player.bilibili.com/player.html?aid=370761589&bvid=BV1iZ4y1p7kr&'
                );
                expect(iframe.name).to.equal('fitvid4');
              });
          });
      });

      it('post content should end with the expected p element', () => {
        cy.get(selectors.embeddedVideos.postContent)
          .find('p')
          .last()
          .then($el => {
            const p = $el[0];

            expect(p.innerText).to.include(
              'Cats secretly make all the worlds muffins.'
            );
          });
      });
    });
  });
});
