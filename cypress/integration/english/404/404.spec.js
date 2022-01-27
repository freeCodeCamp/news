describe("404", () => {
  before(() => {
    cy.visit("/testing-testing-1-2", { failOnStatusCode: false });
  });

  it("should render basic components", () => {
    cy.get("nav").should("be.visible");
    cy.get(".banner").should("be.visible");
    cy.get("footer").should("be.visible");
  });
});
