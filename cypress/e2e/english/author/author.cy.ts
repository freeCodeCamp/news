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
    website: {
      link: "[data-test-label='website-link']",
      icon: "[data-test-label='website-icon']"
    },
    x: {
      link: "[data-test-label='x-link']",
      icon: "[data-test-label='x-icon']"
    },
    facebook: {
      link: "[data-test-label='facebook-link']",
      icon: "[data-test-label='facebook-icon']"
    },
    github: {
      link: "[data-test-label='github-link']",
      icon: "[data-test-label='github-icon']"
    },
    stackoverflow: {
      link: "[data-test-label='stackoverflow-link']",
      icon: "[data-test-label='stackoverflow-icon']"
    },
    linkedin: {
      link: "[data-test-label='linkedin-link']",
      icon: "[data-test-label='linkedin-icon']"
    },
    instagram: {
      link: "[data-test-label='instagram-link']",
      icon: "[data-test-label='instagram-icon']"
    },
    youtube: {
      link: "[data-test-label='youtube-link']",
      icon: "[data-test-label='youtube-icon']"
    },
    rss: {
      link: "[data-test-label='rss-link']",
      icon: "[data-test-label='rss-icon']"
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

  // TODO: Usernames / author slugs from Hashnode are not all lowercase by default.
  // For tests that go to the freeCodeCamp author page, we need to use the correct case
  // for the username, otherwise we'll get a 404. Consider lowercasing all author slugs
  // when pulling in data from Hashnode.
  context('Social media', () => {
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
          cy.visit('/author/freeCodeCamp/');
        });

        it('should show a website link and icon with the expected attributes', () => {
          cy.get(selectors.socialMedia.website.link)
            .should('have.attr', 'href', 'https://www.freecodecamp.org/')
            .find('svg')
            .should('have.attr', 'data-test-label', 'website-icon');
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

        it('should show an X link and icon with the expected attributes', () => {
          cy.get(selectors.socialMedia.x.link)
            .should('have.attr', 'href', 'https://x.com/ossia')
            .find('svg')
            .should('have.attr', 'data-test-label', 'x-icon');
        });
      });

      context('Author with an X profile link', () => {
        before(() => {
          cy.visit('/author/freeCodeCamp/');
        });

        it('should show an X link and icon with the expected attributes', () => {
          cy.get(selectors.socialMedia.x.link)
            .should('have.attr', 'href', 'https://x.com/freecodecamp')
            .find('svg')
            .should('have.attr', 'data-test-label', 'x-icon');
        });
      });
    });

    context('Facebook', () => {
      context('An author with no Facebook profile link', () => {
        before(() => {
          cy.visit('/author/beaucarnes/');
        });

        it('should not show a Facebook link and icon', () => {
          cy.get(selectors.socialMedia.facebook.link).should('not.exist');
          cy.get(selectors.socialMedia.facebook.icon).should('not.exist');
        });
      });

      context('An author with a Facebook profile link', () => {
        before(() => {
          cy.visit('/author/freeCodeCamp/');
        });

        it('should show a Facebook link and icon with the expected attributes', () => {
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

    context('GitHub', () => {
      context('An author with no GitHub profile link', () => {
        before(() => {
          cy.visit('/author/beaucarnes/');
        });

        it('should not show a GitHub link and icon', () => {
          cy.get(selectors.socialMedia.github.link).should('not.exist');
          cy.get(selectors.socialMedia.github.icon).should('not.exist');
        });
      });

      context('An author with a GitHub profile link', () => {
        before(() => {
          cy.visit('/author/freeCodeCamp/');
        });

        it('should show a GitHub link and icon with the expected attributes', () => {
          cy.get(selectors.socialMedia.github.link)
            .should('have.attr', 'href', 'https://github.com/freecodecamp')
            .find('svg')
            .should('have.attr', 'data-test-label', 'github-icon');
        });
      });
    });

    context('Stack Overflow', () => {
      context('An author with no Stack Overflow profile link', () => {
        before(() => {
          cy.visit('/author/beaucarnes/');
        });

        it('should not show a Stack Overflow link and icon', () => {
          cy.get(selectors.socialMedia.stackoverflow.link).should('not.exist');
          cy.get(selectors.socialMedia.stackoverflow.icon).should('not.exist');
        });
      });

      context('An author with a Stack Overflow profile link', () => {
        before(() => {
          cy.visit('/author/freeCodeCamp/');
        });

        it('should show a Stack Overflow link and icon with the expected attributes', () => {
          cy.get(selectors.socialMedia.stackoverflow.link)
            .should(
              'have.attr',
              'href',
              'https://stackoverflow.com/users/1373672/quincy-larson' // Note: Using Quincy's SO profile for testing purposes
            )
            .find('svg')
            .should('have.attr', 'data-test-label', 'stackoverflow-icon');
        });
      });
    });

    context('LinkedIn', () => {
      context('An author with no LinkedIn profile link', () => {
        before(() => {
          cy.visit('/author/beaucarnes/');
        });

        it('should not show a LinkedIn link and icon', () => {
          cy.get(selectors.socialMedia.linkedin.link).should('not.exist');
          cy.get(selectors.socialMedia.linkedin.icon).should('not.exist');
        });
      });

      context('An author with a LinkedIn profile link', () => {
        before(() => {
          cy.visit('/author/freeCodeCamp/');
        });

        it('should show a LinkedIn link and icon with the expected attributes', () => {
          cy.get(selectors.socialMedia.linkedin.link)
            .should(
              'have.attr',
              'href',
              'https://www.linkedin.com/school/free-code-camp/'
            )
            .find('svg')
            .should('have.attr', 'data-test-label', 'linkedin-icon');
        });
      });
    });

    // Note: All authors should have an RSS link and icon
    context('RSS', () => {
      before(() => {
        cy.visit('/author/beaucarnes/');
      });

      it('should show an RSS link and icon with the expected attributes', () => {
        cy.get(selectors.socialMedia.rss.link)
          .should(
            'have.attr',
            'href',
            'https://feedly.com/i/subscription/feed/http://localhost:8080/news/author/beaucarnes/rss/'
          )
          .find('svg')
          .should('have.attr', 'data-test-label', 'rss-icon');
      });
    });
  });
});
