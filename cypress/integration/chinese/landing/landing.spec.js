describe("Landing", () => {
  before(() => {
    cy.visit("/");
  });

  it("should render basic components", () => {
    cy.get("nav").should("be.visible");
    cy.get(".banner").should("be.visible");
    cy.get("footer").should("be.visible");
  });
});
