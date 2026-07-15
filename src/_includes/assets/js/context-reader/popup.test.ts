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

  test('shows popup in the bottom-right article corner', () => {
    popup.show('hello', { x: 100, y: 200 });
    expect(popup.isVisible()).toBe(true);
    const popupElement = popup
      .getShadowRoot()
      .querySelector('.popup') as HTMLElement;
    expect(popupElement.style.right).toBe('32px');
    expect(popupElement.style.bottom).toBe('32px');
    expect(popupElement.style.left).toBe('');
    expect(popupElement.style.top).toBe('');
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

  test('renders pronunciation, part of speech, numbered definitions, and example', () => {
    const result: LookupResult = {
      word: 'number',
      translation: 'número',
      pronunciation: "/'nʌmbə/",
      meanings: [
        {
          word: 'number',
          meanings: [
            {
              partOfSpeech: 'noun',
              definitions: [
                {
                  definition: 'A quantity or amount.',
                  example: 'Zero, one, and two are numbers.'
                },
                {
                  definition: 'An abstract entity used to describe quantity.'
                }
              ]
            }
          ]
        }
      ],
      sourceLanguage: 'en',
      targetLanguage: 'es'
    };

    popup.show('number', { x: 100, y: 200 });
    popup.updateResult(result);

    const content = popup.getShadowRoot().innerHTML;
    expect(content).toContain("/'nʌmbə/");
    expect(content).toContain('NOUN');
    expect(content).toContain('1.');
    expect(content).toContain('A quantity or amount.');
    expect(content).toContain('2.');
    expect(content).toContain('An abstract entity used to describe quantity.');
    expect(content).toContain('Zero, one, and two are numbers.');
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

  test('closes when clicking outside the popup', () => {
    popup.show('hello', { x: 100, y: 200 });
    expect(popup.isVisible()).toBe(true);

    document.body.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    expect(popup.isVisible()).toBe(false);
  });

  test('stays open when clicking inside the popup', () => {
    popup.show('hello', { x: 100, y: 200 });
    expect(popup.isVisible()).toBe(true);

    const popupElement = popup.getShadowRoot().querySelector('.popup');
    popupElement?.dispatchEvent(
      new MouseEvent('click', { bubbles: true, composed: true })
    );

    expect(popup.isVisible()).toBe(true);
  });
});
