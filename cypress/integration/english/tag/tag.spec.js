const {
  getPostCards,
  loadAndCountAllPostCards,
} = require("../../../support/utils/post-cards");

const selectors = {
  tagName: "[data-test-label='tag-name']",
  tagPostCount: "[data-test-label='tag-post-count']",
};

describe("Tag page", () => {
  before(() => {
    cy.visit("/tag/freecodecamp");
  });

  it("should render", () => {
    cy.contains(selectors.tagName, "#FREECODECAMP");
  });

  // To do: run tests against a tag with more total posts
  it(`should show 7 posts on load`, () => {
    getPostCards().should("have.length.gte", 7);
  });

  it("should show the correct number of total posts", () => {
    loadAndCountAllPostCards(selectors.tagPostCount);
  });
});
