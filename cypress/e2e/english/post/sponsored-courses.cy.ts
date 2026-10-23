const selectors = {
  rail: "[data-test-label='class-central-course-rail']",
  banner: "[data-test-label='class-central-course-banner']",
  courseCard: '.partner-courses-course',
  courseTitle: '.partner-courses-title',
  segment: "[data-test-label='sidebar-segment']",
  adWrapper: "[data-test-label='ad-wrapper']",
  bottomAd: '.banner-ad-bottom'
};

// Text screen readers announce for a section's landmark
const getLandmarkName = (section: HTMLElement) =>
  section.ownerDocument
    .getElementById(section.getAttribute('aria-labelledby') ?? '')
    ?.textContent?.trim();

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

    it('renders four course cards in both the rail and the banner', () => {
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

    it('gives the single rail a different landmark name from the banner', () => {
      cy.get(selectors.rail).then($rail =>
        expect(getLandmarkName($rail[0])).to.equal(
          'Recommended courses from our partners (sidebar)'
        )
      );
      cy.get(selectors.banner).then($banner =>
        expect(getLandmarkName($banner[0])).to.equal(
          'Recommended courses from our partners'
        )
      );
    });

    it('still shows Google ads in the sidebar alongside the rail', () => {
      cy.get('.sidebar').find(selectors.adWrapper).should('have.length.gte', 1);
    });
  });

  context('Long English post with related courses', () => {
    // 63 minute read with ten related courses
    const courseTitles = [
      'Mock C Programming from Zero',
      'Mock Pointers and Memory in C',
      'Mock Systems Programming Fundamentals',
      'Mock Data Structures in C',
      'Mock Embedded C for Microcontrollers',
      'Mock Debugging C Programs',
      'Mock Introduction to Operating Systems',
      'Mock Compilers and Build Tools',
      'Mock Writing a Shell in C',
      'Mock Concurrency with Threads in C'
    ];
    const getRailTitles = ($rail: JQuery<HTMLElement>) =>
      $rail
        .find(selectors.courseTitle)
        .toArray()
        .map(el => el.textContent?.trim());

    beforeEach(() => {
      cy.visit('/the-c-programming-handbook-for-beginners/');
    });

    it('shows one rail at the top of each sidebar segment', () => {
      cy.get(selectors.segment)
        .should('have.length.gt', 1)
        .each($segment => {
          expect($segment.children().first().is(selectors.rail)).to.equal(true);
        });
      cy.get(selectors.rail).its('length').should('be.gt', 1);
    });

    it('spreads the rails down the length of the sidebar', () => {
      cy.get(selectors.rail).then($rails => {
        const tops = $rails
          .toArray()
          .map(rail => rail.getBoundingClientRect().top);
        tops.slice(1).forEach((top, i) => expect(top).to.be.gt(tops[i]));
      });
    });

    it('cycles through the courses four at a time across every rail', () => {
      cy.get(selectors.rail)
        .should('have.length.gte', 3)
        .each(($rail, railIndex) => {
          const expected = [0, 1, 2, 3].map(
            i => courseTitles[(railIndex * 4 + i) % courseTitles.length]
          );
          expect(getRailTitles($rail)).to.deep.equal(expected);
        });
    });

    it('gives each rail and the banner a unique landmark name', () => {
      cy.get(`${selectors.rail}, ${selectors.banner}`).then($sections => {
        const names = $sections.toArray().map(getLandmarkName);
        expect(names[0]).to.equal(
          `Recommended courses from our partners (sidebar, 1 of ${names.length - 1})`
        );
        expect(new Set(names).size).to.equal(names.length);
      });
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
