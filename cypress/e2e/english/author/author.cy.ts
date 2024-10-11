const {
  getPostCards,
  loadAndCountAllPostCards
} = require('../../../support/utils/post-cards');

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
    }
  }
};

describe('Author page (Hashnode sourced)', () => {
  context('General tests', () => {
    // Tests here should apply to all author pages, regardless of the source
    beforeEach(() => {
      cy.visit('/author/abbeyrenn/');
    });

    it('should render', () => {
      cy.contains(selectors.authorName, 'Abigail Rennemeyer');
    });

    it("should show the author's location and post count on larger screens", () => {
      cy.get(selectors.authorLocation).should('be.visible');
      cy.get(selectors.authorPostCount).should('be.visible');
    });

    it("should not show the author's location and post count on screens < 500px", () => {
      cy.viewport(499, 660);
      cy.get(selectors.authorLocation).should('not.be.visible');
      cy.get(selectors.authorPostCount).should('not.be.visible');
    });

    it(`should show 1 posts on load`, () => {
      getPostCards().should('have.length', 1);
    });

    it('should show the correct number of total posts', () => {
      loadAndCountAllPostCards(selectors.authorPostCount);
    });

    it('should not show any bullet marks on screens < 500px', () => {
      cy.viewport(499, 660);
      cy.get(selectors.bullet).should('not.be.visible');
    });
  });

  // Hashnode provides a default image for authors who don't upload a profile picture,
  // so basic tests for profile images are fine
  context('Author with profile image', () => {
    beforeEach(() => {
      cy.visit('/author/abbeyrenn/');
    });

    it("should show the author's profile image", () => {
      cy.get(selectors.authorProfileImage).then($el =>
        expect($el[0].tagName.toLowerCase()).to.equal('img')
      );
    });

    it("the author profile image should contain an `alt` attribute with the author's name", () => {
      cy.get<HTMLImageElement>(selectors.authorProfileImage).then($el =>
        expect($el[0].alt).to.equal('Abigail Rennemeyer')
      );
    });
  });

  context('Social media', () => {
    // TODO: Add tests for other social media links that Hashnode supports
    // (GitHub, LinkedIn, Instagram, YouTube, etc.)
    context('Facebook', () => {
      context('An author with no Facebook profile link', () => {
        before(() => {
          cy.visit('/author/abbeyrenn/');
        });

        it('should not show an X link and icon', () => {
          cy.get(selectors.socialMedia.facebook.link).should('not.exist');
          cy.get(selectors.socialMedia.facebook.icon).should('not.exist');
        });
      });

      context('An author with a Facebook profile link', () => {
        // TODO: Usernames / author slugs from Hashnode are not all lowercase by default.
        // This is not a problem on the live site, but the 11ty dev server will 404
        // unless the casing matches the author's actual Hashnode username. Consider
        // lowercasing all author slugs when pulling in data from Hashnode.
        before(() => {
          cy.visit('/author/freeCodeCamp/');
        });

        it('should show a Facebook link and icon', () => {
          cy.get(selectors.socialMedia.facebook.link)
            .should('have.attr', 'href', 'https://facebook.com/freecodecamp')
            .find('svg')
            .should('have.attr', 'data-test-label', 'facebook-icon');
        });
      });
    });

    context('X / Twitter', () => {
      context('Author with no X / Twitter profile link', () => {
        before(() => {
          cy.visit('/author/beaucarnes/');
        });

        it('should not show an X link and icon', () => {
          cy.get(selectors.socialMedia.x.link).should('not.exist');
          cy.get(selectors.socialMedia.x.icon).should('not.exist');
        });
      });

      context('Author with a Twitter profile link', () => {
        before(() => {
          cy.visit('/author/quincy/');
        });

        it('should show an X link and icon', () => {
          cy.get(selectors.socialMedia.x.link)
            .should('have.attr', 'href', 'https://x.com/ossia')
            .find('svg')
            .should('have.attr', 'data-test-label', 'x-icon');
        });
      });

      context('Author with an X profile link', () => {
        before(() => {
          cy.visit('/author/abbeyrenn/');
        });

        it('should show an X link and icon', () => {
          cy.get(selectors.socialMedia.x.link)
            .should('have.attr', 'href', 'https://x.com/abbeyrenn')
            .find('svg')
            .should('have.attr', 'data-test-label', 'x-icon');
        });
      });

      context('Website', () => {
        context('Author with no website link', () => {
          before(() => {
            cy.visit('/author/beaucarnes/');
          });

          it('should not show a website link and icon', () => {
            cy.get(selectors.socialMedia.website.link).should('not.exist');
            cy.get(selectors.socialMedia.website.icon).should('not.exist');
          });
        });

        context('Author with a website link', () => {
          before(() => {
            cy.visit('/author/quincy/');
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
          cy.visit('/author/quincy/');
        });

        it('should show an RSS link and icon', () => {
          cy.get(selectors.socialMedia.rss.link)
            .should(
              'have.attr',
              'href',
              'https://feedly.com/i/subscription/feed/http://localhost:8080/news/author/quincy/rss/'
            )
            .find('svg')
            .should('have.attr', 'data-test-label', 'rss-icon');
        });
      });
    });
  });
});
