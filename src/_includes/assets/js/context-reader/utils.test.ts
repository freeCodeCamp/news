/**
 * @jest-environment jsdom
 */

import { describe, test, expect } from '@jest/globals';
import { extractSentence, detectLanguage, getContextWindow } from './utils.js';

describe('extractSentence', () => {
  test('extracts a single sentence containing the word', () => {
    const text = 'Hello world. This is a test. Another sentence here.';
    const wordIndex = text.indexOf('test');
    const result = extractSentence(text, wordIndex);
    expect(result).toBe('This is a test.');
  });

  test('handles word at the beginning of text', () => {
    const text = 'Hello world. Another sentence.';
    const wordIndex = 0;
    const result = extractSentence(text, wordIndex);
    expect(result).toBe('Hello world.');
  });

  test('handles word at the end of text', () => {
    const text = 'First sentence. Last';
    const wordIndex = text.indexOf('Last');
    const result = extractSentence(text, wordIndex);
    expect(result).toBe('Last');
  });
});

describe('detectLanguage', () => {
  test('detects English from meta tag', () => {
    const meta = document.createElement('meta');
    meta.setAttribute('property', 'og:locale');
    meta.setAttribute('content', 'en_US');
    document.head.appendChild(meta);

    const result = detectLanguage(document);
    expect(result).toBe('en');

    document.head.removeChild(meta);
  });

  test('detects Spanish from html lang attribute', () => {
    const html = document.createElement('html');
    html.setAttribute('lang', 'es');

    const result = detectLanguage(html);
    expect(result).toBe('es');
  });

  test('defaults to English when language cannot be determined', () => {
    const div = document.createElement('div');
    const result = detectLanguage(div);
    expect(result).toBe('en');
  });
});

describe('getContextWindow', () => {
  test('returns text content around selected element', () => {
    const p = document.createElement('p');
    p.textContent =
      'This is a paragraph with some interesting content for testing purposes.';
    document.body.appendChild(p);

    const result = getContextWindow(p, 25);
    expect(result.length).toBeGreaterThan(0);
    expect(
      p.textContent?.includes(
        result.replace(/^\.\.\./, '').replace(/\.\.\.$/, '')
      )
    ).toBe(true);

    document.body.removeChild(p);
  });
});
