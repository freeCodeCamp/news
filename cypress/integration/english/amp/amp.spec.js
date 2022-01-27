describe("Amp page", () => {
  before(() => {
    cy.visit("/announcing-rust-course-replit-web/amp");
  });

  it("should render", () => {
    cy.contains(
      "We're Building New Courses on Rust and Python + the Replit.web Framework"
    );
  });

  it("should not show a feature image", () => {
    cy.get("figure.post-image amp-img").should("not.exist");
  });
});
