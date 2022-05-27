const selectors = {
  authorHeaderNoBio: "[data-test-label='author-header-no-bio']",
  authorHeaderWithBio: "[data-test-label='author-header-with-bio']",
  authorCard: "[data-test-label='author-card']",
  translatorCard: "[data-test-label='translator-card']",
  profileImage: "[data-test-label='profile-image']",
  profileLink: "[data-test-label='profile-link']",
  authorBio: "[data-test-label='author-bio']",
  translatorBio: "[data-test-label='translator-bio']",
  authorIntro: "[data-test-label='author-intro']",
  originalArticle: "[data-test-label='original-article']",
  translatorIntro: "[data-test-label='translator-intro']"
};

describe('Post', () => {
  before(() => {
    // Update baseUrl to include current language
    Cypress.config('baseUrl', 'http://localhost:8080/espanol/news');
    cy.visit(
      '/el-desafio-100daysofcode-su-historia-y-por-que-debes-probarlo-para-2022'
    );
  });

  context('Original author / translator feature', () => {
    context('Author header without bios', () => {
      it('should contain two children', () => {
        cy.get(selectors.authorHeaderNoBio).children().should('have.length', 2);
      });

      it('the author card should contain profile image and profile link elements', () => {
        cy.get(selectors.authorHeaderNoBio)
          .find(selectors.authorCard)
          .then($el => {
            cy.wrap($el).find(selectors.profileImage);
            cy.wrap($el).find(selectors.profileLink);
          });
      });

      it('the translator card should contain profile image and profile link elements', () => {
        cy.get(selectors.authorHeaderNoBio)
          .find(selectors.translatorCard)
          .then($el => {
            cy.wrap($el).find(selectors.profileImage);
            cy.wrap($el).find(selectors.profileLink);
          });
      });
    });

    context('Author header with bios', () => {
      it('should contain two children', () => {
        cy.get(selectors.authorHeaderWithBio)
          .children()
          .should('have.length', 2);
      });

      it('the author card should contain profile image and profile link elements', () => {
        cy.get(selectors.authorHeaderWithBio)
          .find(selectors.authorCard)
          .then($el => {
            cy.wrap($el).find(selectors.profileImage);
            cy.wrap($el).find(selectors.profileLink);
            cy.wrap($el).find(selectors.authorBio);
          });
      });

      it('the translator card should contain profile image and profile link elements', () => {
        cy.get(selectors.authorHeaderWithBio)
          .find(selectors.translatorCard)
          .then($el => {
            cy.wrap($el).find(selectors.profileImage);
            cy.wrap($el).find(selectors.profileLink);
            cy.wrap($el).find(selectors.translatorBio);
          });
      });

      // To do: write tests for cases where the author and / or translator don't have bios
    });

    context('Translated article intro', () => {
      it("the author intro should contain links to the original article and author's profile", () => {
        cy.get(selectors.authorIntro).then($el => {
          cy.wrap($el).find(selectors.originalArticle);
          cy.wrap($el).find(selectors.profileLink);
        });
      });

      it("the translator intro should contain a link to the translator's profile", () => {
        cy.get(selectors.translatorIntro).then($el => {
          cy.wrap($el).find(selectors.profileLink);
        });
      });
    });
  });
});
