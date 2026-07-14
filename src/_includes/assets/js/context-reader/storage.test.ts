/**
 * @jest-environment jsdom
 */

import { IDBFactory } from 'fake-indexeddb';
import { describe, test, expect, beforeEach } from '@jest/globals';
import { StorageManager } from './storage.js';
import type { SavedWord } from './types.js';

// Polyfill structuredClone for jsdom environments that don't include it
if (typeof globalThis.structuredClone === 'undefined') {
  (globalThis as Record<string, unknown>).structuredClone = <T>(val: T): T =>
    JSON.parse(JSON.stringify(val)) as T;
}

describe('StorageManager', () => {
  let manager: StorageManager;

  beforeEach(() => {
    // Use a fresh IDBFactory for each test to ensure complete isolation
    (globalThis as Record<string, unknown>).indexedDB = new IDBFactory();
    manager = new StorageManager();
  });

  test('initializes database', async () => {
    await manager.init();
    expect(manager.isInitialized()).toBe(true);
  });

  test('saves a word to database', async () => {
    await manager.init();
    const word: SavedWord = {
      id: 'test-id-1',
      word: 'bonjour',
      translation: 'hello',
      sourceLanguage: 'en',
      targetLanguage: 'es',
      contextSentence: 'Bonjour le monde',
      articleUrl: 'https://example.com/article',
      articleTitle: 'Test Article',
      savedAt: new Date().toISOString()
    };
    await manager.saveWord(word);
    const words = await manager.getWords();
    expect(words.length).toBe(1);
    expect(words[0].id).toBe('test-id-1');
    expect(words[0].word).toBe('bonjour');
  });

  test('deletes a word from database', async () => {
    await manager.init();
    const word: SavedWord = {
      id: 'test-id-2',
      word: 'mundo',
      translation: 'world',
      sourceLanguage: 'es',
      targetLanguage: 'en',
      contextSentence: 'Hola mundo',
      articleUrl: 'https://example.com/article2',
      articleTitle: 'Test Article 2',
      savedAt: new Date().toISOString()
    };
    await manager.saveWord(word);
    await manager.deleteWord('test-id-2');
    const words = await manager.getWords();
    expect(words.length).toBe(0);
  });

  test('exports words as CSV', async () => {
    await manager.init();
    const word: SavedWord = {
      id: 'test-id-3',
      word: 'casa',
      translation: 'house',
      sourceLanguage: 'es',
      targetLanguage: 'en',
      contextSentence: 'Mi casa es su casa',
      articleUrl: 'https://example.com/article3',
      articleTitle: 'Test Article 3',
      savedAt: '2024-01-15T10:00:00.000Z'
    };
    await manager.saveWord(word);
    const csv = await manager.exportAsCSV();
    expect(csv).toContain('casa');
    expect(csv).toContain('house');
    expect(csv).toContain('Mi casa es su casa');
  });
});
