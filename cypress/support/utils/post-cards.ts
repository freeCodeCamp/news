const calculateClicks = total => {
  const postsPerPage = Cypress.env('postsPerPage');

  // If returning the num of clicks, subtract 1 because the first page is
  // fully populated
  return total <= postsPerPage ? 0 : Math.ceil(total / postsPerPage) - 1;
};

export const getPostCards = () => cy.get('.post-feed').find('.post-card');

export const loadAndCountAllPostCards = (selector: string) => {
  cy.get(selector)
    .invoke('text')
    .then(text => {
      const loadMoreSelector = "[data-test-label='load-more-articles-button']";
      const totalPosts = Number(text.trim().match(/\d+/)[0]);
      const numOfClicks = calculateClicks(totalPosts);

      cy.intercept('GET', /\/news\/(author|tag)\/.+\/\d+/).as('fetchNextPage');

      Cypress._.times(numOfClicks, () => {
        cy.get(loadMoreSelector).click();

        cy.wait('@fetchNextPage');
      });

      getPostCards().should('have.length', totalPosts);
    });
};

export const loadAllPosts = () => {
  cy.get('body').then($el => {
    const loadMoreArticlesButtonIsVisible = $el
      .find("[data-test-label='load-more-articles-button']")
      .is(':visible');

    if (loadMoreArticlesButtonIsVisible) {
      cy.get("[data-test-label='load-more-articles-button']").click({
        force: true
      });

      loadAllPosts();
    }
  });
};

module.exports = {
  getPostCards,
  loadAndCountAllPostCards,
  loadAllPosts
};
