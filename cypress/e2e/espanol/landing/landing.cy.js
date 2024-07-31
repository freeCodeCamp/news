const selectors = {
  postCard: "[data-test-label='post-card']",
  translatedArticleTitle:
    'El Desafío #100DaysOfCode, su historia y por qué debes hacerlo para el 2021',
  authorList: "[data-test-label='author-list']",
  authorListItem: "[data-test-label='author-list-item']",
  translatorListItem: "[data-test-label='translator-list-item']",
  profileImage: "[data-test-label='profile-image']",
  profileLink: "[data-test-label='profile-link']",
  postPublishedTime: "[data-test-label='post-published-time']",
  authorName: 'Quincy Larson',
  translatorName: 'Rafael D. Hernandez'
};

describe('Landing', () => {
  before(() => {
    // Update baseUrl to include current language
    Cypress.config('baseUrl', 'http://localhost:8080/espanol/news/');
  });

  beforeEach(() => {
    cy.visit('/');
  });

  context('General tests', () => {
    it('should render basic components', () => {
      cy.get('nav').should('be.visible');
      cy.get('.banner').should('be.visible');
      cy.get('footer').should('be.visible');
    });
  });
});
