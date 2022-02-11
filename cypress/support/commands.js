// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

const calculateClicks = (total) => {
  const postsPerPage = 25;

  // If returning the num of clicks, subtract 1 because the first page is
  // fully populated
  return total <= postsPerPage ? 0 : Math.ceil(total / postsPerPage) - 1;
};

Cypress.Commands.add("getPostCards", () => {
  cy.get(".post-feed").find(".post-card");
});

Cypress.Commands.add("loadAndSumAllPostCards", (selector) => {
  cy.get(selector)
    .invoke("text")
    .then((text) => {
      const loadMoreSelector = "[data-test-label='load-more-articles-button']";
      const totalPosts = Number(text.trim().match(/\d+/)[0]);
      let numOfClicks = calculateClicks(totalPosts);

      cy.intercept("GET", /\/news\/(author|tag)\/.+\/\d+/).as("fetchNextPage");

      Cypress._.times(numOfClicks, () => {
        cy.get(loadMoreSelector).click();

        cy.wait("@fetchNextPage");
      });

      cy.getPostCards().should("have.length", totalPosts);
    });
});
