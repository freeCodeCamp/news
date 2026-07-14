// src/_includes/assets/js/context-reader/utils.ts

/**
 * Extracts the sentence that contains the character at wordIndex.
 * Sentence boundaries are . ! ?
 */
export function extractSentence(text: string, wordIndex: number): string {
  const sentenceEndChars = ['.', '!', '?'];

  // Search backward for the start of the sentence
  let start = 0;
  for (let i = wordIndex - 1; i >= 0; i--) {
    if (sentenceEndChars.includes(text[i])) {
      start = i + 1;
      break;
    }
  }

  // Search forward for the end of the sentence
  let end = text.length;
  for (let i = wordIndex; i < text.length; i++) {
    if (sentenceEndChars.includes(text[i])) {
      end = i + 1;
      break;
    }
  }

  return text.slice(start, end).trim();
}

/**
 * Detects the language of the page.
 * Checks html lang attribute first, then meta tags (og:locale, content-language).
 * Defaults to "en".
 */
export function detectLanguage(element: HTMLElement | Document): 'en' | 'es' {
  // Check if the element itself is an html element with a lang attribute
  if (element instanceof HTMLElement) {
    const lang = element.getAttribute('lang');
    if (lang) {
      if (lang.startsWith('es')) return 'es';
      if (lang.startsWith('en')) return 'en';
    }
  }

  // Get the root document to search meta tags
  const doc =
    element instanceof Document ? element : (element.ownerDocument ?? document);

  if (doc) {
    // Check html lang attribute via document
    const htmlEl = doc.documentElement;
    if (htmlEl) {
      const htmlLang = htmlEl.getAttribute('lang');
      if (htmlLang) {
        if (htmlLang.startsWith('es')) return 'es';
        if (htmlLang.startsWith('en')) return 'en';
      }
    }

    // Check og:locale meta tag
    const ogLocaleMeta = doc.querySelector('meta[property="og:locale"]');
    if (ogLocaleMeta) {
      const content = ogLocaleMeta.getAttribute('content') ?? '';
      if (content.startsWith('es')) return 'es';
      if (content.startsWith('en')) return 'en';
    }

    // Check content-language meta tag
    const contentLangMeta = doc.querySelector(
      'meta[http-equiv="content-language"]'
    );
    if (contentLangMeta) {
      const content = contentLangMeta.getAttribute('content') ?? '';
      if (content.startsWith('es')) return 'es';
      if (content.startsWith('en')) return 'en';
    }
  }

  return 'en';
}

/**
 * Returns a substring of the element's text content around the middle,
 * with the given radius of characters on each side.
 */
export function getContextWindow(element: HTMLElement, radius: number): string {
  const text = element.textContent ?? '';
  if (text.length === 0) return '';

  const mid = Math.floor(text.length / 2);
  const start = Math.max(0, mid - radius);
  const end = Math.min(text.length, mid + radius);

  return text.slice(start, end);
}

/**
 * Returns the currently selected word and its bounding rectangle.
 * Returns null if nothing is selected.
 */
export function getSelectedWord(): { word: string; rect: DOMRect } | null {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return null;

  const word = selection.toString().trim();
  if (!word) return null;

  const range = selection.getRangeAt(0);
  const rect = range.getBoundingClientRect();

  return { word, rect };
}

/**
 * Generates a unique ID for a word based on its text and the current timestamp.
 * Format: `${word.toLowerCase()}-${Date.now()}`
 */
export function generateWordId(word: string, _savedAt: string): string {
  return `${word.toLowerCase()}-${Date.now()}`;
}
