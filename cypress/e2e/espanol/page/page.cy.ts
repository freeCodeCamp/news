const selectors = {
  fccSource: "[data-test-label='x-fcc-source']",
  featureImage: "[data-test-label='feature-image']",
  articlePublishedTime: 'head meta[property="article:published_time"]'
};

describe('Page (Ghost sourced)', () => {
  before(() => {
    // Update baseUrl to include current language
    Cypress.config('baseUrl', 'http://localhost:8080/espanol/news/');
  });

  context('Ghost sourced', () => {
    beforeEach(() => {
      cy.visit('/gracias-por-ser-un-partidario/');
    });

    it('should render', () => {
      cy.contains('freeCodeCamp es una ONG educativa muy eficiente.');
    });

    it('should contain the fCC source meta tag with Ghost as a source', () => {
      cy.get(selectors.fccSource).should('have.attr', 'content', 'Ghost');
    });

    it('should contain the article:published_time meta tag', () => {
      cy.get(selectors.articlePublishedTime).should('exist');
    });
  });

  context('Hashnode sourced', () => {
    beforeEach(() => {
      cy.visit('/test-hashnode-page/');
    });

    it('should render', () => {
      cy.contains('Testing testing 123');
    });

    it('should contain the fCC source meta tag with Ghost as a source', () => {
      cy.get(selectors.fccSource).should('have.attr', 'content', 'Hashnode');
    });

    it('should not contain the article:published_time meta tag', () => {
      cy.get(selectors.articlePublishedTime).should('not.exist');
    });
  });
});
