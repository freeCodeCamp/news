/**
 * @jest-environment jsdom
 */

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';

const __dirname = dirname(fileURLToPath(import.meta.url));
const scriptSource = readFileSync(
  resolve(__dirname, 'context-reader-toggle.js'),
  'utf8'
);

const bodyMatch = scriptSource.match(
  /document\.addEventListener\('DOMContentLoaded',\s*\(\)\s*=>\s*\{([\s\S]*)\}\);\s*$/
);
if (!bodyMatch) {
  throw new Error(
    'Could not extract DOMContentLoaded body from context-reader-toggle.js'
  );
}
const runInit = new Function(bodyMatch[1]);

const localStorageMock = (() => {
  let store = {};
  return {
    getItem: jest.fn(key => store[key] ?? null),
    setItem: jest.fn((key, value) => {
      store[key] = String(value);
    }),
    clear: jest.fn(() => {
      store = {};
    })
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

function setupDOM() {
  document.body.innerHTML = `
    <button id="context-reader-toggle" aria-pressed="false">
      <span class="toggle-label">Context Reader</span>
      <span class="toggle-state" aria-live="polite">OFF</span>
    </button>
    <div id="context-reader-settings" hidden>
      <label for="context-reader-native-language">Native Language:</label>
      <select id="context-reader-native-language">
        <option value="es">Spanish</option>
        <option value="pt">Portuguese</option>
        <option value="it">Italian</option>
        <option value="fr">French</option>
      </select>
      <span>Learning Language:</span>
      <span id="context-reader-learning-language">English</span>
    </div>
  `;
}

beforeEach(() => {
  localStorageMock.clear();
  jest.clearAllMocks();
  document.body.innerHTML = '';
});

describe('context-reader-toggle.js', () => {
  it('turns the nav toggle on and persists the enabled preference', () => {
    setupDOM();
    runInit();

    document.getElementById('context-reader-toggle').click();

    expect(
      document
        .getElementById('context-reader-toggle')
        .getAttribute('aria-pressed')
    ).toBe('true');
    expect(document.querySelector('.toggle-state').textContent).toBe('ON');
    expect(document.getElementById('context-reader-settings').hidden).toBe(
      false
    );
    expect(localStorage.setItem).toHaveBeenCalledWith(
      'contextReader:enabled',
      'true'
    );
  });

  it('syncs the nav toggle from an existing enabled preference', () => {
    localStorageMock.setItem('contextReader:enabled', 'true');
    setupDOM();
    runInit();

    expect(
      document
        .getElementById('context-reader-toggle')
        .getAttribute('aria-pressed')
    ).toBe('true');
    expect(document.querySelector('.toggle-state').textContent).toBe('ON');
    expect(document.getElementById('context-reader-settings').hidden).toBe(
      false
    );
  });

  it('hides the settings when the nav toggle is off', () => {
    localStorageMock.setItem('contextReader:enabled', 'true');
    setupDOM();
    runInit();

    document.getElementById('context-reader-toggle').click();

    expect(document.getElementById('context-reader-settings').hidden).toBe(
      true
    );
  });

  it('persists native language changes', () => {
    setupDOM();
    runInit();
    const listener = jest.fn();
    document.addEventListener('context-reader:language-change', listener);

    const nativeLanguageSelect = document.getElementById(
      'context-reader-native-language'
    );
    nativeLanguageSelect.value = 'pt';
    nativeLanguageSelect.dispatchEvent(new Event('change'));

    expect(localStorage.setItem).toHaveBeenCalledWith(
      'contextReader:nativeLanguage',
      'pt'
    );
    expect(localStorage.setItem).toHaveBeenCalledWith(
      'contextReader:learningLanguage',
      'en'
    );
    expect(listener).toHaveBeenCalledWith(
      expect.objectContaining({
        detail: {
          nativeLanguage: 'pt',
          learningLanguage: 'en'
        }
      })
    );
  });

  it('offers the supported native languages and renders English as static learning language text', () => {
    setupDOM();
    runInit();

    const nativeLanguageOptions = [
      ...document.querySelectorAll('#context-reader-native-language option')
    ].map(option => option.value);

    expect(nativeLanguageOptions).toEqual(['es', 'pt', 'it', 'fr']);
    expect(
      document.querySelector('#context-reader-learning-language').tagName
    ).toBe('SPAN');
    expect(
      document.querySelector('#context-reader-learning-language').textContent
    ).toBe('English');
  });
});
