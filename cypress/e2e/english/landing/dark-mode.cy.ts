import { loadAllPosts } from '../../../support/utils/post-cards';

const selectors = {
  toggleDropDownMenuButton: "[data-test-label='header-menu-button']",
  darkModeButton: "[data-test-label='dark-mode-button']",
  prismLight: '#prism-theme-light',
  prismDark: '#prism-theme-dark'
};

const postUrl = '/how-do-numerical-conversions-work/';

interface MockMediaQueryList {
  media: string;
  matches: boolean;
  addEventListener: (
    event: 'change',
    cb: (e: { matches: boolean }) => void
  ) => void;
  removeEventListener: (
    event: 'change',
    cb: (e: { matches: boolean }) => void
  ) => void;
  addListener: (cb: (e: { matches: boolean }) => void) => void;
  removeListener: (cb: (e: { matches: boolean }) => void) => void;
}

type WinWithMqRegistry = Cypress.AUTWindow & {
  __mqListeners?: Set<(e: { matches: boolean }) => void>;
  __mqMatches?: boolean;
};

const installMatchMediaStub = (
  win: WinWithMqRegistry,
  darkAppearance: boolean
) => {
  win.__mqListeners = new Set();
  win.__mqMatches = darkAppearance;
  const mql: MockMediaQueryList = {
    media: '(prefers-color-scheme: dark)',
    get matches() {
      return win.__mqMatches as boolean;
    },
    addEventListener: (event, cb) => {
      if (event === 'change') win.__mqListeners!.add(cb);
    },
    removeEventListener: (event, cb) => {
      if (event === 'change') win.__mqListeners!.delete(cb);
    },
    addListener: cb => win.__mqListeners!.add(cb),
    removeListener: cb => win.__mqListeners!.delete(cb)
  };
  cy.stub(win, 'matchMedia')
    .withArgs('(prefers-color-scheme: dark)')
    .returns(mql);
};

const emitSystemPrefChange = (win: WinWithMqRegistry, matches: boolean) => {
  win.__mqMatches = matches;
  win.__mqListeners?.forEach(cb => cb({ matches }));
};

const visitWithPreference = (darkAppearance: boolean, url = '/') =>
  cy.visit(url, {
    onBeforeLoad(win) {
      installMatchMediaStub(win as WinWithMqRegistry, darkAppearance);
    }
  });

const openMenuAndToggleDarkMode = () => {
  cy.get(selectors.toggleDropDownMenuButton).click();
  cy.get(selectors.darkModeButton).should('be.visible').click();
};

const assertPrismDisabled = (selector: string) => {
  cy.get(selector).should($el => {
    expect(($el[0] as HTMLLinkElement).disabled).to.equal(true);
  });
};

const assertPrismEnabled = (selector: string) => {
  cy.get(selector).should($el => {
    expect(($el[0] as HTMLLinkElement).disabled).to.equal(false);
  });
};

describe('Dark Mode', () => {
  context('Toggle button element', () => {
    beforeEach(() => {
      cy.visit('/');
      loadAllPosts();
    });

    it('should render as a <button> element, not an anchor', () => {
      cy.get(selectors.darkModeButton).then($el => {
        expect($el[0].tagName.toLowerCase()).to.equal('button');
      });
    });

    it('should have aria-pressed attribute', () => {
      cy.get(selectors.darkModeButton).should('have.attr', 'aria-pressed');
    });

    it('should set aria-pressed to "false" in light mode', () => {
      visitWithPreference(false);
      cy.get(selectors.darkModeButton).should(
        'have.attr',
        'aria-pressed',
        'false'
      );
    });

    it('should set aria-pressed to "true" in dark mode', () => {
      visitWithPreference(true);
      cy.get(selectors.darkModeButton).should(
        'have.attr',
        'aria-pressed',
        'true'
      );
    });

    it('should toggle aria-pressed when clicked', () => {
      visitWithPreference(false);
      cy.get(selectors.darkModeButton).should(
        'have.attr',
        'aria-pressed',
        'false'
      );
      openMenuAndToggleDarkMode();
      cy.get(selectors.darkModeButton).should(
        'have.attr',
        'aria-pressed',
        'true'
      );
    });
  });

  context('Theme class on <html>', () => {
    beforeEach(() => {
      cy.visit('/');
      loadAllPosts();
    });

    it('should add dark-mode class to <html> when toggled on', () => {
      visitWithPreference(false);
      cy.get('html').should('not.have.class', 'dark-mode');
      openMenuAndToggleDarkMode();
      cy.get('html').should('have.class', 'dark-mode');
    });

    it('should remove dark-mode class from <html> when toggled off', () => {
      visitWithPreference(true);
      cy.get('html').should('have.class', 'dark-mode');
      openMenuAndToggleDarkMode();
      cy.get('html').should('not.have.class', 'dark-mode');
    });

    it('should never place dark-mode class on <body>', () => {
      visitWithPreference(false);
      openMenuAndToggleDarkMode();
      cy.get('body').should('not.have.class', 'dark-mode');
    });
  });

  context('localStorage persistence', () => {
    beforeEach(() => {
      cy.clearLocalStorage();
      visitWithPreference(false);
      loadAllPosts();
    });

    it('should set localStorage theme to "dark" when toggling to dark mode', () => {
      openMenuAndToggleDarkMode();
      cy.window().then(win => {
        expect(win.localStorage.getItem('theme')).to.equal('dark');
      });
    });

    it('should set localStorage theme to "light" when toggling back to light mode', () => {
      openMenuAndToggleDarkMode();
      // Menu stays open after dark mode click; click dark mode button again directly
      cy.get(selectors.darkModeButton).click();
      cy.window().then(win => {
        expect(win.localStorage.getItem('theme')).to.equal('light');
      });
    });

    it('should persist dark mode across page navigation', () => {
      openMenuAndToggleDarkMode();
      cy.visit('/');
      cy.get('html').should('have.class', 'dark-mode');
    });

    it('should persist light mode across page navigation', () => {
      openMenuAndToggleDarkMode();
      // Menu stays open; click dark mode button again directly
      cy.get(selectors.darkModeButton).click();
      cy.visit('/');
      cy.get('html').should('not.have.class', 'dark-mode');
    });
  });

  context('System preference detection (FOUC prevention)', () => {
    it('should apply dark mode when system prefers dark and no localStorage', () => {
      cy.clearLocalStorage();
      visitWithPreference(true);
      cy.get('html').should('have.class', 'dark-mode');
    });

    it('should not apply dark mode when system prefers light and no localStorage', () => {
      cy.clearLocalStorage();
      visitWithPreference(false);
      cy.get('html').should('not.have.class', 'dark-mode');
    });

    it('should respect localStorage over system preference (localStorage=light, system=dark)', () => {
      cy.visit('/', {
        onBeforeLoad(win) {
          win.localStorage.setItem('theme', 'light');
          installMatchMediaStub(win as WinWithMqRegistry, true);
        }
      });
      cy.get('html').should('not.have.class', 'dark-mode');
    });

    it('should respect localStorage over system preference (localStorage=dark, system=light)', () => {
      cy.visit('/', {
        onBeforeLoad(win) {
          win.localStorage.setItem('theme', 'dark');
          installMatchMediaStub(win as WinWithMqRegistry, false);
        }
      });
      cy.get('html').should('have.class', 'dark-mode');
    });
  });

  context('OS preference change at runtime', () => {
    beforeEach(() => {
      cy.clearLocalStorage();
    });

    it('flips to dark mode when system pref changes to dark and no user choice is persisted', () => {
      visitWithPreference(false);
      cy.get('html').should('not.have.class', 'dark-mode');
      cy.window().then(win =>
        emitSystemPrefChange(win as WinWithMqRegistry, true)
      );
      cy.get('html').should('have.class', 'dark-mode');
      cy.window().then(win => {
        // OS-driven change must not write to localStorage.
        expect(win.localStorage.getItem('theme')).to.equal(null);
      });
    });

    it('flips back to light mode when system pref changes to light and no user choice is persisted', () => {
      visitWithPreference(true);
      cy.get('html').should('have.class', 'dark-mode');
      cy.window().then(win =>
        emitSystemPrefChange(win as WinWithMqRegistry, false)
      );
      cy.get('html').should('not.have.class', 'dark-mode');
    });

    it('ignores system pref changes once the user has explicitly toggled', () => {
      visitWithPreference(false);
      loadAllPosts();
      openMenuAndToggleDarkMode();
      cy.get('html').should('have.class', 'dark-mode');
      cy.window().then(win =>
        emitSystemPrefChange(win as WinWithMqRegistry, false)
      );
      cy.get('html').should('have.class', 'dark-mode');
    });
  });

  context('Initial icon state reconciliation', () => {
    beforeEach(() => {
      cy.clearLocalStorage();
    });

    it('shows fa-square icon on first paint in light mode', () => {
      visitWithPreference(false);
      cy.get(`${selectors.darkModeButton} i`).should('have.class', 'fa-square');
      cy.get(`${selectors.darkModeButton} i`).should(
        'not.have.class',
        'fa-square-check'
      );
    });

    it('shows fa-square-check icon on first paint in dark mode', () => {
      visitWithPreference(true);
      cy.get(`${selectors.darkModeButton} i`).should(
        'have.class',
        'fa-square-check'
      );
      cy.get(`${selectors.darkModeButton} i`).should(
        'not.have.class',
        'fa-square'
      );
    });
  });

  context('color-scheme CSS property', () => {
    beforeEach(() => {
      cy.clearLocalStorage();
    });

    it('sets color-scheme: light on <html> in light mode', () => {
      visitWithPreference(false);
      cy.get('html').should('have.css', 'color-scheme', 'light');
    });

    it('sets color-scheme: dark on <html> in dark mode', () => {
      visitWithPreference(true);
      cy.get('html').should('have.css', 'color-scheme', 'dark');
    });
  });

  context('Prism syntax theme toggling', () => {
    beforeEach(() => {
      cy.clearLocalStorage();
    });

    it('should have both prism theme link elements on post pages', () => {
      cy.visit(postUrl);
      cy.get(selectors.prismLight).should('exist');
      cy.get(selectors.prismDark).should('exist');
    });

    it('should disable the dark prism theme in light mode', () => {
      visitWithPreference(false, postUrl);
      assertPrismDisabled(selectors.prismDark);
      assertPrismEnabled(selectors.prismLight);
    });

    it('should disable the light prism theme in dark mode', () => {
      visitWithPreference(true, postUrl);
      assertPrismDisabled(selectors.prismLight);
      assertPrismEnabled(selectors.prismDark);
    });

    it('should swap prism themes when toggling dark mode on', () => {
      visitWithPreference(false, postUrl);
      assertPrismDisabled(selectors.prismDark);
      openMenuAndToggleDarkMode();
      assertPrismDisabled(selectors.prismLight);
      assertPrismEnabled(selectors.prismDark);
    });

    it('should swap prism themes when toggling dark mode off', () => {
      visitWithPreference(true, postUrl);
      assertPrismDisabled(selectors.prismLight);
      openMenuAndToggleDarkMode();
      assertPrismDisabled(selectors.prismDark);
      assertPrismEnabled(selectors.prismLight);
    });
  });

  context('Visual styling', () => {
    beforeEach(() => {
      cy.visit('/');
      loadAllPosts();
    });

    it('should change body background color when dark mode is active', () => {
      visitWithPreference(false);
      cy.get('body').then($body => {
        const lightBg = $body.css('background-color');
        openMenuAndToggleDarkMode();
        cy.get('body').should($darkBody => {
          expect($darkBody.css('background-color')).to.not.equal(lightBg);
        });
      });
    });

    it('should change text color when dark mode is active', () => {
      visitWithPreference(false);
      cy.get('body').then($body => {
        const lightColor = $body.css('color');
        openMenuAndToggleDarkMode();
        cy.get('body').should($darkBody => {
          expect($darkBody.css('color')).to.not.equal(lightColor);
        });
      });
    });
  });
});
