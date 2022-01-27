const selectors = {
  comments: "[data-test-label='comments']",
  socialRow: "[data-test-label='social-row']",
};

describe("Post", () => {
  before(() => {
    cy.visit("/announcing-rust-course-replit-web");
  });

  it("should render", () => {
    // This title is in English since the local Ghost JSON for this build
    // was sourced from English News
    cy.contains(
      "We're Building New Courses on Rust and Python + the Replit.web Framework"
    );
  });

  it("should display a comments section", () => {
    cy.get(selectors.comments).should("be.visible");
  });

  it("should not display a social row", () => {
    cy.get(selectors.socialRow).should("not.exist");
  });
});
