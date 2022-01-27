const selectors = {
  authorName: "[data-test-label='author-name']",
};

describe("Author page", () => {
  before(() => {
    cy.visit("/author/quincylarson");
  });

  it("should render", () => {
    cy.contains(selectors.authorName, "Quincy Larson");
  });
});
