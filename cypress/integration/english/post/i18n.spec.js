const selectors = {
  socialRow: "[data-test-label='social-row']",
  learnCtaRow: "[data-test-label='learn-cta-row']",
};

describe("Post i18n", () => {
  it("the social row section for an author with Twitter does not render its i18n keys", () => {
    cy.visit("/announcing-rust-course-replit-web");

    cy.get(selectors.socialRow)
      .invoke("text")
      .then((text) => text.trim())
      .should("not.equal", "social-row.author-no-twitter") // To do: break this up into separate tests once there is an author with no Twitter account
      .should("not.equal", "social-row.author-has-twitter");
  });

  it("the social row tweet button does not render its i18n keys", () => {
    cy.visit("/announcing-rust-course-replit-web");

    cy.get(`${selectors.socialRow} a`)
      .should("have.attr", "onclick")
      .should("not.contain", "social-row.default-tweet");
  });

  it("the learn CTA section does not render its i18n keys", () => {
    cy.visit("/announcing-rust-course-replit-web");

    cy.get(`${selectors.learnCtaRow} p`)
      .invoke("text")
      .then((text) => text.trim())
      .should("not.contain", "learn-to-code-cta");

    cy.get(`${selectors.learnCtaRow} a`)
      .should("have.attr", "href")
      .should("not.equal", "learn-to-code-cta");
  });
});
