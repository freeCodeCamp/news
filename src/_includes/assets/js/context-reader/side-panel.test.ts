/**
 * @jest-environment jsdom
 */

import { IDBFactory } from 'fake-indexeddb';
import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import { StorageManager } from './storage.js';
import { SidePanelComponent } from './side-panel.js';
import type { SavedWord } from './types.js';

// Polyfill structuredClone for jsdom environments that don't include it
if (typeof globalThis.structuredClone === 'undefined') {
  (globalThis as Record<string, unknown>).structuredClone = <T>(val: T): T =>
    JSON.parse(JSON.stringify(val)) as T;
}

describe('SidePanelComponent', () => {
  let storage: StorageManager;
  let panel: SidePanelComponent;

  beforeEach(async () => {
    (globalThis as Record<string, unknown>).indexedDB = new IDBFactory();
    storage = new StorageManager();
    await storage.init();
    panel = new SidePanelComponent(storage);
  });

  afterEach(() => {
    panel.hide();
  });

  test('creates panel with shadow DOM', () => {
    const shadowRoot = panel.getShadowRoot();
    expect(shadowRoot).not.toBeNull();
  });

  test('shows and hides panel', () => {
    panel.show();
    expect(panel.isVisible()).toBe(true);
    panel.hide();
    expect(panel.isVisible()).toBe(false);
  });

  test('toggles panel visibility', () => {
    panel.toggle();
    expect(panel.isVisible()).toBe(true);
    panel.toggle();
    expect(panel.isVisible()).toBe(false);
  });

  test('displays saved words', async () => {
    const word: SavedWord = {
      id: 'test-id-1',
      word: 'hello',
      translation: 'hola',
      sourceLanguage: 'en',
      targetLanguage: 'es',
      contextSentence: 'Hello world',
      articleUrl: 'https://example.com/article',
      articleTitle: 'Test Article',
      savedAt: new Date().toISOString()
    };
    await storage.saveWord(word);
    panel.show();
    await panel.refresh();
    const shadowRoot = panel.getShadowRoot();
    const content = shadowRoot.innerHTML;
    expect(content).toContain('hello');
    expect(content).toContain('hola');
  });

  test('has export button', () => {
    panel.show();
    const exportButton = panel.getExportButton();
    expect(exportButton).toBeTruthy();
  });
});
