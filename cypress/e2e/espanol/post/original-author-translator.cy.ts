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
  authorName: 'Quincy Larson',
  translatorName: 'Rafael D. Hernandez'
};

describe('Original author / translator feature', () => {
  before(() => {
    // Update baseUrl to include current language
    Cypress.config('baseUrl', 'http://localhost:8080/espanol/news/');
  });

  context(
    'Ghost sourced translation (Español) <> Hashnode sourced original post (English)',
    () => {
      beforeEach(() => {
        cy.visit(
          '/el-desafio-100daysofcode-su-historia-y-por-que-debes-probarlo-para-2022/'
        );
      });

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
                'https://www.freecodecamp.org/news/author/quincy/' // TODO: Figure out a way to uncouple this from live data on Hashnode
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
                '/espanol/news/author/rafael/'
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
              // TODO: Figure out a way to uncouple this from live data on Hashnode.
              // Also, Quincy has a tagline on his Hashnode profile, not a bio.
              // cy.wrap($el).find(selectors.authorBio);
            });
        });

        it("the author card should contain the author's name and the locale of the original article", () => {
          cy.get(selectors.authorHeaderWithBio)
            .find(selectors.authorCard)
            .contains('Quincy Larson');
        });

        it("the author card's profile link should be a full URL that points to the original author's page", () => {
          cy.get(selectors.authorHeaderWithBio)
            .find(selectors.authorCard)
            .find(selectors.profileLink)
            .then($el => {
              expect($el.attr('href')).to.deep.equal(
                'https://www.freecodecamp.org/news/author/quincy/' // TODO: Figure out a way to uncouple this from live data on Hashnode
              );
            });
        });

        it("the author card's bio should contain the expected text", () => {
          cy.get(selectors.authorHeaderWithBio).find(selectors.authorCard);
          // TODO: Figure out a way to uncouple this from live data on Hashnode.
          // Also, Quincy has a tagline on his Hashnode profile, not a bio.
          // .find(selectors.authorBio)
          // .contains('The teacher who founded freeCodeCamp.org.');
        });

        it('the translator card should contain a profile image, a profile link, and a bio', () => {
          cy.get(selectors.authorHeaderWithBio)
            .find(selectors.translatorCard)
            .then($el => {
              cy.wrap($el).find(selectors.profileImage);
              cy.wrap($el).find(selectors.profileLink);
              cy.wrap($el).find(selectors.translatorBio);
            });
        });

        it("the translator card should contain the translator's name", () => {
          cy.get(selectors.authorHeaderWithBio)
            .find(selectors.translatorCard)
            .contains('Rafael D. Hernandez');
        });

        it("the translator card's profile link should be a relative URL that points to the translator's page on the current instance of News", () => {
          cy.get(selectors.authorHeaderWithBio)
            .find(selectors.translatorCard)
            .find(selectors.profileLink)
            .then($el => {
              expect($el.attr('href')).to.deep.equal(
                '/espanol/news/author/rafael/'
              );
            });
        });

        it("the translator card's bio should contain the expected text", () => {
          cy.get(selectors.authorHeaderWithBio)
            .find(selectors.translatorCard)
            .find(selectors.translatorBio)
            .contains(
              'Web Developer | Global Language Translations Lead at @freeCodeCamp'
            );
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
                'The #100DaysOfCode Challenge, its history, and why you should try it'
              );
              expect($el.attr('href')).to.deep.equal(
                'https://www.freecodecamp.org/news/the-crazy-history-of-the-100daysofcode-challenge-and-why-you-should-try-it-for-2018-6c89a76e298d/'
              );
            });
        });
      });
    }
  );

  context(
    'Hashnode sourced translation (Español) <> Hashnode sourced original post (English)',
    () => {
      beforeEach(() => {
        cy.visit(
          '/como-aprender-a-programar-y-conseguir-un-trabajo-de-desarrollador-en-2023-libro-completo/'
        );
      });

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
                'https://www.freecodecamp.org/news/author/quincy/' // TODO: Figure out a way to uncouple this from live data on Hashnode
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
                '/espanol/news/author/rafaeldavish/'
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
              // TODO: Figure out a way to uncouple this from live data on Hashnode.
              // Also, Quincy has a tagline on his Hashnode profile, not a bio.
              // cy.wrap($el).find(selectors.authorBio);
            });
        });

        it("the author card should contain the author's name and the locale of the original article", () => {
          cy.get(selectors.authorHeaderWithBio)
            .find(selectors.authorCard)
            .contains('Quincy Larson');
        });

        it("the author card's profile link should be a full URL that points to the original author's page", () => {
          cy.get(selectors.authorHeaderWithBio)
            .find(selectors.authorCard)
            .find(selectors.profileLink)
            .then($el => {
              expect($el.attr('href')).to.deep.equal(
                'https://www.freecodecamp.org/news/author/quincy/' // TODO: Figure out a way to uncouple this from live data on Hashnode
              );
            });
        });

        it("the author card's bio should contain the expected text", () => {
          cy.get(selectors.authorHeaderWithBio).find(selectors.authorCard);
          // TODO: Figure out a way to uncouple this from live data on Hashnode.
          // Also, Quincy has a tagline on his Hashnode profile, not a bio.
          // .find(selectors.authorBio)
          // .contains('The teacher who founded freeCodeCamp.org.');
        });

        it('the translator card should contain a profile image, a profile link, and a bio', () => {
          cy.get(selectors.authorHeaderWithBio)
            .find(selectors.translatorCard)
            .then($el => {
              cy.wrap($el).find(selectors.profileImage);
              cy.wrap($el).find(selectors.profileLink);
              cy.wrap($el).find(selectors.translatorBio);
            });
        });

        it("the translator card should contain the translator's name", () => {
          cy.get(selectors.authorHeaderWithBio)
            .find(selectors.translatorCard)
            .contains('Rafael D. Hernandez');
        });

        it("the translator card's profile link should be a relative URL that points to the translator's page on the current instance of News", () => {
          cy.get(selectors.authorHeaderWithBio)
            .find(selectors.translatorCard)
            .find(selectors.profileLink)
            .then($el => {
              expect($el.attr('href')).to.deep.equal(
                '/espanol/news/author/rafaeldavish/'
              );
            });
        });

        it("the translator card's bio should contain the expected text", () => {
          cy.get(selectors.authorHeaderWithBio)
            .find(selectors.translatorCard)
            .find(selectors.translatorBio)
            .contains(
              "I'm a web developer passionate about all things JS and ☕ coffee enthusiast based out of the state of Virginia A career changer, who is always seeking to grow as an individual and a professional."
            );
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
                'How to Learn to Code and Get a Developer Job [Full Book]'
              );
              expect($el.attr('href')).to.deep.equal(
                'https://www.freecodecamp.org/news/learn-to-code-book/'
              );
            });
        });
      });
    }
  );
});
