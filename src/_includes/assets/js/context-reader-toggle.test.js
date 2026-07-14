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
  });
});
