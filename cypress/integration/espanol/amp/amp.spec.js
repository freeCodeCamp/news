const selectors = {
  AMPAuthorHeader: "[data-test-label='amp-author-header']",
  AMPAuthor: "[data-test-label='amp-author']",
  AMPTranslator: "[data-test-label='amp-translator']"
};

describe('AMP page', () => {
  before(() => {
    // Update baseUrl to include current language
    Cypress.config('baseUrl', 'http://localhost:8080/espanol/news');
    cy.visit(
      '/el-desafio-100daysofcode-su-historia-y-por-que-debes-probarlo-para-2022/amp'
    );
  });

  context('Original author / translator feature', () => {
    it('the author header should contain two children', () => {
      cy.get(selectors.AMPAuthorHeader).children().should('have.length', 2);
    });

    it("the AMP Author element should contain the author's name and the locale of the original article", () => {
      cy.get(selectors.AMPAuthor).contains('Quincy Larson (inglés)');
    });

    it("the AMP Translator element should contain the translator's name", () => {
      cy.get(selectors.AMPTranslator).contains('Rafael D. Hernandez');
    });
  });
});
