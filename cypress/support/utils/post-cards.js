const calculateClicks = (total) => {
  const postsPerPage = 25;

  // If returning the num of clicks, subtract 1 because the first page is
  // fully populated
  return total <= postsPerPage ? 0 : Math.ceil(total / postsPerPage) - 1;
};

const getPostCards = () => cy.get(".post-feed").find(".post-card");

const loadAndSumAllPostCards = (selector) => {
  cy.get(selector)
    .invoke("text")
    .then((text) => {
      const loadMoreSelector = "[data-test-label='load-more-articles-button']";
      const totalPosts = Number(text.trim().match(/\d+/)[0]);
      const numOfClicks = calculateClicks(totalPosts);

      cy.intercept("GET", /\/news\/(author|tag)\/.+\/\d+/).as("fetchNextPage");

      Cypress._.times(numOfClicks, () => {
        cy.get(loadMoreSelector).click();

        cy.wait("@fetchNextPage");
      });

      getPostCards().should("have.length", totalPosts);
    });
};

module.exports = {
  getPostCards,
  loadAndSumAllPostCards,
};
