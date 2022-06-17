const selectors = {
  socialRowCTA: "[data-test-label='social-row-cta']",
  learnCTARow: "[data-test-label='learn-cta-row']",
  tweetButton: "[data-test-label='tweet-button']",
  defaultBio: "[data-test-label='default-bio']"
};

describe('Post i18n', () => {
  context('Common', () => {
    before(() => {
      cy.visit('/announcing-rust-course-replit-web');
    });

    it('the learn CTA section should not render its i18n keys', () => {
      cy.get(`${selectors.learnCTARow} p`)
        .invoke('text')
        .then(text => text.trim())
        .should('not.contain', 'learn-to-code-cta');
    });
  });

  context('Author with Twitter', () => {
    before(() => {
      cy.visit('/announcing-rust-course-replit-web');
    });

    it('the social row CTA should not render its i18n keys', () => {
      cy.get(selectors.socialRowCTA)
        .invoke('text')
        .then(text => text.trim())
        .should('not.equal', 'social-row.cta.tweet-a-thanks');
    });

    it('the social row CTA tweet button should not render its i18n keys', () => {
      cy.get(selectors.tweetButton)
        .should('have.attr', 'onclick')
        .should('not.contain', 'social-row.tweets.default');
    });
  });

  context('Author with no Twitter or bio', () => {
    before(() => {
      cy.visit('/no-author-profile-pic');
    });

    it('the social row CTA should not render its i18n keys', () => {
      cy.get(selectors.socialRowCTA)
        .invoke('text')
        .then(text => text.trim())
        .should('not.equal', 'social-row.cta.tweet-it');
    });

    it('the social row CTA tweet button should not render its i18n keys', () => {
      cy.get(selectors.tweetButton)
        .should('have.attr', 'onclick')
        .should('not.contain', 'social-row.tweets.default');
    });

    it('the default author bio should not render its i18n key', () => {
      cy.get(selectors.defaultBio).should('not.contain', 'default-bio');
    });
  });
});
