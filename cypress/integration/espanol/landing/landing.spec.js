const selectors = {
  postCard: "[data-test-label='post-card']",
  translatedArticleTitle:
    'El Desafío #100DaysOfCode, su historia y por qué debes hacerlo para el 2021',
  authorList: "[data-test-label='author-list']",
  authorListItem: "[data-test-label='author-list-item']",
  translatorListItem: "[data-test-label='translator-list-item']",
  profileImage: "[data-test-label='profile-image']",
  profileLink: "[data-test-label='profile-link']",
  postPublishedTime: "[data-test-label='post-published-time']"
};

describe('Landing', () => {
  before(() => {
    // Update baseUrl to include current language
    Cypress.config('baseUrl', 'http://localhost:8080/espanol/news');
    cy.visit('/');
  });

  context('General tests', () => {
    it('should render basic components', () => {
      cy.get('nav').should('be.visible');
      cy.get('.banner').should('be.visible');
      cy.get('footer').should('be.visible');
    });
  });

  context('Original author / translator feature', () => {
    it('the author list should contain two children', () => {
      cy.get(selectors.postCard)
        .contains(selectors.translatedArticleTitle)
        .parentsUntil('article')
        .find(selectors.authorList)
        .children()
        .should('have.length', 2);
    });

    it('the author should have profile image, profile link, and post published time elements', () => {
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
  });
});
