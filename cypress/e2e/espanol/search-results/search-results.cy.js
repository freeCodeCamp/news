const selectors = {
  postCard: "[data-test-label='post-card']",
  translatedArticleTitle:
    'El Desafío #100DaysOfCode, su historia y por qué debes hacerlo para el 2021',
  authorList: "[data-test-label='author-list']",
  authorProfileImage: "[data-test-label='profile-image']",
  avatar: "[data-test-label='avatar']",
  authorListItem: "[data-test-label='author-list-item']",
  translatorListItem: "[data-test-label='translator-list-item']",
  profileImage: "[data-test-label='profile-image']",
  profileLink: "[data-test-label='profile-link']",
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

  context('General tests', () => {
    it('should render basic components', () => {
      cy.get('nav').should('be.visible');
      cy.get('.banner').should('be.visible');
      cy.get('footer').should('be.visible');
    });
  });

  context('Original author / translator feature', () => {
    it('the author list should contain an author list item and a translator list item', () => {
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

    it("the author list item's profile image should be wrapped in an anchor that points to the author's page", () => {
      cy.get(selectors.postCard)
        .contains(selectors.translatedArticleTitle)
        .parentsUntil('article')
        .find(selectors.authorListItem)
        .find(selectors.profileImage)
        .parent()
        .then($el => {
          expect($el.attr('href')).to.deep.equal(
            'https://www.freecodecamp.org/news/author/quincylarson/'
          );
        });
    });

    it("the author list item's profile link should contain the author's name", () => {
      cy.get(selectors.postCard)
        .contains(selectors.translatedArticleTitle)
        .parentsUntil('article')
        .find(selectors.authorListItem)
        .find(selectors.profileLink)
        .then($el => {
          expect($el.text().trim()).to.deep.equal(
            `Autor: ${selectors.authorName}`
          );
        });
    });

    it("the author list item's profile link should be a full URL that points to the original author's page", () => {
      cy.get(selectors.postCard)
        .contains(selectors.translatedArticleTitle)
        .parentsUntil('article')
        .find(selectors.authorListItem)
        .find(selectors.profileLink)
        .then($el => {
          expect($el.attr('href')).to.deep.equal(
            'https://www.freecodecamp.org/news/author/quincylarson/'
          );
        });
    });

    it("the author list item's post published time should convert to the expected UTC string", () => {
      cy.get(selectors.postCard)
        .contains(selectors.translatedArticleTitle)
        .parentsUntil('article')
        .find(selectors.authorListItem)
        .find(selectors.postPublishedTime)
        .then($el => {
          const publishedTimeUTC = new Date($el.attr('datetime')).toUTCString();

          expect(publishedTimeUTC).to.deep.equal(
            'Wed, 09 Dec 2020 16:20:00 GMT'
          );
        });
    });

    it('the translator list item should have profile image, profile link, and post published time elements', () => {
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

    it("the translator list item's profile image should be wrapped in an anchor that points to the full URL of the translator's page", () => {
      cy.get(selectors.postCard)
        .contains(selectors.translatedArticleTitle)
        .parentsUntil('article')
        .find(selectors.translatorListItem)
        .find(selectors.profileImage)
        .parent()
        .then($el => {
          expect($el.attr('href')).to.deep.equal(
            'http://localhost:8080/espanol/news/author/rafael/'
          );
        });
    });

    it("the translator list item's profile link should contain the author's name", () => {
      cy.get(selectors.postCard)
        .contains(selectors.translatedArticleTitle)
        .parentsUntil('article')
        .find(selectors.translatorListItem)
        .find(selectors.profileLink)
        .then($el => {
          expect($el.text().trim()).to.deep.equal(
            `Traducido y adaptado por: ${selectors.translatorName}`
          );
        });
    });

    it("the translator list item's profile link should be a full URL of the translator's page", () => {
      cy.get(selectors.postCard)
        .contains(selectors.translatedArticleTitle)
        .parentsUntil('article')
        .find(selectors.translatorListItem)
        .find(selectors.profileLink)
        .then($el => {
          expect($el.attr('href')).to.deep.equal(
            'http://localhost:8080/espanol/news/author/rafael/'
          );
        });
    });

    it("the translator list item's post published time should convert to the expected UTC string", () => {
      cy.get(selectors.postCard)
        .contains(selectors.translatedArticleTitle)
        .parentsUntil('article')
        .find(selectors.translatorListItem)
        .find(selectors.postPublishedTime)
        .then($el => {
          const publishedTimeUTC = new Date($el.attr('datetime')).toUTCString();

          expect(publishedTimeUTC).to.deep.equal(
            'Sun, 16 Jan 2022 22:46:14 GMT'
          );
        });
    });
  });
});
