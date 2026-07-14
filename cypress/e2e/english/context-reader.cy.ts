const selectors = {
  contextReaderToggle: '#context-reader-toggle',
  contextReaderPopup: '#context-reader-popup',
  contextReaderSidePanel: '#context-reader-side-panel',
  contextReaderSaveButton:
    '#context-reader-popup [data-test-label="save-word"]',
  articleContent: "[data-test-label='post-content']"
};

describe('Context Reader Feature', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.visit('/');
  });

  it('displays toggle button in navigation', () => {
    cy.get(selectors.contextReaderToggle).should('exist');
    cy.get(selectors.contextReaderToggle).should('contain', 'Context Reader');
  });

  it('toggles context reader on and off', () => {
    cy.get(selectors.contextReaderToggle).should(
      'have.attr',
      'aria-pressed',
      'false'
    );

    cy.get(selectors.contextReaderToggle).click();

    cy.get(selectors.contextReaderToggle).should(
      'have.attr',
      'aria-pressed',
      'true'
    );
    cy.get(selectors.contextReaderToggle).should('contain', 'ON');
  });

  it('persists toggle state to localStorage', () => {
    cy.get(selectors.contextReaderToggle).click();

    cy.visit('/');

    cy.get(selectors.contextReaderToggle).should(
      'have.attr',
      'aria-pressed',
      'true'
    );
  });

  context('when enabled', () => {
    beforeEach(() => {
      cy.get(selectors.contextReaderToggle).click();
    });

    it('shows popup on double-click of article text', () => {
      cy.visit('/freecodecamp-press-books-handbooks/');

      cy.get(selectors.articleContent).find('p').first().dblclick('center');

      cy.get(selectors.contextReaderPopup).should('be.visible');
    });

    it('can save a word from the popup', () => {
      cy.visit('/freecodecamp-press-books-handbooks/');

      cy.get(selectors.articleContent).find('p').first().dblclick('center');

      cy.get(selectors.contextReaderPopup).should('be.visible');

      cy.get(selectors.contextReaderSaveButton).click();

      cy.get(selectors.contextReaderPopup).should('not.be.visible');
    });
  });

  it('opens vocabulary panel with keyboard shortcut', () => {
    cy.get(selectors.contextReaderToggle).click();

    const isMac = Cypress.platform === 'darwin';

    if (isMac) {
      cy.get('body').type('{meta}{shift}v');
    } else {
      cy.get('body').type('{ctrl}{shift}v');
    }

    cy.get(selectors.contextReaderSidePanel).should('be.visible');
  });
});
