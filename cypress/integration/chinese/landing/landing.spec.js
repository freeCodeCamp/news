const selectors = {
  bannerText: "[data-test-label='banner-text']"
}

describe('Landing', () => {
  before(() => {
    cy.visit('/');
  });

  it('should render', () => {
    cy.contains(selectors.bannerText, '学习编程 — 3,000 小时免费课程');
  });
});
