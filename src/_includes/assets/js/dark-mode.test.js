/**
 * @jest-environment jsdom
 */

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  jest
} from '@jest/globals';

const __dirname = dirname(fileURLToPath(import.meta.url));
const scriptSource = readFileSync(resolve(__dirname, 'dark-mode.js'), 'utf8');

// dark-mode.js wraps everything in document.addEventListener('DOMContentLoaded', () => { ... }).
// Tests run the inner body directly so they exercise the real production code.
const bodyMatch = scriptSource.match(
  /document\.addEventListener\('DOMContentLoaded',\s*\(\)\s*=>\s*\{([\s\S]*)\}\);\s*$/
);
if (!bodyMatch) {
  throw new Error(
    'Could not extract DOMContentLoaded body from dark-mode.js — has the wrapper shape changed?'
  );
}
const runInit = new Function(bodyMatch[1]);

function setupDOM({
  isDark = false,
  hasPrismElements = true,
  hasToggleButton = true,
  initialIconClass = isDark ? 'fa-square-check' : 'fa-square'
} = {}) {
  document.documentElement.className = isDark ? 'dark-mode' : '';
  document.body.innerHTML = `
    ${
      hasToggleButton
        ? `<button id="toggle-dark-mode" aria-pressed="false"><i class="${initialIconClass}"></i></button>`
        : ''
    }
    ${
      hasPrismElements
        ? `<link id="prism-theme-light" rel="stylesheet" />
           <link id="prism-theme-dark" rel="stylesheet" />`
        : ''
    }
  `;
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

let mqListeners;
let mqMatches;

function installMatchMediaMock({ matches = false } = {}) {
  mqMatches = matches;
  mqListeners = new Set();
  window.matchMedia = jest.fn().mockImplementation(query => ({
    media: query,
    get matches() {
      return mqMatches;
    },
    addEventListener: (event, cb) => {
      if (event === 'change') mqListeners.add(cb);
    },
    removeEventListener: (event, cb) => {
      if (event === 'change') mqListeners.delete(cb);
    },
    addListener: cb => mqListeners.add(cb),
    removeListener: cb => mqListeners.delete(cb)
  }));
}

function emitSystemPrefChange(matches) {
  mqMatches = matches;
  for (const cb of mqListeners) cb({ matches });
}

beforeEach(() => {
  localStorageMock.clear();
  jest.clearAllMocks();
  installMatchMediaMock({ matches: false });
});

afterEach(() => {
  document.documentElement.className = '';
  document.body.innerHTML = '';
});

describe('dark-mode.js initialization', () => {
  it('sets aria-pressed="false" when html lacks dark-mode class', () => {
    setupDOM({ isDark: false });
    runInit();
    expect(
      document.getElementById('toggle-dark-mode').getAttribute('aria-pressed')
    ).toBe('false');
  });

  it('sets aria-pressed="true" when html has dark-mode class', () => {
    setupDOM({ isDark: true });
    runInit();
    expect(
      document.getElementById('toggle-dark-mode').getAttribute('aria-pressed')
    ).toBe('true');
  });

  it('reconciles a stale fa-square-check icon to fa-square in light mode', () => {
    // Simulates SSR template that always renders fa-square-check while user is in light mode.
    setupDOM({ isDark: false, initialIconClass: 'fa-square-check' });
    runInit();
    const icon = document.querySelector('#toggle-dark-mode i');
    expect(icon.classList.contains('fa-square')).toBe(true);
    expect(icon.classList.contains('fa-square-check')).toBe(false);
  });

  it('reconciles a stale fa-square icon to fa-square-check in dark mode', () => {
    setupDOM({ isDark: true, initialIconClass: 'fa-square' });
    runInit();
    const icon = document.querySelector('#toggle-dark-mode i');
    expect(icon.classList.contains('fa-square-check')).toBe(true);
    expect(icon.classList.contains('fa-square')).toBe(false);
  });

  it('reconciles Prism stylesheet disabled flags on init for dark mode', () => {
    setupDOM({ isDark: true });
    runInit();
    expect(document.getElementById('prism-theme-light').disabled).toBe(true);
    expect(document.getElementById('prism-theme-dark').disabled).toBe(false);
  });

  it('reconciles Prism stylesheet disabled flags on init for light mode', () => {
    setupDOM({ isDark: false });
    runInit();
    expect(document.getElementById('prism-theme-light').disabled).toBe(false);
    expect(document.getElementById('prism-theme-dark').disabled).toBe(true);
  });

  it('returns early without throwing when toggle button is missing', () => {
    setupDOM({ hasToggleButton: false });
    expect(() => runInit()).not.toThrow();
  });
});

describe('dark-mode.js toggle click — light to dark', () => {
  beforeEach(() => {
    setupDOM({ isDark: false });
    runInit();
    document.getElementById('toggle-dark-mode').click();
  });

  it('adds dark-mode class to documentElement', () => {
    expect(document.documentElement.classList.contains('dark-mode')).toBe(true);
  });

  it('persists "dark" in localStorage', () => {
    expect(localStorage.setItem).toHaveBeenCalledWith('theme', 'dark');
  });

  it('updates aria-pressed to "true"', () => {
    expect(
      document.getElementById('toggle-dark-mode').getAttribute('aria-pressed')
    ).toBe('true');
  });

  it('disables the light Prism stylesheet', () => {
    expect(document.getElementById('prism-theme-light').disabled).toBe(true);
  });

  it('enables the dark Prism stylesheet', () => {
    expect(document.getElementById('prism-theme-dark').disabled).toBe(false);
  });

  it('shows fa-square-check icon', () => {
    const icon = document.querySelector('#toggle-dark-mode i');
    expect(icon.classList.contains('fa-square-check')).toBe(true);
    expect(icon.classList.contains('fa-square')).toBe(false);
  });
});

describe('dark-mode.js toggle click — dark to light', () => {
  beforeEach(() => {
    setupDOM({ isDark: true });
    runInit();
    document.getElementById('toggle-dark-mode').click();
  });

  it('removes dark-mode class from documentElement', () => {
    expect(document.documentElement.classList.contains('dark-mode')).toBe(
      false
    );
  });

  it('persists "light" in localStorage', () => {
    expect(localStorage.setItem).toHaveBeenCalledWith('theme', 'light');
  });

  it('updates aria-pressed to "false"', () => {
    expect(
      document.getElementById('toggle-dark-mode').getAttribute('aria-pressed')
    ).toBe('false');
  });

  it('enables the light Prism stylesheet', () => {
    expect(document.getElementById('prism-theme-light').disabled).toBe(false);
  });

  it('disables the dark Prism stylesheet', () => {
    expect(document.getElementById('prism-theme-dark').disabled).toBe(true);
  });

  it('shows fa-square icon', () => {
    const icon = document.querySelector('#toggle-dark-mode i');
    expect(icon.classList.contains('fa-square')).toBe(true);
    expect(icon.classList.contains('fa-square-check')).toBe(false);
  });
});

describe('dark-mode.js round-trip toggle', () => {
  it('returns to light state after two clicks starting from light', () => {
    setupDOM({ isDark: false });
    runInit();
    const button = document.getElementById('toggle-dark-mode');
    button.click();
    button.click();
    expect(document.documentElement.classList.contains('dark-mode')).toBe(
      false
    );
    expect(button.getAttribute('aria-pressed')).toBe('false');
    expect(localStorage.setItem).toHaveBeenLastCalledWith('theme', 'light');
  });

  it('returns to dark state after two clicks starting from dark', () => {
    setupDOM({ isDark: true });
    runInit();
    const button = document.getElementById('toggle-dark-mode');
    button.click();
    button.click();
    expect(document.documentElement.classList.contains('dark-mode')).toBe(true);
    expect(button.getAttribute('aria-pressed')).toBe('true');
    expect(localStorage.setItem).toHaveBeenLastCalledWith('theme', 'dark');
  });
});

describe('dark-mode.js without Prism elements', () => {
  it('does not throw when prism link elements are absent', () => {
    setupDOM({ isDark: false, hasPrismElements: false });
    runInit();
    expect(() =>
      document.getElementById('toggle-dark-mode').click()
    ).not.toThrow();
  });

  it('still toggles dark-mode without prism elements', () => {
    setupDOM({ isDark: false, hasPrismElements: false });
    runInit();
    document.getElementById('toggle-dark-mode').click();
    expect(document.documentElement.classList.contains('dark-mode')).toBe(true);
  });
});

describe('dark-mode.js OS preference change', () => {
  it('flips to dark when OS pref becomes dark and no user choice is persisted', () => {
    setupDOM({ isDark: false });
    runInit();
    emitSystemPrefChange(true);
    expect(document.documentElement.classList.contains('dark-mode')).toBe(true);
    expect(
      document.getElementById('toggle-dark-mode').getAttribute('aria-pressed')
    ).toBe('true');
  });

  it('flips back to light when OS pref becomes light and no user choice is persisted', () => {
    setupDOM({ isDark: true });
    runInit();
    emitSystemPrefChange(false);
    expect(document.documentElement.classList.contains('dark-mode')).toBe(
      false
    );
  });

  it('does not persist the OS-driven change to localStorage', () => {
    setupDOM({ isDark: false });
    runInit();
    emitSystemPrefChange(true);
    expect(localStorage.setItem).not.toHaveBeenCalled();
  });

  it('ignores OS pref changes once the user has clicked the toggle', () => {
    setupDOM({ isDark: false });
    runInit();
    document.getElementById('toggle-dark-mode').click(); // persists 'theme=dark'
    const stateBefore =
      document.documentElement.classList.contains('dark-mode');
    emitSystemPrefChange(false);
    expect(document.documentElement.classList.contains('dark-mode')).toBe(
      stateBefore
    );
  });
});

describe('FOUC prevention script (mirrored from default.njk)', () => {
  function simulateFOUCScript(theme, prefersDark) {
    document.documentElement.className = '';
    if (theme === 'dark' || (!theme && prefersDark)) {
      document.documentElement.classList.add('dark-mode');
    }
  }

  it('adds dark-mode class when localStorage theme is "dark"', () => {
    simulateFOUCScript('dark', false);
    expect(document.documentElement.classList.contains('dark-mode')).toBe(true);
  });

  it('does not add dark-mode class when localStorage theme is "light"', () => {
    simulateFOUCScript('light', true);
    expect(document.documentElement.classList.contains('dark-mode')).toBe(
      false
    );
  });

  it('falls back to system preference when no localStorage theme is set', () => {
    simulateFOUCScript(null, true);
    expect(document.documentElement.classList.contains('dark-mode')).toBe(true);
    simulateFOUCScript(null, false);
    expect(document.documentElement.classList.contains('dark-mode')).toBe(
      false
    );
  });
});
