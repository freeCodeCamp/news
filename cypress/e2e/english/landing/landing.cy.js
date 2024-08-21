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
  banner: "[data-test-label='banner']"
};

describe('Landing', () => {
  beforeEach(() => {
    cy.visit('/');
    loadAllPosts();
  });

  it('should render basic components', () => {
    cy.get('nav').should('be.visible');
    cy.get('.banner').should('be.visible');
    cy.get('footer').should('be.visible');
  });

  it('the fCC logo in the nav should link to the full URL of the landing page', () => {
    cy.get(selectors.siteNavLogo).should(
      'have.attr',
      'href',
      commonExpectedMeta.siteUrl
    );
  });

  it("should show the author's profile image", () => {
    cy.get(selectors.postCard)
      .contains(
        'Learn Responsive Web Design by Building 20 Projects – a Major freeCodeCamp Curriculum Update'
      )
      .parentsUntil('article')
      .find(selectors.authorProfileImage)
      .then($el => expect($el[0].tagName.toLowerCase()).to.equal('img'));
  });

  it("the author profile image should contain an `alt` attribute with the author's name", () => {
    cy.get(selectors.postCard)
      .contains(
        'Learn Responsive Web Design by Building 20 Projects – a Major freeCodeCamp Curriculum Update'
      )
      .parentsUntil('article')
      .find(selectors.authorProfileImage)
      .then($el => expect($el[0].alt).to.equal('Quincy Larson'));
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

  it("posts written by 'freeCodeCamp.org' should not show the `author-list`, which contain's the author's name and profile image", () => {
    cy.get(selectors.postCard)
      .contains('Common Technical Support Questions – freeCodeCamp FAQ')
      .parentsUntil('article')
      .find(selectors.authorList)
      .should('not.exist');
  });

  it('each post card should contain a feature image', () => {
    const numberOfPosts = Cypress.$(selectors.postCard).length;

    cy.get(selectors.featureImage).should('have.length', numberOfPosts);
  });
  // Note: Remove this testing block once we migrate all posts to Hashnode
  context('Duplicate slugs', () => {
    it('should render the older Ghost-sourced post', () => {
      cy.get(selectors.postCard)
        .contains('Learn React in Spanish – Course for Beginners')
        .should('have.length', 1)
        .parentsUntil('article')
        .find(selectors.authorListItem)
        .find(selectors.postPublishedTime)
        .then($el => {
          const publishedTimeUTC = new Date($el.attr('datetime')).toUTCString();

          expect(publishedTimeUTC).to.deep.equal(
            'Tue, 15 Mar 2022 11:30:00 GMT'
          );
        });
    });

    it('should render the older Hashnode-sourced post', () => {
      cy.get(selectors.postCard)
        .contains(
          'Ben Awad is a GameDev Who Sleeps 9 Hours EVERY NIGHT to be Productive [Podcast #121]'
        )
        .should('have.length', 1)
        .parentsUntil('article')
        .find(selectors.authorListItem)
        .find(selectors.postPublishedTime)
        .then($el => {
          const publishedTimeUTC = new Date($el.attr('datetime')).toUTCString();

          expect(publishedTimeUTC).to.deep.equal(
            'Fri, 26 Apr 2024 15:29:48 GMT'
          );
        });
    });
  });
});
