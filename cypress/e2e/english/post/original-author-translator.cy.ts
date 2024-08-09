const selectors = {
  authorHeaderNoBio: "[data-test-label='author-header-no-bio']",
  authorHeaderWithBio: "[data-test-label='author-header-with-bio']",
  authorCard: "[data-test-label='author-card']",
  translatorCard: "[data-test-label='translator-card']",
  profileImage: "[data-test-label='profile-image']",
  profileLink: "[data-test-label='profile-link']",
  authorBio: "[data-test-label='author-bio']",
  translatorBio: "[data-test-label='translator-bio']",
  translationIntro: "[data-test-label='translation-intro']",
  originalArticleLink: "[data-test-label='original-article-link']",
  authorName: 'Rafael D. Hernandez',
  translatorName: 'Kristofer Koishigawa'
};

describe('Original author / translator feature', () => {
  beforeEach(() => {
    cy.visit(
      '/denny-perez-from-accountant-to-coder-creating-communities-and-inspiring-women-s2-ep-13/'
    );
  });

  context(
    'Hashnode sourced translation (English) <> Ghost sourced original post (Español)',
    () => {
      context('Author header without bios', () => {
        it('should contain an author card and a translator card', () => {
          cy.get(selectors.authorHeaderNoBio).then($el => {
            cy.wrap($el).find(selectors.authorCard);
            cy.wrap($el).find(selectors.translatorCard);
          });
        });

        it('the author card should contain a profile image and a profile link', () => {
          cy.get(selectors.authorHeaderNoBio)
            .find(selectors.authorCard)
            .then($el => {
              cy.wrap($el).find(selectors.profileImage);
              cy.wrap($el).find(selectors.profileLink);
            });
        });

        it("the author card's profile link should contain the author's name and the locale of the original article", () => {
          cy.get(selectors.authorHeaderNoBio)
            .find(selectors.authorCard)
            .contains(`${selectors.authorName}`);
        });

        it("the author card's profile link should be a full URL that points to the original author's page", () => {
          cy.get(selectors.authorHeaderNoBio)
            .find(selectors.authorCard)
            .find(selectors.profileLink)
            .then($el => {
              expect($el.attr('href')).to.deep.equal(
                'https://www.freecodecamp.org/espanol/news/author/rafael/'
              );
            });
        });

        it('the translator card should contain a profile image and a profile link', () => {
          cy.get(selectors.authorHeaderNoBio)
            .find(selectors.translatorCard)
            .then($el => {
              cy.wrap($el).find(selectors.profileImage);
              cy.wrap($el).find(selectors.profileLink);
            });
        });

        it("the translator card's profile link should contain the translator's name", () => {
          cy.get(selectors.authorHeaderNoBio)
            .find(selectors.translatorCard)
            .contains(selectors.translatorName);
        });

        it("the translator card's profile link should be a relative URL that points to the translator's page on the current instance of News", () => {
          cy.get(selectors.authorHeaderNoBio)
            .find(selectors.translatorCard)
            .find(selectors.profileLink)
            .then($el => {
              expect($el.attr('href')).to.deep.equal(
                '/news/author/scissorsneedfoodtoo/'
              );
            });
        });
      });

      context('Author header with bios', () => {
        it('should contain an author card and a translator card', () => {
          cy.get(selectors.authorHeaderWithBio).then($el => {
            cy.wrap($el).find(selectors.authorCard);
            cy.wrap($el).find(selectors.translatorCard);
          });
        });

        it('the author card should contain a profile image, a profile link, and a bio', () => {
          cy.get(selectors.authorHeaderWithBio)
            .find(selectors.authorCard)
            .then($el => {
              cy.wrap($el).find(selectors.profileImage);
              cy.wrap($el).find(selectors.profileLink);
              cy.wrap($el).find(selectors.authorBio);
            });
        });

        it("the author card should contain the author's name and the locale of the original article", () => {
          cy.get(selectors.authorHeaderWithBio)
            .find(selectors.authorCard)
            .contains(`${selectors.authorName} (Spanish)`);
        });

        it("the author card's profile link should be a full URL that points to the original author's page", () => {
          cy.get(selectors.authorHeaderWithBio)
            .find(selectors.authorCard)
            .find(selectors.profileLink)
            .then($el => {
              expect($el.attr('href')).to.deep.equal(
                'https://www.freecodecamp.org/espanol/news/author/rafael/'
              );
            });
        });

        it("the author card's bio should contain the expected text", () => {
          cy.get(selectors.authorHeaderWithBio)
            .find(selectors.authorCard)
            .find(selectors.authorBio)
            .contains(
              'Cristiano / Desarrollador web / Líder de traducciones al español / Host de @freeCodeCamp Podcast en español'
            );
        });

        it('the translator card should contain a profile image and profile link', () => {
          cy.get(selectors.authorHeaderWithBio)
            .find(selectors.translatorCard)
            .then($el => {
              cy.wrap($el).find(selectors.profileImage);
              cy.wrap($el).find(selectors.profileLink);
            });
        });

        it("the translator card should contain the translator's name", () => {
          cy.get(selectors.authorHeaderWithBio)
            .find(selectors.translatorCard)
            .contains(selectors.translatorName);
        });

        it("the translator card's profile link should be a relative URL that points to the translator's page on the current instance of News", () => {
          cy.get(selectors.authorHeaderWithBio)
            .find(selectors.translatorCard)
            .find(selectors.profileLink)
            .then($el => {
              expect($el.attr('href')).to.deep.equal(
                '/news/author/scissorsneedfoodtoo/'
              );
            });
        });

        // To do: write tests for cases where the author and / or translator don't have bios
      });

      context('Translated article intro', () => {
        it('the author intro should contain links to the original article', () => {
          cy.get(selectors.translationIntro).then($el => {
            cy.wrap($el).find(selectors.originalArticleLink);
          });
        });

        it('the link to the original article should contain the expected text and `href` attribute', () => {
          cy.get(selectors.translationIntro)
            .find(selectors.originalArticleLink)
            .then($el => {
              cy.wrap($el).contains(
                'Denny Pérez: De contadora a coder, creando Comunidades e inspirando mujeres | S2 Ep. 13'
              );
              expect($el.attr('href')).to.deep.equal(
                'https://www.freecodecamp.org/espanol/news/denny-perez-de-contadora-a-coder-creando-comunidades-e-inspirando-mujeres-s2-ep-13/'
              );
            });
        });
      });
    }
  );
});
