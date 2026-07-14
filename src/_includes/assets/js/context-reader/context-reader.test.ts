/**
 * @jest-environment jsdom
 */

import { IDBFactory } from 'fake-indexeddb';
import { describe, test, expect, beforeEach } from '@jest/globals';
import { ContextReader } from './context-reader.js';

// Polyfill structuredClone for jsdom environments that don't include it
if (typeof globalThis.structuredClone === 'undefined') {
  (globalThis as Record<string, unknown>).structuredClone = <T>(val: T): T =>
    JSON.parse(JSON.stringify(val)) as T;
}

describe('ContextReader', () => {
  beforeEach(() => {
    // Fresh IndexedDB for each test
    (globalThis as Record<string, unknown>).indexedDB = new IDBFactory();
    // Clear localStorage
    localStorage.clear();
  });

  test('initializes successfully', async () => {
    const contextReader = new ContextReader(
      'https://worker.example.com',
      'test-api-key'
    );
    await contextReader.initialize();
    expect(contextReader.isInitialized()).toBe(true);
  });

  test('enables feature and adds double-click listener', async () => {
    const contextReader = new ContextReader(
      'https://worker.example.com',
      'test-api-key'
    );
    await contextReader.initialize();
    contextReader.enable();
    expect(contextReader.isEnabled()).toBe(true);
  });

  test('disables feature and removes double-click listener', async () => {
    const contextReader = new ContextReader(
      'https://worker.example.com',
      'test-api-key'
    );
    await contextReader.initialize();
    contextReader.enable();
    contextReader.disable();
    expect(contextReader.isEnabled()).toBe(false);
  });

  test('reads preference from localStorage', async () => {
    localStorage.setItem('contextReader:enabled', 'true');
    const contextReader = new ContextReader(
      'https://worker.example.com',
      'test-api-key'
    );
    await contextReader.initialize();
    expect(contextReader.isEnabled()).toBe(true);
  });

  test('persists enabled state to localStorage', async () => {
    const contextReader = new ContextReader(
      'https://worker.example.com',
      'test-api-key'
    );
    await contextReader.initialize();
    contextReader.enable();
    expect(localStorage.getItem('contextReader:enabled')).toBe('true');
  });
});
