import {
  getPostCards,
  loadAndCountAllPostCards
} from '../../../support/utils/post-cards';

const selectors = {
  authorProfileImage: ".under-header-content [data-test-label='profile-image']",
  avatar: ".under-header-content [data-test-label='avatar']",
  authorName: "[data-test-label='author-name']",
  authorLocation: "[data-test-label='author-location']",
  authorPostCount: "[data-test-label='author-post-count']",
  bullet: "[data-test-label='bullet']",
  socialMedia: {
    facebook: {
      link: "[data-test-label='facebook-link']",
      icon: "[data-test-label='facebook-icon']"
    },
    rss: {
      link: "[data-test-label='rss-link']",
      icon: "[data-test-label='rss-icon']"
    },
    website: {
      link: "[data-test-label='website-link']",
      icon: "[data-test-label='website-icon']"
    },
    x: {
      link: "[data-test-label='x-link']",
      icon: "[data-test-label='x-icon']"
    },
    github: {
      link: "[data-test-label='github-link']",
      icon: "[data-test-label='github-icon']"
    }
  }
};

describe('Author page', () => {
  before(() => {
    // Update baseUrl to include current language
    Cypress.config('baseUrl', 'http://localhost:8080/espanol/news/');
  });

  context('Ghost sourced', () => {
    context('Author with profile image', () => {
      beforeEach(() => {
        cy.visit('/author/rafael/');
      });

      it('should render', () => {
        cy.contains(selectors.authorName, 'Rafael D. Hernandez');
      });

      it("should show the author's profile image", () => {
        cy.get(selectors.authorProfileImage).then($el =>
          expect($el[0].tagName.toLowerCase()).to.equal('img')
        );
      });

      it("the author profile image should contain an `alt` attribute with the author's name", () => {
        cy.get<HTMLImageElement>(selectors.authorProfileImage).then($el =>
          expect($el[0].alt).to.equal('Rafael D. Hernandez')
        );
      });

      it("should show the author's location and post count on larger screens", () => {
        cy.get(selectors.authorLocation).should('be.visible');
        cy.get(selectors.authorPostCount).should('be.visible');
      });

      it(`should show 18 posts on load`, () => {
        getPostCards().should('have.length', 18);
      });

      it('should show the correct number of total posts', () => {
        loadAndCountAllPostCards(selectors.authorPostCount);
      });
    });

    context('Author with no profile image', () => {
      beforeEach(() => {
        cy.visit('/author/mrugesh/');
      });

      it('should render', () => {
        cy.contains(selectors.authorName, 'Mrugesh Mohapatra');
      });

      it('should show the avatar SVG', () => {
        cy.get(selectors.avatar).then($el =>
          expect($el[0].tagName.toLowerCase()).to.equal('svg')
        );
      });

      it("the avatar SVG should contain a `title` element with the author's name", () => {
        cy.get(selectors.avatar).contains('title', 'Mrugesh Mohapatra');
      });
    });

    context('Social media', () => {
      // Note: Ghost only supports links to Facebook, Twitter, and websites
      context('Facebook', () => {
        context('An author with no Facebook profile link', () => {
          before(() => {
            cy.visit('/author/rafael/');
          });

          it('should not show an X link and icon', () => {
            cy.get(selectors.socialMedia.facebook.link).should('not.exist');
            cy.get(selectors.socialMedia.facebook.icon).should('not.exist');
          });
        });

        context('An author with a Facebook profile link', () => {
          before(() => {
            cy.visit('/author/freecodecamp/');
          });

          it('should show a Facebook link and icon', () => {
            cy.get(selectors.socialMedia.facebook.link)
              .should(
                'have.attr',
                'href',
                'https://www.facebook.com/freecodecamp'
              )
              .find('svg')
              .should('have.attr', 'data-test-label', 'facebook-icon');
          });
        });
      });

      context('Twitter', () => {
        context('Author with no Twitter profile link', () => {
          before(() => {
            cy.visit('/author/mrugesh/');
          });

          it('should not show an X link and icon', () => {
            cy.get(selectors.socialMedia.x.link).should('not.exist');
            cy.get(selectors.socialMedia.x.icon).should('not.exist');
          });
        });

        context('Author with a Twitter profile link', () => {
          before(() => {
            cy.visit('/author/rafael/');
          });

          it('should show an X link and icon', () => {
            cy.get(selectors.socialMedia.x.link)
              .should('have.attr', 'href', 'https://x.com/RafaelDavisH')
              .find('svg')
              .should('have.attr', 'data-test-label', 'x-icon');
          });
        });

        context('Website', () => {
          context('Author with no website link', () => {
            before(() => {
              cy.visit('/author/rafael/');
            });

            it('should not show a website link and icon', () => {
              cy.get(selectors.socialMedia.website.link).should('not.exist');
              cy.get(selectors.socialMedia.website.icon).should('not.exist');
            });
          });

          context('Author with a website link', () => {
            before(() => {
              cy.visit('/author/freecodecamp/');
            });

            it('should show a website link and icon', () => {
              cy.get(selectors.socialMedia.website.link)
                .should('have.attr', 'href', 'https://www.freecodecamp.org')
                .find('svg')
                .should('have.attr', 'data-test-label', 'website-icon');
            });
          });
        });

        // Note: All authors should have an RSS link and icon
        context('RSS', () => {
          before(() => {
            cy.visit('/author/rafael/');
          });

          // TODO: Links for RSS feeds are currently broken, so fix and test them in
          // a future PR
          it('should show an RSS link and icon', () => {
            cy.get(selectors.socialMedia.rss.link)
              // .should('have.attr', 'href', 'https://feedly.com/i/subscription/feed/http://localhost:8080/news/author/rafael/rss/')
              .find('svg')
              .should('have.attr', 'data-test-label', 'rss-icon');
          });
        });
      });
    });
  });

  context('Hashnode sourced', () => {
    context('Author with profile image', () => {
      beforeEach(() => {
        cy.visit('/author/rafaeldavish/');
      });

      it('should render', () => {
        cy.contains(selectors.authorName, 'Rafael D. Hernandez');
      });

      it("should show the author's profile image", () => {
        cy.get(selectors.authorProfileImage).then($el =>
          expect($el[0].tagName.toLowerCase()).to.equal('img')
        );
      });

      it("the author profile image should contain an `alt` attribute with the author's name", () => {
        cy.get<HTMLImageElement>(selectors.authorProfileImage).then($el =>
          expect($el[0].alt).to.equal('Rafael D. Hernandez')
        );
      });

      it(`should show 2 posts on load`, () => {
        getPostCards().should('have.length', 2);
      });

      it('should show the correct number of total posts', () => {
        loadAndCountAllPostCards(selectors.authorPostCount);
      });
    });

    context('Social media', () => {
      context('Website', () => {
        context('Author with a website link', () => {
          before(() => {
            cy.visit('/author/rafaeldavish/');
          });

          it('should show a website link and icon', () => {
            cy.get(selectors.socialMedia.website.link)
              .should('have.attr', 'href', 'https://rafaeldavis.dev')
              .find('svg')
              .should('have.attr', 'data-test-label', 'website-icon');
          });
        });
      });

      context('GitHub', () => {
        context('Author with a GitHub profile link', () => {
          before(() => {
            cy.visit('/author/rafaeldavish/');
          });

          it('should show a GitHub link and icon', () => {
            cy.get(selectors.socialMedia.github.link)
              .should('have.attr', 'href', 'https://github.com/RafaelDavisH')
              .find('svg')
              .should('have.attr', 'data-test-label', 'github-icon');
          });
        });
      });

      // Note: All authors should have an RSS link and icon
      context('RSS', () => {
        before(() => {
          cy.visit('/author/rafaeldavish/');
        });

        // TODO: Links for RSS feeds are currently broken, so fix and test them in
        // a future PR
        it('should show an RSS link and icon', () => {
          cy.get(selectors.socialMedia.rss.link)
            // .should(
            //   'have.attr',
            //   'href',
            //   'https://feedly.com/i/subscription/feed/http://localhost:8080/news/author/rafaeldavish/rss/'
            // )
            .find('svg')
            .should('have.attr', 'data-test-label', 'rss-icon');
        });
      });
    });
  });
});
