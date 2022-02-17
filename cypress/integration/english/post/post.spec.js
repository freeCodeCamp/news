describe('Post', () => {
  before(() => {
    cy.visit('/announcing-rust-course-replit-web');
  });

  it('should render', () => {
    cy.contains(
      "We're Building New Courses on Rust and Python + the Replit.web Framework"
    );
  });
});
