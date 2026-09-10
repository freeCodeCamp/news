const selectors = {
  rail: "[data-test-label='class-central-course-rail']",
  banner: "[data-test-label='class-central-course-banner']",
  courseCard: '.partner-courses-course',
  adWrapper: "[data-test-label='ad-wrapper']",
  bottomAd: '.banner-ad-bottom'
};

describe('Sponsored courses (Class Central)', () => {
  context('English post with related courses', () => {
    beforeEach(() => {
      cy.visit('/learn-music-production-for-beginners/');
    });

    it('shows the sponsored courses rail in the sidebar', () => {
      cy.get('.sidebar').find(selectors.rail).should('be.visible');
    });

    it('shows the sponsored courses banner in place of the bottom Google ad', () => {
      cy.get(selectors.banner).should('be.visible');
      cy.get(selectors.bottomAd).should('not.exist');
    });

    it('renders one course card per course in both the rail and the banner', () => {
      cy.get(selectors.rail)
        .find(selectors.courseCard)
        .should('have.length', 4);
      cy.get(selectors.banner)
        .find(selectors.courseCard)
        .should('have.length', 4);
    });

    it('opens each course card in a new tab as a sponsored link', () => {
      cy.get(selectors.banner)
        .find(selectors.courseCard)
        .each($el => {
          expect($el.attr('href')).to.match(/^https?:\/\//);
          expect($el.attr('rel')).to.contain('sponsored');
          expect($el.attr('rel')).to.contain('noopener');
          expect($el.attr('target')).to.equal('_blank');
        });
    });

    it('still shows Google ads in the sidebar alongside the rail', () => {
      cy.get('.sidebar').find(selectors.adWrapper).should('have.length.gte', 1);
    });
  });

  context('English post without related courses', () => {
    beforeEach(() => {
      cy.visit('/how-do-numerical-conversions-work/');
    });

    it('does not render the sponsored courses rail or banner', () => {
      cy.get(selectors.rail).should('not.exist');
      cy.get(selectors.banner).should('not.exist');
    });

    it('shows the bottom Google ad instead of the banner', () => {
      cy.get(selectors.bottomAd).find(selectors.adWrapper).should('exist');
    });
  });
});
