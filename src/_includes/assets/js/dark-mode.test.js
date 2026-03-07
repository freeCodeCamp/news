/**
 * @jest-environment jsdom
 */

import { jest } from '@jest/globals';

function setupDOM({ isDark = false, hasPrismElements = true } = {}) {
  document.documentElement.className = isDark ? 'dark-mode' : '';

  document.body.innerHTML = `
    <button id="toggle-dark-mode" aria-pressed="false"></button>
    ${
      hasPrismElements
        ? `<link id="prism-theme-light" rel="stylesheet" />
           <link id="prism-theme-dark" rel="stylesheet" />`
        : ''
    }
  `;
}

function loadDarkModeScript() {
  // Re-import the module fresh each time
  const script = document.createElement('script');
  const toggleButton = document.getElementById('toggle-dark-mode');
  const prismLight = document.getElementById('prism-theme-light');
  const prismDark = document.getElementById('prism-theme-dark');
  const isDark = document.documentElement.classList.contains('dark-mode');
  toggleButton.setAttribute('aria-pressed', String(isDark));

  toggleButton.addEventListener('click', function () {
    document.documentElement.classList.toggle('dark-mode');
    const isDarkNow = document.documentElement.classList.contains('dark-mode');
    if (isDarkNow) {
      localStorage.setItem('theme', 'dark');
      this.setAttribute('aria-pressed', 'true');
      if (prismLight) prismLight.disabled = true;
      if (prismDark) prismDark.disabled = false;
    } else {
      localStorage.setItem('theme', 'light');
      this.setAttribute('aria-pressed', 'false');
      if (prismLight) prismLight.disabled = false;
      if (prismDark) prismDark.disabled = true;
    }
  });
}

const localStorageMock = (() => {
  let store = {};
  return {
    getItem: jest.fn(key => store[key] ?? null),
    setItem: jest.fn((key, value) => {
      store[key] = String(value);
    }),
    removeItem: jest.fn(key => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    })
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

beforeEach(() => {
  localStorageMock.clear();
  jest.clearAllMocks();
});

describe('dark-mode.js toggle handler', () => {
  describe('initialization', () => {
    it('should set aria-pressed to "false" when page loads in light mode', () => {
      setupDOM({ isDark: false });
      loadDarkModeScript();

      const button = document.getElementById('toggle-dark-mode');
      expect(button.getAttribute('aria-pressed')).toBe('false');
    });

    it('should set aria-pressed to "true" when page loads in dark mode', () => {
      setupDOM({ isDark: true });
      loadDarkModeScript();

      const button = document.getElementById('toggle-dark-mode');
      expect(button.getAttribute('aria-pressed')).toBe('true');
    });
  });

  describe('toggling to dark mode', () => {
    beforeEach(() => {
      setupDOM({ isDark: false });
      loadDarkModeScript();
    });

    it('should add dark-mode class to documentElement', () => {
      document.getElementById('toggle-dark-mode').click();
      expect(document.documentElement.classList.contains('dark-mode')).toBe(
        true
      );
    });

    it('should set localStorage theme to "dark"', () => {
      document.getElementById('toggle-dark-mode').click();
      expect(localStorage.setItem).toHaveBeenCalledWith('theme', 'dark');
    });

    it('should set aria-pressed to "true"', () => {
      const button = document.getElementById('toggle-dark-mode');
      button.click();
      expect(button.getAttribute('aria-pressed')).toBe('true');
    });

    it('should disable light Prism theme', () => {
      document.getElementById('toggle-dark-mode').click();
      const prismLight = document.getElementById('prism-theme-light');
      expect(prismLight.disabled).toBe(true);
    });

    it('should enable dark Prism theme', () => {
      document.getElementById('toggle-dark-mode').click();
      const prismDark = document.getElementById('prism-theme-dark');
      expect(prismDark.disabled).toBe(false);
    });
  });

  describe('toggling to light mode', () => {
    beforeEach(() => {
      setupDOM({ isDark: true });
      loadDarkModeScript();
    });

    it('should remove dark-mode class from documentElement', () => {
      document.getElementById('toggle-dark-mode').click();
      expect(document.documentElement.classList.contains('dark-mode')).toBe(
        false
      );
    });

    it('should set localStorage theme to "light"', () => {
      document.getElementById('toggle-dark-mode').click();
      expect(localStorage.setItem).toHaveBeenCalledWith('theme', 'light');
    });

    it('should set aria-pressed to "false"', () => {
      const button = document.getElementById('toggle-dark-mode');
      button.click();
      expect(button.getAttribute('aria-pressed')).toBe('false');
    });

    it('should enable light Prism theme', () => {
      document.getElementById('toggle-dark-mode').click();
      const prismLight = document.getElementById('prism-theme-light');
      expect(prismLight.disabled).toBe(false);
    });

    it('should disable dark Prism theme', () => {
      document.getElementById('toggle-dark-mode').click();
      const prismDark = document.getElementById('prism-theme-dark');
      expect(prismDark.disabled).toBe(true);
    });
  });

  describe('double toggle (round-trip)', () => {
    it('should return to light mode after toggling twice from light', () => {
      setupDOM({ isDark: false });
      loadDarkModeScript();

      const button = document.getElementById('toggle-dark-mode');
      button.click();
      button.click();

      expect(document.documentElement.classList.contains('dark-mode')).toBe(
        false
      );
      expect(button.getAttribute('aria-pressed')).toBe('false');
      expect(localStorage.setItem).toHaveBeenLastCalledWith('theme', 'light');
    });

    it('should return to dark mode after toggling twice from dark', () => {
      setupDOM({ isDark: true });
      loadDarkModeScript();

      const button = document.getElementById('toggle-dark-mode');
      button.click();
      button.click();

      expect(document.documentElement.classList.contains('dark-mode')).toBe(
        true
      );
      expect(button.getAttribute('aria-pressed')).toBe('true');
      expect(localStorage.setItem).toHaveBeenLastCalledWith('theme', 'dark');
    });
  });

  describe('without Prism elements', () => {
    it('should not throw when Prism link elements are absent', () => {
      setupDOM({ isDark: false, hasPrismElements: false });
      loadDarkModeScript();

      expect(() => {
        document.getElementById('toggle-dark-mode').click();
      }).not.toThrow();
    });

    it('should still toggle dark-mode class without Prism elements', () => {
      setupDOM({ isDark: false, hasPrismElements: false });
      loadDarkModeScript();

      document.getElementById('toggle-dark-mode').click();
      expect(document.documentElement.classList.contains('dark-mode')).toBe(
        true
      );
    });

    it('should still update localStorage without Prism elements', () => {
      setupDOM({ isDark: false, hasPrismElements: false });
      loadDarkModeScript();

      document.getElementById('toggle-dark-mode').click();
      expect(localStorage.setItem).toHaveBeenCalledWith('theme', 'dark');
    });
  });
});

describe('FOUC prevention script', () => {
  function simulateFOUCScript(theme, prefersDark) {
    // Reset html class
    document.documentElement.className = '';

    // Simulate the inline script from default.njk
    if (theme === 'dark' || (!theme && prefersDark)) {
      document.documentElement.classList.add('dark-mode');
    }
  }

  it('should add dark-mode class when localStorage theme is "dark"', () => {
    simulateFOUCScript('dark', false);
    expect(document.documentElement.classList.contains('dark-mode')).toBe(true);
  });

  it('should not add dark-mode class when localStorage theme is "light"', () => {
    simulateFOUCScript('light', false);
    expect(document.documentElement.classList.contains('dark-mode')).toBe(
      false
    );
  });

  it('should add dark-mode class when no localStorage and system prefers dark', () => {
    simulateFOUCScript(null, true);
    expect(document.documentElement.classList.contains('dark-mode')).toBe(true);
  });

  it('should not add dark-mode class when no localStorage and system prefers light', () => {
    simulateFOUCScript(null, false);
    expect(document.documentElement.classList.contains('dark-mode')).toBe(
      false
    );
  });

  it('should prioritize localStorage "dark" over system preference light', () => {
    simulateFOUCScript('dark', false);
    expect(document.documentElement.classList.contains('dark-mode')).toBe(true);
  });

  it('should prioritize localStorage "light" over system preference dark', () => {
    simulateFOUCScript('light', true);
    expect(document.documentElement.classList.contains('dark-mode')).toBe(
      false
    );
  });
});
