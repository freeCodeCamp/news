const selectors = {
  authorName: "[data-test-label='author-name']",
  authorLocation: "[data-test-label='author-location']",
  authorPostCount: "[data-test-label='author-post-count']",
  bullet: "[data-test-label='bullet']",
};

describe("Author page", () => {
  before(() => {
    cy.visit("/author/quincylarson");
  });

  it("should render", () => {
    cy.contains(selectors.authorName, "Quincy Larson");
  });

  it("should show the author's location and post count on larger screens", () => {
    cy.get(selectors.authorLocation).should("be.visible");
    cy.get(selectors.authorPostCount).should("be.visible");
  });

  it("should not show the author's location and post count screens < 500px", () => {
    cy.viewport(499, 660);
    cy.get(selectors.authorLocation).should("not.be.visible");
    cy.get(selectors.authorPostCount).should("not.be.visible");
  });

  it("should not show any bullet marks on screens < 500px", () => {
    cy.viewport(499, 660);
    cy.get(selectors.bullet).should("not.be.visible");
  });
});
