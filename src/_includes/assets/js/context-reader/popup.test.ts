/**
 * @jest-environment jsdom
 */

import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import { PopupComponent } from './popup.js';
import type { LookupResult } from './types.js';

describe('PopupComponent', () => {
  let popup: PopupComponent;

  beforeEach(() => {
    popup = new PopupComponent();
  });

  afterEach(() => {
    popup.hide();
  });

  test('creates shadow DOM popup on initialization', () => {
    const shadowRoot = popup.getShadowRoot();
    expect(shadowRoot).not.toBeNull();
  });

  test('shows popup at specified position', () => {
    popup.show('hello', { x: 100, y: 200 });
    expect(popup.isVisible()).toBe(true);
  });

  test('hides popup and removes from DOM', () => {
    popup.show('hello', { x: 100, y: 200 });
    popup.hide();
    expect(popup.isVisible()).toBe(false);
  });

  test('updates popup with lookup result', () => {
    const result: LookupResult = {
      word: 'hello',
      translation: 'hola',
      pronunciation: '/həˈloʊ/',
      meanings: [],
      sourceLanguage: 'en',
      targetLanguage: 'es'
    };
    popup.show('hello', { x: 100, y: 200 });
    popup.updateResult(result);
    const shadowRoot = popup.getShadowRoot();
    const content = shadowRoot.innerHTML;
    expect(content).toContain('hola');
    expect(content).toContain('hello');
  });

  test('has accessible save button', () => {
    popup.show('hello', { x: 100, y: 200 });
    const saveButton = popup.getSaveButton();
    expect(saveButton).not.toBeNull();
    expect(saveButton?.getAttribute('aria-label')).toBeTruthy();
  });

  test('closes on escape key press', () => {
    popup.show('hello', { x: 100, y: 200 });
    expect(popup.isVisible()).toBe(true);
    const event = new KeyboardEvent('keydown', { key: 'Escape' });
    document.dispatchEvent(event);
    expect(popup.isVisible()).toBe(false);
  });
});
