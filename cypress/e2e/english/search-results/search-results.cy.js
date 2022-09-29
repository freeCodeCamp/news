const selectors = {
  postCard: "[data-test-label='post-card']",
  articleTitle:
    'freeCodeCamp Just Got a Million Dollar Donation from an Alum to Build a Carbon-Neutral Web3 Curriculum',
  authorList: "[data-test-label='author-list']",
  authorListItem: "[data-test-label='author-list-item']",
  authorProfileImage: "[data-test-label='profile-image']",
  profileImage: "[data-test-label='profile-image']",
  profileLink: "[data-test-label='profile-link']",
  avatar: "[data-test-label='avatar']",
  postPublishedTime: "[data-test-label='post-published-time']"
};

describe('Search results', () => {
  before(() => {
    // Note: 11ty's local server will automatically add a trailing
    // slash immediately after `/search`, before the `query` URL
    // parameter. This does not happen on production since we
    // don't redirect from the non-trailing slash version of the
    // page to the trailing slash version
    cy.visit('/search?query=mock%20search%20results');
  });

  context('General tests', () => {
    it('the post card should contain an author list with an inner author list item', () => {
      cy.get(selectors.postCard)
        .contains(selectors.articleTitle)
        .parentsUntil('article')
        .find(selectors.authorList)
        .then($el => {
          cy.wrap($el).find(selectors.authorListItem);
        });
    });

    it('the author list item should have profile image, profile link, and post published time elements', () => {
      cy.get(selectors.postCard)
        .contains(selectors.articleTitle)
        .parentsUntil('article')
        .find(selectors.authorListItem)
        .then($el => {
          cy.wrap($el).find(selectors.profileImage);
          cy.wrap($el).find(selectors.profileLink);
          cy.wrap($el).find(selectors.postPublishedTime);
        });
    });

    it("the author's profile image should be wrapped in an anchor that points to the author's page", () => {
      cy.get(selectors.postCard)
        .contains(selectors.articleTitle)
        .parentsUntil('article')
        .find(selectors.authorListItem)
        .find(selectors.profileImage)
        .parent()
        .then($el => {
          expect($el.attr('href')).to.deep.equal(
            'https://www.freecodecamp.org/news/author/quincylarson/'
          );
        });
    });

    it("the author's profile image should contain an `alt` attribute with the author's name", () => {
      cy.get(selectors.postCard)
        .contains(selectors.articleTitle)
        .parentsUntil('article')
        .find(selectors.authorProfileImage)
        .then($el => expect($el[0].alt).to.equal('Quincy Larson'));
    });

    it('the post published time should convert to the expected UTC string', () => {
      cy.get(selectors.postCard)
        .contains(selectors.articleTitle)
        .parentsUntil('article')
        .find(selectors.authorListItem)
        .find(selectors.postPublishedTime)
        .then($el => {
          const publishedTimeUTC = new Date($el.attr('datetime')).toUTCString();

          expect(publishedTimeUTC).to.deep.equal(
            'Wed, 19 Jan 2022 21:23:18 GMT'
          );
        });
    });
  });

  context('No author profile image', () => {
    it('it should should show the avatar SVG', () => {
      cy.get(selectors.postCard)
        .contains(
          'Web Scraping in Python – How to Scrape Sci-Fi Movies from IMDB'
        )
        .parentsUntil('article')
        .find(selectors.avatar)
        .then($el => expect($el[0].tagName.toLowerCase()).to.equal('svg'));
    });

    it("the avatar SVG should contain a `title` element with the author's name", () => {
      cy.get(selectors.postCard)
        .contains(
          'Web Scraping in Python – How to Scrape Sci-Fi Movies from IMDB'
        )
        .parentsUntil('article')
        .find(selectors.avatar)
        .contains('title', 'Riley Predum');
    });
  });

  context('Author is freeCodeCamp.org', () => {
    it("it should not show the `author-list`, which contain's the author's name and profile image", () => {
      cy.get(selectors.postCard)
        .contains('Common Technical Support Questions – freeCodeCamp FAQ')
        .parentsUntil('article')
        .find(selectors.authorList)
        .should('not.exist');
    });
  });
});
