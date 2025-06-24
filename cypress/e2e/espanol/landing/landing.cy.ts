import commonExpectedMeta from '../../../fixtures/common-expected-meta.json';

const selectors = {
  featureImage: "[data-test-label='feature-image']",
  postCard: "[data-test-label='post-card']",
  authorList: "[data-test-label='author-list']",
  authorListItem: "[data-test-label='author-list-item']",
  authorProfileImage: "[data-test-label='profile-image']",
  avatar: "[data-test-label='avatar']",
  siteNavLogo: "[data-test-label='site-nav-logo']",
  postPublishedTime: "[data-test-label='post-published-time']",
  banner: "[data-test-label='banner']"
};

describe('Landing (Ghost sourced)', () => {
  before(() => {
    // Update baseUrl to include current language
    Cypress.config('baseUrl', 'http://localhost:8080/espanol/news/');
  });

  context('General tests', () => {
    beforeEach(() => {
      cy.visit('/');
    });

    it('the fCC logo in the nav should link to the full URL of the landing page', () => {
      cy.get(selectors.siteNavLogo).should(
        'have.attr',
        'href',
        commonExpectedMeta.espanol.siteUrl
      );
    });
  });

  context('Feature image', () => {
    beforeEach(() => {
      cy.visit('/');
    });

    it('each post card should contain a feature image', () => {
      const numberOfPosts = Cypress.$(selectors.postCard).length;

      cy.get(selectors.featureImage).should('have.length', numberOfPosts);
    });

    it('posts with no feature image should fall back to the default fCC indigo image', () => {
      cy.contains('Ghost No Feature Image')
        .parents('.post-card')
        .find<HTMLImageElement>(selectors.featureImage)
        .then($el =>
          expect($el[0].src).to.equal(
            'https://cdn.freecodecamp.org/platform/universal/fcc_meta_1920X1080-indigo.png'
          )
        );
    });
  });

  context('Authors with profile image', () => {
    beforeEach(() => {
      cy.visit('/');
    });

    it("should show the author's profile image", () => {
      cy.get(selectors.postCard)
        .contains(
          'Cómo funciona el operador de signo de interrogación (?) en JavaScript'
        )
        .parentsUntil('article')
        .find(selectors.authorProfileImage)
        .then($el => expect($el[0].tagName.toLowerCase()).to.equal('img'));
    });

    it("the author profile image should contain an `alt` attribute with the author's name", () => {
      cy.get(selectors.postCard)
        .contains(
          'Cómo funciona el operador de signo de interrogación (?) en JavaScript'
        )
        .parentsUntil('article')
        .find<HTMLImageElement>(selectors.authorProfileImage)
        .then($el => expect($el[0].alt).to.equal('Rafael D. Hernandez'));
    });
  });

  // Ghost does not provide a default profile image for authors who don't upload one
  context('Authors with no profile image', () => {
    beforeEach(() => {
      cy.visit('/');
    });

    it('post cards written by an author with no profile image should show the author SVG', () => {
      cy.get(selectors.postCard)
        .contains('No Author Profile Pic')
        .parentsUntil('article')
        .find(selectors.avatar)
        .then($el => expect($el[0].tagName.toLowerCase()).to.equal('svg'));
    });

    it("the avatar SVG should contain a `title` element with the author's name", () => {
      cy.get(selectors.postCard)
        .contains('No Author Profile Pic')
        .parentsUntil('article')
        .find(selectors.avatar)
        .contains('title', 'Mrugesh Mohapatra');
    });
  });

  context('freeCodeCamp.org author', () => {
    beforeEach(() => {
      cy.visit('/');
    });

    it("posts written by 'freeCodeCamp.org' should not show the `author-list`, which contain's the author's name and profile image", () => {
      cy.get(selectors.postCard)
        .contains('Preguntas comunes de soporte técnico – freeCodeCamp FAQ')
        .parentsUntil('article')
        .find(selectors.authorList)
        .should('not.exist');
    });
  });
});
