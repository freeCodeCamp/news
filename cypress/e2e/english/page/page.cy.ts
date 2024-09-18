const selectors = {
  fccSource: "[data-test-label='x-fcc-source']",
  featureImage: "[data-test-label='feature-image']",
  postFullTitle: "[data-test-label='post-full-title']",
  postContent: "[data-test-label='post-content']",
  articlePublishedTime: 'head meta[property="article:published_time"]'
};

describe('Page (Hashnode sourced)', () => {
  beforeEach(() => {
    cy.visit('/thank-you-for-being-a-supporter/');
  });

  it('should render', () => {
    cy.contains('Thank You for Being a Supporter');
  });

  it('should contain the fCC source meta tag with Hashnode as a source', () => {
    cy.get(selectors.fccSource).should('have.attr', 'content', 'Hashnode');
  });

  it('should not contain the article:published_time meta tag', () => {
    cy.get(selectors.articlePublishedTime).should('not.exist');
  });
});
