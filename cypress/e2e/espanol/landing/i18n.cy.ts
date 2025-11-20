const selectors = {
  nav: {
    searchBar: "[data-test-label='search-bar']",
    forumButton: "[data-test-label='forum-button']",
    donateButton: "[data-test-label='donate-button']"
  },
  banner: "[data-test-label='banner']",
  loadMoreArticlesButton: "[data-test-label='load-more-articles-button']",
  footer: {
    taxExemptStatus: "[data-test-label='tax-exempt-status']",
    missionStatement: "[data-test-label='mission-statement']",
    donationInitiatives: "[data-test-label='donation-initiatives']",
    donateText: "[data-test-label='donate-text']",
    trendingGuides: "[data-test-label='trending-guides']",
    ourNonprofit: "[data-test-label='our-nonprofit']",
    trendingGuideLinks:
      "[data-test-label='trending-guides'] .trending-guides-articles a",
    links: {
      about: "[data-test-label='about']",
      alumni: "[data-test-label='alumni']",
      openSource: "[data-test-label='open-source']",
      shop: "[data-test-label='shop']",
      support: "[data-test-label='support']",
      sponsors: "[data-test-label='sponsors']",
      honesty: "[data-test-label='honesty']",
      coc: "[data-test-label='coc']",
      privacy: "[data-test-label='privacy']",
      tos: "[data-test-label='tos']",
      copyright: "[data-test-label='copyright']"
    }
  }
};

describe('Landing i18n', () => {
  before(() => {
    // Update baseUrl to include current language
    Cypress.config('baseUrl', 'http://localhost:8080/espanol/news/');
  });

  beforeEach(() => {
    cy.visit('/');
  });

  it('nav elements do not render their i18n keys', () => {
    cy.get(selectors.nav.forumButton)
      .should('not.equal', 'buttons.forum')
      .should('have.attr', 'href')
      .should('not.equal', 'forum');
    cy.get(selectors.nav.donateButton)
      .should('not.equal', 'buttons.donate')
      .should('have.attr', 'href')
      .should('not.equal', 'donate');
  });

  it('the search bar does not render its i18n keys', () => {
    cy.get(`${selectors.nav.searchBar} label`)
      .invoke('text')
      .then(text => text.trim())
      .should('not.equal', 'search.label');
    cy.get(`${selectors.nav.searchBar} input`)
      .should('have.attr', 'placeholder')
      .should('not.equal', 'search.placeholder');
    cy.get(`${selectors.nav.searchBar} button span`)
      .invoke('text')
      .should('not.equal', 'search.accessible-name');
  });

  it('the banner does not render its i18n key', () => {
    cy.get(selectors.banner).should('not.equal', 'banner');
  });

  it("the 'Load More Articles' button does not render its i18n key", () => {
    cy.get(selectors.loadMoreArticlesButton).should(
      'not.equal',
      'buttons.load-more-articles'
    );
  });

  it('the footer description elements do not render their i18n keys', () => {
    cy.get(selectors.footer.taxExemptStatus).should(
      'not.equal',
      'footer.tax-exempt-status'
    );
    cy.get(selectors.footer.missionStatement).should(
      'not.equal',
      'footer.our-nonprofit'
    );
    cy.get(selectors.footer.donationInitiatives).should(
      'not.equal',
      'footer.donation-initiatives'
    );
    cy.get(selectors.footer.donateText)
      .should('not.equal', 'footer.donate-text')
      .get(`${selectors.footer.donateText} a`)
      .should('have.attr', 'href')
      .should('not.equal', 'donate');
  });

  it('the trending guide elements do not render their i18n keys', () => {
    cy.get(selectors.footer.trendingGuideLinks)
      .should('have.length', 30)
      .each((link, index) => {
        cy.wrap(link)
          .should('not.equal', `article${index}title`)
          .should('have.attr', 'href')
          .should('not.equal', `article${index}link`);
      });
  });

  it('the bottom footer links do not render their i18n keys', () => {
    // Change to mobile viewport so the 'Our Charity' header is visible
    cy.viewport(400, 660);

    cy.get(selectors.footer.ourNonprofit).should(
      'not.equal',
      'footer.our-nonprofit'
    );
    cy.get(selectors.footer.links.about)
      .should('not.equal', 'footer.links.about')
      .should('have.attr', 'href')
      .should('not.equal', 'footer.about');
    cy.get(selectors.footer.links.alumni)
      .should('not.equal', 'footer.links.alumni')
      .should('have.attr', 'href')
      .should(
        'equal',
        'https://www.linkedin.com/school/free-code-camp/people/'
      );
    cy.get(selectors.footer.links.openSource)
      .should('not.equal', 'footer.links.open-source')
      .should('have.attr', 'href')
      .should('equal', 'https://github.com/freeCodeCamp/');
    cy.get(selectors.footer.links.shop)
      .should('not.equal', 'footer.links.shop')
      .should('have.attr', 'href')
      .should('equal', 'https://www.freecodecamp.org/news/shop/');
    cy.get(selectors.footer.links.support)
      .should('not.equal', 'footer.links.support')
      .should('have.attr', 'href')
      .should('not.equal', 'footer.support');
    cy.get(selectors.footer.links.sponsors)
      .should('not.equal', 'footer.links.sponsors')
      .should('have.attr', 'href')
      .should('equal', 'https://www.freecodecamp.org/news/sponsors/');
    cy.get(selectors.footer.links.honesty)
      .should('not.equal', 'footer.links.honesty')
      .should('have.attr', 'href')
      .should('not.equal', 'footer.honesty');
    cy.get(selectors.footer.links.coc)
      .should('not.equal', 'footer.links.coc')
      .should('have.attr', 'href')
      .should('not.equal', 'footer.coc');
    cy.get(selectors.footer.links.privacy)
      .should('not.equal', 'footer.links.privacy')
      .should('have.attr', 'href')
      .should('equal', 'https://www.freecodecamp.org/news/privacy-policy/');
    cy.get(selectors.footer.links.tos)
      .should('not.equal', 'footer.links.tos')
      .should('have.attr', 'href')
      .should('equal', 'https://www.freecodecamp.org/news/terms-of-service/');
    cy.get(selectors.footer.links.copyright)
      .should('not.equal', 'footer.links.copyright')
      .should('have.attr', 'href')
      .should('equal', 'https://www.freecodecamp.org/news/copyright-policy/');
  });
});
