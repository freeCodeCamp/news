const selectors = {
  postCard: "[data-test-label='post-card']",
  translatedArticleTitle:
    'El Desafío #100DaysOfCode, su historia y por qué debes hacerlo para el 2021',
  authorList: "[data-test-label='author-list']",
  authorListItem: "[data-test-label='author-list-item']",
  translatorListItem: "[data-test-label='translator-list-item']",
  profileImage: "[data-test-label='profile-image']",
  profileLink: "[data-test-label='profile-link']",
  avatar: "[data-test-label='avatar']", // To do: Add tests for a translated article where the original author doesn't have a profile image
  postPublishedTime: "[data-test-label='post-published-time']",
  authorName: 'Quincy Larson',
  translatorName: 'Rafael D. Hernandez'
};

describe('Search results', () => {
  before(() => {
    // Update baseUrl to include current language
    Cypress.config('baseUrl', 'http://localhost:8080/espanol/news');
    // Note: 11ty's local server will automatically add a trailing
    // slash immediately after `/search`, before the `query` URL
    // parameter. This does not happen on production since we
    // don't redirect from the non-trailing slash version of the
    // page to the trailing slash version
    cy.visit('/search?query=mock%20search%20results');
  });

  context('Original author / translator feature', () => {
    it('the post card should contain an author list with inner author and translator list items', () => {
      cy.get(selectors.postCard)
        .contains(selectors.translatedArticleTitle)
        .parentsUntil('article')
        .find(selectors.authorList)
        .then($el => {
          cy.wrap($el).find(selectors.authorListItem);
          cy.wrap($el).find(selectors.translatorListItem);
        });
    });

    it('the author list item should have profile image, profile link, and post published time elements', () => {
      cy.get(selectors.postCard)
        .contains(selectors.translatedArticleTitle)
        .parentsUntil('article')
        .find(selectors.authorListItem)
        .then($el => {
          cy.wrap($el).find(selectors.profileImage);
          cy.wrap($el).find(selectors.profileLink);
          cy.wrap($el).find(selectors.postPublishedTime);
        });
    });

    it("the author's profile image should be wrapped in an anchor with the full URL to the author's page", () => {
      cy.get(selectors.postCard)
        .contains(selectors.translatedArticleTitle)
        .parentsUntil('article')
        .find(selectors.authorListItem)
        .find(selectors.profileImage)
        .parent()
        .then($el => {
          expect($el.attr('href')).to.equal(
            'https://www.freecodecamp.org/news/author/quincylarson/'
          );
        });
    });

    it("the author's profile link text should match the expected text", () => {
      cy.get(selectors.postCard)
        .contains(selectors.translatedArticleTitle)
        .parentsUntil('article')
        .find(selectors.authorListItem)
        .find(selectors.profileLink)
        .then($el => {
          expect($el.text().trim()).to.equal(`Autor: ${selectors.authorName}`);
        });
    });

    it("the author's profile link should be a full URL that points to the author's page", () => {
      cy.get(selectors.postCard)
        .contains(selectors.translatedArticleTitle)
        .parentsUntil('article')
        .find(selectors.authorListItem)
        .find(selectors.profileLink)
        .then($el => {
          expect($el.attr('href')).to.equal(
            'https://www.freecodecamp.org/news/author/quincylarson/'
          );
        });
    });

    it("the author's'post published time should convert to the expected UTC string", () => {
      cy.get(selectors.postCard)
        .contains(selectors.translatedArticleTitle)
        .parentsUntil('article')
        .find(selectors.authorListItem)
        .find(selectors.postPublishedTime)
        .then($el => {
          const publishedTimeUTC = new Date($el.attr('datetime')).toUTCString();

          expect(publishedTimeUTC).to.equal('Wed, 09 Dec 2020 16:20:00 GMT');
        });
    });

    it('the translator should have profile image, profile link, and post published time elements', () => {
      cy.get(selectors.postCard)
        .contains(selectors.translatedArticleTitle)
        .parentsUntil('article')
        .find(selectors.translatorListItem)
        .then($el => {
          cy.wrap($el).find(selectors.profileImage);
          cy.wrap($el).find(selectors.profileLink);
          cy.wrap($el).find(selectors.postPublishedTime);
        });
    });

    it("the translator's profile image should be wrapped in an anchor with the full URL to the translator's page", () => {
      cy.get(selectors.postCard)
        .contains(selectors.translatedArticleTitle)
        .parentsUntil('article')
        .find(selectors.translatorListItem)
        .find(selectors.profileImage)
        .parent()
        .then($el => {
          expect($el.attr('href')).to.equal(
            'https://www.freecodecamp.org/espanol/news/author/rafael/'
          );
        });
    });

    it("the translator's profile link text should match the expected text", () => {
      cy.get(selectors.postCard)
        .contains(selectors.translatedArticleTitle)
        .parentsUntil('article')
        .find(selectors.translatorListItem)
        .find(selectors.profileLink)
        .then($el => {
          expect($el.text().trim()).to.equal(
            `Traducido y adaptado por: ${selectors.translatorName}`
          );
        });
    });

    it("the translator's profile link should be a full URL of the translator's page", () => {
      cy.get(selectors.postCard)
        .contains(selectors.translatedArticleTitle)
        .parentsUntil('article')
        .find(selectors.translatorListItem)
        .find(selectors.profileLink)
        .then($el => {
          expect($el.attr('href')).to.equal(
            'https://www.freecodecamp.org/espanol/news/author/rafael/'
          );
        });
    });

    it("the translator's post published time should convert to the expected UTC string", () => {
      cy.get(selectors.postCard)
        .contains(selectors.translatedArticleTitle)
        .parentsUntil('article')
        .find(selectors.translatorListItem)
        .find(selectors.postPublishedTime)
        .then($el => {
          const publishedTimeUTC = new Date($el.attr('datetime')).toUTCString();

          expect(publishedTimeUTC).to.equal('Sun, 16 Jan 2022 22:46:14 GMT');
        });
    });
  });
});
