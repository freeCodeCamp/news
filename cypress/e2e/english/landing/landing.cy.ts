const commonExpectedMeta = require('../../../fixtures/common-expected-meta.json');
const { loadAllPosts } = require('../../../support/utils/post-cards');

const selectors = {
  featureImage: "[data-test-label='feature-image']",
  postCard: "[data-test-label='post-card']",
  authorList: "[data-test-label='author-list']",
  authorListItem: "[data-test-label='author-list-item']",
  authorProfileImage: "[data-test-label='profile-image']",
  avatar: "[data-test-label='avatar']",
  siteNavLogo: "[data-test-label='site-nav-logo']",
  postPublishedTime: "[data-test-label='post-published-time']",
  banner: "[data-test-label='banner']",
  scrollButton: "[data-test-label='scroll-to-top']"
};

describe('Landing (Hashnode sourced)', () => {
  context('General tests', () => {
    beforeEach(() => {
      cy.visit('/');
      loadAllPosts();
    });

    // Tests here should apply to all landing pages, regardless of the source
    it('should render basic components', () => {
      cy.get('nav').should('be.visible');
      cy.get('.banner').should('be.visible');
      cy.get('footer').should('be.visible');
    });

    it('the fCC logo in the nav should link to the full URL of the landing page', () => {
      cy.get(selectors.siteNavLogo).should(
        'have.attr',
        'href',
        commonExpectedMeta.english.siteUrl
      );
    });

    // Because all templates readers see use `default.njk` as a base,
    // we can test the favicon here
    it('should have a favicon', () => {
      cy.get('head link[rel="icon"]')
        .should('have.attr', 'href')
        .should('equal', commonExpectedMeta.favicon.ico);
    });

    it('the default banner text should be default if not authenticated', function () {
      cy.get(selectors.banner).contains(
        'Learn to code — free 3,000-hour curriculum'
      );
    });

    it('the default banner text should link to the homepage', function () {
      cy.get(selectors.banner)
        .should('have.attr', 'href')
        .should('equal', 'https://www.freecodecamp.org/');
    });

    it('the scroll button should be initially hidden', function () {
      cy.get(selectors.scrollButton).should('be.hidden');
    });

    it('the scroll button should scroll into view', function () {
      cy.scrollTo('bottom');
      cy.get(selectors.scrollButton).should('be.visible');
    });

    it('the authenticated banner text should tell people to donate', function () {
      cy.setCookie('jwt_access_token', 'dadadsdadsadasd');
      cy.visit('/');
      cy.get(selectors.banner).contains(
        'Support our charity and our mission. Donate to freeCodeCamp.org.'
      );
    });

    it('the authenticated banner link should link to the donate page', function () {
      cy.setCookie('jwt_access_token', 'dadadsdadsadasd');
      cy.visit('/');
      cy.get(selectors.banner)
        .should('have.attr', 'href')
        .should('equal', 'https://www.freecodecamp.org/donate');
    });

    it('the donor banner text should thank people', function () {
      cy.setCookie('jwt_access_token', 'dadadsdadsadasd');
      cy.setCookie('isDonor', 'true');
      cy.visit('/');
      cy.get(selectors.banner).contains(
        'Thank you for supporting freeCodeCamp through your donations.'
      );
    });

    it('the donor banner should link to how to donate', function () {
      cy.setCookie('jwt_access_token', 'dadadsdadsadasd');
      cy.setCookie('isDonor', 'true');
      cy.visit('/');
      cy.get(selectors.banner)
        .should('have.attr', 'href')
        .should(
          'equal',
          'https://www.freecodecamp.org/news/how-to-donate-to-free-code-camp/'
        );
    });
  });

  context('Feature image', () => {
    beforeEach(() => {
      cy.visit('/');
      loadAllPosts();
    });

    it('each post card should contain a feature image', () => {
      const numberOfPosts = Cypress.$(selectors.postCard).length;

      cy.get(selectors.featureImage).should('have.length', numberOfPosts);
    });

    it('posts with no feature image should fall back to the default fCC indigo image', () => {
      cy.contains('Hashnode No Feature Image')
        .parents('.post-card')
        .find<HTMLImageElement>(selectors.featureImage)
        .then($el =>
          expect($el[0].src).to.equal(
            'https://cdn.freecodecamp.org/platform/universal/fcc_meta_1920X1080-indigo.png'
          )
        );
    });
  });

  // Hashnode provides a default image for authors who don't upload a profile picture,
  // so basic tests for profile images are fine
  context('Authors with profile image', () => {
    beforeEach(() => {
      cy.visit('/');
      loadAllPosts();
    });

    it("should show the author's profile image", () => {
      cy.get(selectors.postCard)
        .contains(
          'Ben Awad is a GameDev Who Sleeps 9 Hours EVERY NIGHT to be Productive [Podcast #121]'
        )
        .parents('article')
        .find(selectors.authorProfileImage)
        .then($el => expect($el[0].tagName.toLowerCase()).to.equal('img'));
    });

    it("the author profile image should contain an `alt` attribute with the author's name", () => {
      cy.get(selectors.postCard)
        .contains(
          'Ben Awad is a GameDev Who Sleeps 9 Hours EVERY NIGHT to be Productive [Podcast #121]'
        )
        .parents('article')
        .find<HTMLImageElement>(selectors.authorProfileImage)
        .then($el => expect($el[0].alt).to.equal('Quincy Larson'));
    });
  });

  context('freeCodeCamp author', () => {
    beforeEach(() => {
      cy.visit('/');
      loadAllPosts();
    });

    it("posts written by 'freeCodeCamp' should not show the `author-list`, which contain's the author's name and profile image", () => {
      cy.get(selectors.postCard)
        .contains('How Does Recursion Work? Explained with Code Examples')
        .parents('article')
        .find(selectors.authorList)
        .should('not.exist');
    });
  });
});
