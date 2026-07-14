# Context Reader Feature Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement an opt-in reading companion feature that helps English/Spanish learners acquire vocabulary while reading freeCodeCamp News articles through double-click lookups and vocabulary management.

**Architecture:** The feature consists of three main layers:

1. **Frontend Module** - Detects double-clicks on article text, manages popup/side-panel UI via Shadow DOM, persists vocabulary to IndexedDB
2. **Backend Worker** - Cloudflare Worker that handles translation (DeepL) and dictionary lookup (Free Dictionary API) requests
3. **Navigation Integration** - Toggle switch in site header to enable/disable the feature (persisted to localStorage)

**Tech Stack:** TypeScript, Shadow DOM, IndexedDB, Eleventy (11ty), Cloudflare Workers, DeepL API, Free Dictionary API

## Global Constraints

- Language pair: English ↔ Spanish only (MVP)
- Feature disabled by default (zero impact on existing readers)
- Double-click interaction model for word selection
- Preference persisted to localStorage (not account-based)
- Popup lookup must complete in <500ms (cached)
- No impact to site performance when feature is OFF
- Follow freeCodeCamp "Command-line Chic" design system
- Use pnpm for package management
- TypeScript for all new modules
- Eleventy templates (Nunjucks) for navigation integration

---

## File Structure

```
src/
├─ _includes/
│  ├─ assets/
│  │  ├─ js/
│  │  │  └─ context-reader/           [NEW]
│  │  │     ├─ context-reader.ts      Main module & initialization
│  │  │     ├─ popup.ts               Shadow DOM popup component
│  │  │     ├─ side-panel.ts          Vocabulary review panel
│  │  │     ├─ storage.ts             IndexedDB wrapper
│  │  │     ├─ translator.ts          API client for DeepL + Dictionary
│  │  │     ├─ utils.ts               Sentence extraction, language detection
│  │  │     ├─ types.ts               TypeScript types & interfaces
│  │  │     └─ *.test.ts              Unit tests
│  │  └─ css/
│  │     └─ context-reader.css        [NEW] Component styling
│  └─ partials/
│     └─ site-nav.njk                 [MODIFY] Add toggle switch
│
├─ _includes/layouts/
│  └─ post.njk                        [MODIFY] Include context-reader.ts in post template
│
└─ _data/
   └─ site.js                         [MODIFY] Add context-reader config if needed

workers/                               [NEW DIRECTORY]
└─ src/
   ├─ translator.ts                   Cloudflare Worker entry point
   ├─ services/
   │  ├─ deepl-service.ts             DeepL API wrapper
   │  └─ dictionary-service.ts        Free Dictionary API wrapper
   └─ types.ts                        Worker types & interfaces
```

---

## Task Breakdown

### Task 1: Set up TypeScript types and interfaces

**Files:**

- Create: `src/_includes/assets/js/context-reader/types.ts`

**Interfaces:**

- Produces:
  - `SavedWord` interface
  - `PopupState` interface
  - `LookupResult` interface
  - `TranslationRequest`, `TranslationResponse` interfaces

- [ ] **Step 1: Create types.ts with all required interfaces**

```typescript
// src/_includes/assets/js/context-reader/types.ts

export interface SavedWord {
  id: string;
  word: string;
  translation: string;
  sourceLanguage: 'en' | 'es';
  targetLanguage: 'en' | 'es';
  contextSentence: string;
  articleUrl: string;
  articleTitle: string;
  savedAt: string;
}

export interface DictionaryEntry {
  word: string;
  phonetic?: string;
  meanings: Array<{
    partOfSpeech: string;
    definitions: Array<{
      definition: string;
      example?: string;
      synonyms?: string[];
    }>;
  }>;
}

export interface LookupResult {
  word: string;
  translation: string;
  pronunciation?: string;
  meanings: DictionaryEntry[];
  exampleSentence?: string;
  sourceLanguage: 'en' | 'es';
  targetLanguage: 'en' | 'es';
}

export interface TranslationRequest {
  text: string;
  sourceLang: 'en' | 'es';
  targetLang: 'en' | 'es';
  context?: string;
}

export interface TranslationResponse {
  translatedText: string;
  detectedSourceLanguage?: string;
}

export interface PopupState {
  visible: boolean;
  word: string;
  position: { x: number; y: number };
  result?: LookupResult;
  loading: boolean;
  error?: string;
}

export interface ContextReaderConfig {
  enabled: boolean;
  nativeLanguage: 'en' | 'es';
  learningLanguage: 'en' | 'es';
}
```

- [ ] **Step 2: Commit**

```bash
git add src/_includes/assets/js/context-reader/types.ts
git commit -m "feat: add TypeScript types for context-reader module"
```

---

### Task 2: Implement IndexedDB storage wrapper

**Files:**

- Create: `src/_includes/assets/js/context-reader/storage.ts`
- Create: `src/_includes/assets/js/context-reader/storage.test.ts`

**Interfaces:**

- Consumes: `SavedWord` from Task 1
- Produces: `StorageManager` class with methods:
  - `init(): Promise<void>`
  - `saveWord(word: SavedWord): Promise<void>`
  - `getWords(): Promise<SavedWord[]>`
  - `deleteWord(id: string): Promise<void>`
  - `exportAsCSV(): Promise<string>`

- [ ] **Step 1: Write integration test for storage manager**

```typescript
// src/_includes/assets/js/context-reader/storage.test.ts

import { StorageManager } from './storage';
import type { SavedWord } from './types';

describe('StorageManager', () => {
  let manager: StorageManager;
  let indexedDBFake: any;

  beforeEach(() => {
    manager = new StorageManager();
  });

  afterEach(async () => {
    // Clean up IndexedDB
    if (indexedDBFake) {
      indexedDBFake.clear();
    }
  });

  test('initializes database', async () => {
    await manager.init();
    expect(manager.isInitialized()).toBe(true);
  });

  test('saves a word to database', async () => {
    await manager.init();
    const word: SavedWord = {
      id: 'word-1',
      word: 'hello',
      translation: 'hola',
      sourceLanguage: 'en',
      targetLanguage: 'es',
      contextSentence: 'Hello world',
      articleUrl: 'https://example.com/article',
      articleTitle: 'Test Article',
      savedAt: new Date().toISOString()
    };

    await manager.saveWord(word);
    const words = await manager.getWords();
    expect(words).toHaveLength(1);
    expect(words[0].word).toBe('hello');
  });

  test('deletes a word from database', async () => {
    await manager.init();
    const word: SavedWord = {
      id: 'word-1',
      word: 'hello',
      translation: 'hola',
      sourceLanguage: 'en',
      targetLanguage: 'es',
      contextSentence: 'Hello world',
      articleUrl: 'https://example.com/article',
      articleTitle: 'Test Article',
      savedAt: new Date().toISOString()
    };

    await manager.saveWord(word);
    await manager.deleteWord('word-1');
    const words = await manager.getWords();
    expect(words).toHaveLength(0);
  });

  test('exports words as CSV', async () => {
    await manager.init();
    const word: SavedWord = {
      id: 'word-1',
      word: 'hello',
      translation: 'hola',
      sourceLanguage: 'en',
      targetLanguage: 'es',
      contextSentence: 'Hello world',
      articleUrl: 'https://example.com/article',
      articleTitle: 'Test Article',
      savedAt: '2026-07-13T10:00:00Z'
    };

    await manager.saveWord(word);
    const csv = await manager.exportAsCSV();
    expect(csv).toContain('word');
    expect(csv).toContain('hello');
    expect(csv).toContain('hola');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd /Users/mac/Documents/Documents-Pro/ContributionRepos/context-reader-learn/context-reader-news/reader-news
pnpm test -- storage.test.ts
```

Expected: FAIL with "StorageManager is not defined" or similar

- [ ] **Step 3: Implement StorageManager class**

```typescript
// src/_includes/assets/js/context-reader/storage.ts

import type { SavedWord } from './types';

const DB_NAME = 'ContextReader';
const STORE_NAME = 'vocabulary';
const DB_VERSION = 1;

export class StorageManager {
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        reject(new Error('Failed to open IndexedDB'));
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = event => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
          store.createIndex('word', 'word', { unique: false });
          store.createIndex('savedAt', 'savedAt', { unique: false });
        }
      };
    });
  }

  isInitialized(): boolean {
    return this.db !== null;
  }

  async saveWord(word: SavedWord): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(word);

      request.onerror = () => {
        reject(new Error('Failed to save word'));
      };

      request.onsuccess = () => {
        resolve();
      };
    });
  }

  async getWords(): Promise<SavedWord[]> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onerror = () => {
        reject(new Error('Failed to retrieve words'));
      };

      request.onsuccess = () => {
        const words = request.result as SavedWord[];
        // Sort by savedAt descending (newest first)
        words.sort(
          (a, b) =>
            new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime()
        );
        resolve(words);
      };
    });
  }

  async deleteWord(id: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(id);

      request.onerror = () => {
        reject(new Error('Failed to delete word'));
      };

      request.onsuccess = () => {
        resolve();
      };
    });
  }

  async exportAsCSV(): Promise<string> {
    const words = await this.getWords();

    if (words.length === 0) {
      return 'word,translation,sourceLanguage,targetLanguage,contextSentence,articleUrl,articleTitle,savedAt\n';
    }

    const headers = [
      'word',
      'translation',
      'sourceLanguage',
      'targetLanguage',
      'contextSentence',
      'articleUrl',
      'articleTitle',
      'savedAt'
    ];

    const rows = words.map(word => [
      this.escapeCSVField(word.word),
      this.escapeCSVField(word.translation),
      word.sourceLanguage,
      word.targetLanguage,
      this.escapeCSVField(word.contextSentence),
      this.escapeCSVField(word.articleUrl),
      this.escapeCSVField(word.articleTitle),
      word.savedAt
    ]);

    const csvContent =
      headers.join(',') + '\n' + rows.map(row => row.join(',')).join('\n');

    return csvContent;
  }

  private escapeCSVField(field: string): string {
    if (field.includes(',') || field.includes('"') || field.includes('\n')) {
      return `"${field.replace(/"/g, '""')}"`;
    }
    return field;
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
pnpm test -- storage.test.ts
```

Expected: PASS (all tests pass)

- [ ] **Step 5: Commit**

```bash
git add src/_includes/assets/js/context-reader/storage.ts src/_includes/assets/js/context-reader/storage.test.ts
git commit -m "feat: implement IndexedDB storage manager for vocabulary"
```

---

### Task 3: Implement utility functions (sentence extraction and language detection)

**Files:**

- Create: `src/_includes/assets/js/context-reader/utils.ts`
- Create: `src/_includes/assets/js/context-reader/utils.test.ts`

**Interfaces:**

- Consumes: none
- Produces:
  - `extractSentence(text: string, wordIndex: number): string`
  - `detectLanguage(html: HTMLElement): "en" | "es"`
  - `getContextWindow(element: HTMLElement, radius: number): string`

- [ ] **Step 1: Write tests for utility functions**

```typescript
// src/_includes/assets/js/context-reader/utils.test.ts

import { extractSentence, detectLanguage, getContextWindow } from './utils';

describe('extractSentence', () => {
  test('extracts a single sentence containing the word', () => {
    const text = 'Hello world. This is a test. Another sentence here.';
    const wordIndex = text.indexOf('test');
    const sentence = extractSentence(text, wordIndex);
    expect(sentence).toBe('This is a test.');
  });

  test('handles word at the beginning of text', () => {
    const text = 'Hello world. Another sentence.';
    const wordIndex = 0;
    const sentence = extractSentence(text, wordIndex);
    expect(sentence).toBe('Hello world.');
  });

  test('handles word at the end of text', () => {
    const text = 'First sentence. Last';
    const wordIndex = text.indexOf('Last');
    const sentence = extractSentence(text, wordIndex);
    expect(sentence).toBe('Last');
  });
});

describe('detectLanguage', () => {
  test('detects English from meta tag', () => {
    const doc = document.createElement('div');
    const meta = document.createElement('meta');
    meta.setAttribute('property', 'og:locale');
    meta.setAttribute('content', 'en_US');
    doc.appendChild(meta);

    const lang = detectLanguage(doc);
    expect(lang).toBe('en');
  });

  test('detects Spanish from html lang attribute', () => {
    const doc = document.createElement('html');
    doc.setAttribute('lang', 'es');

    const lang = detectLanguage(doc);
    expect(lang).toBe('es');
  });

  test('defaults to English when language cannot be determined', () => {
    const doc = document.createElement('div');
    const lang = detectLanguage(doc);
    expect(lang).toBe('en');
  });
});

describe('getContextWindow', () => {
  test('returns text content around selected element', () => {
    const container = document.createElement('p');
    container.textContent = 'The quick brown fox jumps over the lazy dog';
    document.body.appendChild(container);

    const context = getContextWindow(container, 50);
    expect(context).toContain('quick');
    expect(context).toContain('fox');

    document.body.removeChild(container);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
pnpm test -- utils.test.ts
```

Expected: FAIL with "extractSentence is not defined" or similar

- [ ] **Step 3: Implement utility functions**

```typescript
// src/_includes/assets/js/context-reader/utils.ts

/**
 * Extract the sentence containing the word at the given index in the text
 */
export function extractSentence(text: string, wordIndex: number): string {
  // Find sentence boundaries (., !, ?)
  const sentenceEndPattern = /[.!?]/g;
  let sentenceStart = 0;
  let sentenceEnd = text.length;

  // Find the start of the sentence
  for (let i = wordIndex; i >= 0; i--) {
    if (['.', '!', '?'].includes(text[i])) {
      sentenceStart = i + 1;
      // Skip whitespace after punctuation
      while (sentenceStart < text.length && /\s/.test(text[sentenceStart])) {
        sentenceStart++;
      }
      break;
    }
  }

  // Find the end of the sentence
  for (let i = wordIndex; i < text.length; i++) {
    if (['.', '!', '?'].includes(text[i])) {
      sentenceEnd = i + 1;
      break;
    }
  }

  return text.substring(sentenceStart, sentenceEnd).trim();
}

/**
 * Detect the language of the page (English or Spanish)
 * Checks meta tags, html lang attribute, and defaults to English
 */
export function detectLanguage(element: HTMLElement | Document): 'en' | 'es' {
  // Check html lang attribute
  const htmlElement = (element as Document).documentElement || element;
  const langAttr = htmlElement.getAttribute('lang');
  if (langAttr?.startsWith('es')) return 'es';
  if (langAttr?.startsWith('en')) return 'en';

  // Check meta tag og:locale or content-language
  const metaTags = document.querySelectorAll('meta');
  for (const meta of metaTags) {
    const property = meta.getAttribute('property') || meta.getAttribute('name');
    const content = meta.getAttribute('content') || '';

    if (property === 'og:locale' || property === 'content-language') {
      if (content.includes('es')) return 'es';
      if (content.includes('en')) return 'en';
    }
  }

  // Default to English
  return 'en';
}

/**
 * Get a window of context text around an element
 * Useful for understanding the broader context of a selected word
 */
export function getContextWindow(
  element: HTMLElement,
  radiusInChars: number = 100
): string {
  const text = element.textContent || '';
  const start = Math.max(0, text.length / 2 - radiusInChars);
  const end = Math.min(text.length, text.length / 2 + radiusInChars);
  return text.substring(start, end);
}

/**
 * Extract word and its position from a click or selection event
 */
export function getSelectedWord(): { word: string; rect: DOMRect } | null {
  const selection = window.getSelection();
  if (!selection || selection.toString().length === 0) {
    return null;
  }

  const word = selection.toString().trim();
  const range = selection.getRangeAt(0);
  const rect = range.getBoundingClientRect();

  return { word, rect };
}

/**
 * Create a unique ID for a saved word entry
 */
export function generateWordId(word: string, savedAt: string): string {
  return `${word.toLowerCase()}-${Date.now()}`;
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
pnpm test -- utils.test.ts
```

Expected: PASS (all tests pass)

- [ ] **Step 5: Commit**

```bash
git add src/_includes/assets/js/context-reader/utils.ts src/_includes/assets/js/context-reader/utils.test.ts
git commit -m "feat: implement utility functions for sentence extraction and language detection"
```

---

### Task 4: Implement Translator API client

**Files:**

- Create: `src/_includes/assets/js/context-reader/translator.ts`
- Create: `src/_includes/assets/js/context-reader/translator.test.ts`

**Interfaces:**

- Consumes:
  - `TranslationRequest`, `TranslationResponse`, `LookupResult` from Task 1
  - `detectLanguage` from Task 3
- Produces: `TranslatorService` class with methods:
  - `translate(request: TranslationRequest): Promise<TranslationResponse>`
  - `getDictionary(word: string, lang: "en" | "es"): Promise<DictionaryEntry[]>`
  - `lookup(word: string, contextSentence: string, sourceLang: "en" | "es", targetLang: "en" | "es"): Promise<LookupResult>`

- [ ] **Step 1: Write tests for translator service**

```typescript
// src/_includes/assets/js/context-reader/translator.test.ts

import { TranslatorService } from './translator';

describe('TranslatorService', () => {
  let service: TranslatorService;

  beforeEach(() => {
    service = new TranslatorService(
      'https://api.example.com/translate',
      'test-key'
    );
  });

  test('translates text via worker', async () => {
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        translatedText: 'hola',
        detectedSourceLanguage: 'en'
      })
    });

    const result = await service.translate({
      text: 'hello',
      sourceLang: 'en',
      targetLang: 'es'
    });

    expect(result.translatedText).toBe('hola');
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('https://api.example.com/translate'),
      expect.objectContaining({
        method: 'POST'
      })
    );
  });

  test('gets dictionary entry for a word', async () => {
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => [
        {
          word: 'hello',
          phonetic: '/həˈloʊ/',
          meanings: [
            {
              partOfSpeech: 'interjection',
              definitions: [{ definition: 'A polite expression of greeting' }]
            }
          ]
        }
      ]
    });

    const result = await service.getDictionary('hello', 'en');

    expect(result).toHaveLength(1);
    expect(result[0].word).toBe('hello');
    expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('hello'));
  });

  test('performs complete lookup with translation and dictionary', async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          translatedText: 'hola',
          detectedSourceLanguage: 'en'
        })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [
          {
            word: 'hello',
            phonetic: '/həˈloʊ/',
            meanings: [
              {
                partOfSpeech: 'interjection',
                definitions: [{ definition: 'A polite expression of greeting' }]
              }
            ]
          }
        ]
      });

    const result = await service.lookup(
      'hello',
      'Hello there, friend!',
      'en',
      'es'
    );

    expect(result.word).toBe('hello');
    expect(result.translation).toBe('hola');
    expect(result.sourceLanguage).toBe('en');
    expect(result.targetLanguage).toBe('es');
  });

  test('handles translation errors gracefully', async () => {
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: false,
      status: 500
    });

    await expect(
      service.translate({
        text: 'hello',
        sourceLang: 'en',
        targetLang: 'es'
      })
    ).rejects.toThrow();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
pnpm test -- translator.test.ts
```

Expected: FAIL with "TranslatorService is not defined"

- [ ] **Step 3: Implement TranslatorService**

```typescript
// src/_includes/assets/js/context-reader/translator.ts

import type {
  TranslationRequest,
  TranslationResponse,
  LookupResult,
  DictionaryEntry
} from './types';

export class TranslatorService {
  private workerUrl: string;
  private apiKey: string;
  private cache: Map<string, LookupResult> = new Map();

  constructor(workerUrl: string, apiKey: string) {
    this.workerUrl = workerUrl;
    this.apiKey = apiKey;
  }

  async translate(request: TranslationRequest): Promise<TranslationResponse> {
    try {
      const response = await fetch(this.workerUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          action: 'translate',
          ...request
        })
      });

      if (!response.ok) {
        throw new Error(`Translation request failed: ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      console.error('Translation error:', error);
      throw error;
    }
  }

  async getDictionary(
    word: string,
    lang: 'en' | 'es'
  ): Promise<DictionaryEntry[]> {
    try {
      // Use Free Dictionary API for English, or custom endpoint for Spanish
      const url =
        lang === 'en'
          ? `https://api.dictionaryapi.dev/api/v2/entries/english/${encodeURIComponent(word)}`
          : `${this.workerUrl}?action=dictionary&word=${encodeURIComponent(word)}&lang=${lang}`;

      const response = await fetch(url);

      if (!response.ok) {
        if (response.status === 404) {
          return [];
        }
        throw new Error(`Dictionary request failed: ${response.statusText}`);
      }

      const data = await response.json();
      return Array.isArray(data) ? data : [data];
    } catch (error) {
      console.error('Dictionary error:', error);
      return [];
    }
  }

  async lookup(
    word: string,
    contextSentence: string,
    sourceLang: 'en' | 'es',
    targetLang: 'en' | 'es'
  ): Promise<LookupResult> {
    // Check cache first
    const cacheKey = `${word}-${sourceLang}-${targetLang}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    try {
      // Get translation
      const translationResult = await this.translate({
        text: word,
        sourceLang,
        targetLang,
        context: contextSentence
      });

      // Get dictionary entry
      const meanings = await this.getDictionary(word, sourceLang);

      const result: LookupResult = {
        word,
        translation: translationResult.translatedText,
        sourceLanguage: sourceLang,
        targetLanguage: targetLang,
        meanings,
        exampleSentence: contextSentence,
        pronunciation: meanings[0]?.phonetic
      };

      // Cache the result
      this.cache.set(cacheKey, result);

      // Clear cache after 1 hour to prevent stale data
      setTimeout(() => this.cache.delete(cacheKey), 60 * 60 * 1000);

      return result;
    } catch (error) {
      console.error('Lookup error:', error);
      throw error;
    }
  }

  clearCache(): void {
    this.cache.clear();
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
pnpm test -- translator.test.ts
```

Expected: PASS (all tests pass)

- [ ] **Step 5: Commit**

```bash
git add src/_includes/assets/js/context-reader/translator.ts src/_includes/assets/js/context-reader/translator.test.ts
git commit -m "feat: implement translator service for DeepL and Dictionary API integration"
```

---

### Task 5: Implement popup component (Shadow DOM)

**Files:**

- Create: `src/_includes/assets/js/context-reader/popup.ts`
- Create: `src/_includes/assets/js/context-reader/popup.test.ts`

**Interfaces:**

- Consumes:
  - `LookupResult`, `PopupState` from Task 1
  - `TranslatorService` from Task 4
- Produces: `PopupComponent` class with methods:
  - `show(word: string, position: { x: number; y: number }): Promise<void>`
  - `hide(): void`
  - `updateResult(result: LookupResult): void`
  - `getSaveButton(): HTMLElement | null`

- [ ] **Step 1: Write test for popup component**

```typescript
// src/_includes/assets/js/context-reader/popup.test.ts

import { PopupComponent } from './popup';
import type { LookupResult } from './types';

describe('PopupComponent', () => {
  let popup: PopupComponent;

  beforeEach(() => {
    popup = new PopupComponent();
    document.body.innerHTML = '';
  });

  afterEach(() => {
    popup.hide();
  });

  test('creates shadow DOM popup on initialization', () => {
    expect(popup.getShadowRoot()).toBeTruthy();
  });

  test('shows popup at specified position', async () => {
    popup.show('hello', { x: 100, y: 200 });
    expect(popup.isVisible()).toBe(true);
  });

  test('hides popup and removes from DOM', () => {
    popup.show('hello', { x: 100, y: 200 });
    popup.hide();
    expect(popup.isVisible()).toBe(false);
  });

  test('updates popup with lookup result', async () => {
    const result: LookupResult = {
      word: 'hello',
      translation: 'hola',
      sourceLanguage: 'en',
      targetLanguage: 'es',
      meanings: [
        {
          word: 'hello',
          meanings: [
            {
              partOfSpeech: 'interjection',
              definitions: [{ definition: 'A polite expression of greeting' }]
            }
          ]
        }
      ],
      exampleSentence: 'Hello world'
    };

    popup.show('hello', { x: 100, y: 200 });
    popup.updateResult(result);

    const shadowContent = popup.getShadowRoot().textContent || '';
    expect(shadowContent).toContain('hola');
    expect(shadowContent).toContain('hello');
  });

  test('has accessible save button', () => {
    popup.show('hello', { x: 100, y: 200 });
    const saveButton = popup.getSaveButton();
    expect(saveButton).toBeTruthy();
    expect(saveButton?.getAttribute('aria-label')).toBeTruthy();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
pnpm test -- popup.test.ts
```

Expected: FAIL with "PopupComponent is not defined"

- [ ] **Step 3: Implement PopupComponent**

```typescript
// src/_includes/assets/js/context-reader/popup.ts

import type { LookupResult } from './types';

export class PopupComponent {
  private container: HTMLElement | null = null;
  private shadowRoot: ShadowRoot | null = null;
  private visible: boolean = false;
  private currentResult: LookupResult | null = null;

  constructor() {
    this.createShadowDOM();
  }

  private createShadowDOM(): void {
    this.container = document.createElement('div');
    this.container.id = 'context-reader-popup';
    this.shadowRoot = this.container.attachShadow({ mode: 'open' });

    // Add base styles
    const style = document.createElement('style');
    style.textContent = this.getStyles();
    this.shadowRoot.appendChild(style);

    // Create popup container
    const popup = document.createElement('div');
    popup.className = 'popup';
    popup.setAttribute('role', 'dialog');
    popup.setAttribute('aria-label', 'Word definition popup');

    popup.innerHTML = `
      <div class="popup-content">
        <button class="close-btn" aria-label="Close popup">✕</button>
        <div class="loading">Loading...</div>
        <div class="result" style="display: none;"></div>
        <div class="error" style="display: none;"></div>
        <button class="save-btn" aria-label="Save this word">Save Word</button>
      </div>
    `;

    this.shadowRoot.appendChild(popup);

    // Attach event listeners
    const closeBtn = popup.querySelector('.close-btn') as HTMLButtonElement;
    closeBtn.addEventListener('click', () => this.hide());

    // Close on escape key
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && this.visible) {
        this.hide();
      }
    });
  }

  private getStyles(): string {
    return `
      :host {
        --primary-color: #0a66c2;
        --text-color: #1a1a1a;
        --bg-color: #ffffff;
        --border-color: #e0e0e0;
        --shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
      }

      .popup {
        position: fixed;
        background: var(--bg-color);
        border: 1px solid var(--border-color);
        border-radius: 8px;
        box-shadow: var(--shadow);
        z-index: 10000;
        max-width: 320px;
        padding: 16px;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      }

      .popup-content {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .close-btn {
        position: absolute;
        top: 8px;
        right: 8px;
        background: none;
        border: none;
        font-size: 18px;
        cursor: pointer;
        padding: 4px;
        color: var(--text-color);
      }

      .close-btn:hover {
        opacity: 0.7;
      }

      .loading {
        text-align: center;
        color: #999;
        font-size: 14px;
      }

      .result {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .word-entry {
        font-weight: 600;
        color: var(--primary-color);
        font-size: 16px;
      }

      .translation {
        font-size: 14px;
        color: var(--text-color);
      }

      .definition {
        font-size: 13px;
        color: #666;
        margin: 4px 0;
      }

      .error {
        color: #d32f2f;
        font-size: 14px;
      }

      .save-btn {
        background: var(--primary-color);
        color: white;
        border: none;
        border-radius: 4px;
        padding: 8px 16px;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        transition: background 0.2s;
      }

      .save-btn:hover {
        opacity: 0.9;
      }

      .save-btn:active {
        opacity: 0.8;
      }
    `;
  }

  show(word: string, position: { x: number; y: number }): void {
    if (!this.container) return;

    // Append to body if not already there
    if (!this.container.parentElement) {
      document.body.appendChild(this.container);
    }

    // Position the popup (with offset to avoid cursor)
    const offsetX = 10;
    const offsetY = 10;
    this.container.style.left = `${position.x + offsetX}px`;
    this.container.style.top = `${position.y + offsetY}px`;

    // Show loading state
    const popup = this.shadowRoot!.querySelector('.popup') as HTMLElement;
    (popup.querySelector('.loading') as HTMLElement).style.display = 'block';
    (popup.querySelector('.result') as HTMLElement).style.display = 'none';
    (popup.querySelector('.error') as HTMLElement).style.display = 'none';

    this.visible = true;
  }

  hide(): void {
    if (this.container && this.container.parentElement) {
      this.container.parentElement.removeChild(this.container);
    }
    this.visible = false;
  }

  updateResult(result: LookupResult): void {
    this.currentResult = result;

    const popup = this.shadowRoot!.querySelector('.popup') as HTMLElement;
    (popup.querySelector('.loading') as HTMLElement).style.display = 'none';

    const resultDiv = popup.querySelector('.result') as HTMLElement;
    resultDiv.innerHTML = `
      <div class="word-entry">${result.word}</div>
      <div class="translation">→ ${result.translation}</div>
      ${result.pronunciation ? `<div class="definition">${result.pronunciation}</div>` : ''}
      ${
        result.meanings && result.meanings.length > 0
          ? `<div class="definition">${result.meanings[0]?.meanings?.[0]?.definitions?.[0]?.definition || ''}</div>`
          : ''
      }
    `;
    resultDiv.style.display = 'block';
  }

  updateError(message: string): void {
    const popup = this.shadowRoot!.querySelector('.popup') as HTMLElement;
    (popup.querySelector('.loading') as HTMLElement).style.display = 'none';

    const errorDiv = popup.querySelector('.error') as HTMLElement;
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
  }

  getShadowRoot(): ShadowRoot {
    if (!this.shadowRoot) {
      throw new Error('Shadow DOM not initialized');
    }
    return this.shadowRoot;
  }

  getSaveButton(): HTMLElement | null {
    return this.shadowRoot?.querySelector('.save-btn') || null;
  }

  isVisible(): boolean {
    return this.visible;
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
pnpm test -- popup.test.ts
```

Expected: PASS (all tests pass)

- [ ] **Step 5: Commit**

```bash
git add src/_includes/assets/js/context-reader/popup.ts src/_includes/assets/js/context-reader/popup.test.ts
git commit -m "feat: implement popup component with Shadow DOM"
```

---

### Task 6: Implement side panel component (vocabulary review)

**Files:**

- Create: `src/_includes/assets/js/context-reader/side-panel.ts`
- Create: `src/_includes/assets/js/context-reader/side-panel.test.ts`

**Interfaces:**

- Consumes:
  - `SavedWord` from Task 1
  - `StorageManager` from Task 2
- Produces: `SidePanelComponent` class with methods:
  - `toggle(): void`
  - `show(): void`
  - `hide(): void`
  - `refresh(): Promise<void>`
  - `getExportButton(): HTMLElement | null`

- [ ] **Step 1: Write test for side panel component**

```typescript
// src/_includes/assets/js/context-reader/side-panel.test.ts

import { SidePanelComponent } from './side-panel';
import { StorageManager } from './storage';

describe('SidePanelComponent', () => {
  let panel: SidePanelComponent;
  let storage: StorageManager;

  beforeEach(async () => {
    storage = new StorageManager();
    await storage.init();
    panel = new SidePanelComponent(storage);
  });

  afterEach(() => {
    panel.hide();
  });

  test('creates panel with shadow DOM', () => {
    expect(panel.getShadowRoot()).toBeTruthy();
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
    await storage.saveWord({
      id: 'word-1',
      word: 'hello',
      translation: 'hola',
      sourceLanguage: 'en',
      targetLanguage: 'es',
      contextSentence: 'Hello world',
      articleUrl: 'https://example.com',
      articleTitle: 'Test Article',
      savedAt: new Date().toISOString()
    });

    panel.show();
    await panel.refresh();

    const shadowContent = panel.getShadowRoot().textContent || '';
    expect(shadowContent).toContain('hello');
    expect(shadowContent).toContain('hola');
  });

  test('has export button', () => {
    panel.show();
    const exportBtn = panel.getExportButton();
    expect(exportBtn).toBeTruthy();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
pnpm test -- side-panel.test.ts
```

Expected: FAIL with "SidePanelComponent is not defined"

- [ ] **Step 3: Implement SidePanelComponent**

```typescript
// src/_includes/assets/js/context-reader/side-panel.ts

import type { SavedWord } from './types';
import { StorageManager } from './storage';

export class SidePanelComponent {
  private container: HTMLElement | null = null;
  private shadowRoot: ShadowRoot | null = null;
  private visible: boolean = false;
  private storage: StorageManager;
  private words: SavedWord[] = [];

  constructor(storage: StorageManager) {
    this.storage = storage;
    this.createShadowDOM();
  }

  private createShadowDOM(): void {
    this.container = document.createElement('div');
    this.container.id = 'context-reader-side-panel';
    this.shadowRoot = this.container.attachShadow({ mode: 'open' });

    const style = document.createElement('style');
    style.textContent = this.getStyles();
    this.shadowRoot.appendChild(style);

    const panel = document.createElement('div');
    panel.className = 'panel';
    panel.setAttribute('role', 'complementary');
    panel.setAttribute('aria-label', 'Vocabulary review panel');

    panel.innerHTML = `
      <div class="panel-header">
        <h2>Vocabulary</h2>
        <button class="close-btn" aria-label="Close panel">✕</button>
      </div>
      <div class="panel-controls">
        <button class="export-btn" aria-label="Export vocabulary as CSV">Export CSV</button>
        <input type="search" class="search-input" placeholder="Search words..." aria-label="Search saved words">
      </div>
      <div class="words-list"></div>
      <div class="empty-state" style="display: none;">
        <p>No words saved yet. Double-click a word while reading to save it!</p>
      </div>
    `;

    this.shadowRoot.appendChild(panel);

    // Attach event listeners
    const closeBtn = panel.querySelector('.close-btn') as HTMLButtonElement;
    closeBtn.addEventListener('click', () => this.hide());

    const exportBtn = panel.querySelector('.export-btn') as HTMLButtonElement;
    exportBtn.addEventListener('click', () => this.handleExport());

    // Close on escape key
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && this.visible) {
        this.hide();
      }
    });
  }

  private getStyles(): string {
    return `
      :host {
        --primary-color: #0a66c2;
        --text-color: #1a1a1a;
        --bg-color: #ffffff;
        --border-color: #e0e0e0;
      }

      .panel {
        position: fixed;
        right: 0;
        top: 0;
        width: 350px;
        height: 100vh;
        background: var(--bg-color);
        border-left: 1px solid var(--border-color);
        box-shadow: -2px 0 8px rgba(0, 0, 0, 0.1);
        display: flex;
        flex-direction: column;
        z-index: 9999;
        overflow-y: auto;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      }

      .panel-header {
        padding: 16px;
        border-bottom: 1px solid var(--border-color);
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-shrink: 0;
      }

      .panel-header h2 {
        margin: 0;
        font-size: 18px;
        font-weight: 600;
      }

      .close-btn {
        background: none;
        border: none;
        font-size: 20px;
        cursor: pointer;
        padding: 4px;
        color: var(--text-color);
      }

      .close-btn:hover {
        opacity: 0.7;
      }

      .panel-controls {
        padding: 12px 16px;
        border-bottom: 1px solid var(--border-color);
        display: flex;
        gap: 8px;
        flex-direction: column;
        flex-shrink: 0;
      }

      .export-btn {
        background: var(--primary-color);
        color: white;
        border: none;
        border-radius: 4px;
        padding: 8px 12px;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        transition: opacity 0.2s;
      }

      .export-btn:hover {
        opacity: 0.9;
      }

      .search-input {
        padding: 8px 12px;
        border: 1px solid var(--border-color);
        border-radius: 4px;
        font-size: 14px;
      }

      .words-list {
        flex: 1;
        overflow-y: auto;
        padding: 8px;
      }

      .word-item {
        padding: 12px;
        margin: 4px 0;
        border: 1px solid var(--border-color);
        border-radius: 4px;
        background: #f9f9f9;
        cursor: pointer;
        transition: background 0.2s;
      }

      .word-item:hover {
        background: #f0f0f0;
      }

      .word-item-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 4px;
      }

      .word-item-word {
        font-weight: 600;
        color: var(--primary-color);
        font-size: 15px;
      }

      .word-item-translation {
        font-size: 13px;
        color: #666;
        margin-bottom: 4px;
      }

      .word-item-context {
        font-size: 12px;
        color: #999;
        font-style: italic;
        margin-bottom: 6px;
      }

      .word-item-footer {
        display: flex;
        justify-content: space-between;
        font-size: 11px;
        color: #999;
      }

      .delete-btn {
        background: none;
        border: none;
        color: #d32f2f;
        cursor: pointer;
        font-size: 16px;
        padding: 4px;
      }

      .delete-btn:hover {
        opacity: 0.7;
      }

      .empty-state {
        padding: 32px 16px;
        text-align: center;
        color: #999;
      }

      .empty-state p {
        margin: 0;
        font-size: 14px;
      }
    `;
  }

  async refresh(): Promise<void> {
    this.words = await this.storage.getWords();
    this.render();
  }

  private render(): void {
    const wordsList = this.shadowRoot!.querySelector(
      '.words-list'
    ) as HTMLElement;
    const emptyState = this.shadowRoot!.querySelector(
      '.empty-state'
    ) as HTMLElement;

    if (this.words.length === 0) {
      wordsList.innerHTML = '';
      emptyState.style.display = 'block';
      return;
    }

    emptyState.style.display = 'none';
    wordsList.innerHTML = this.words
      .map(
        word => `
      <div class="word-item" data-word-id="${word.id}">
        <div class="word-item-header">
          <span class="word-item-word">${this.escapeHtml(word.word)}</span>
          <button class="delete-btn" aria-label="Delete word" title="Delete">✕</button>
        </div>
        <div class="word-item-translation">${this.escapeHtml(word.translation)}</div>
        <div class="word-item-context">"${this.escapeHtml(word.contextSentence)}"</div>
        <div class="word-item-footer">
          <span>${new Date(word.savedAt).toLocaleDateString()}</span>
          <a href="${this.escapeHtml(word.articleUrl)}" target="_blank" style="color: #0a66c2; text-decoration: none;">View article</a>
        </div>
      </div>
    `
      )
      .join('');

    // Attach delete handlers
    wordsList.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', async e => {
        e.stopPropagation();
        const wordItem = (e.target as HTMLElement).closest(
          '.word-item'
        ) as HTMLElement;
        const wordId = wordItem.getAttribute('data-word-id');
        if (wordId) {
          await this.storage.deleteWord(wordId);
          await this.refresh();
        }
      });
    });
  }

  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  private async handleExport(): Promise<void> {
    try {
      const csv = await this.storage.exportAsCSV();
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute(
        'download',
        `context-reader-vocabulary-${new Date().toISOString().split('T')[0]}.csv`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export vocabulary. Please try again.');
    }
  }

  show(): void {
    if (!this.container) return;

    if (!this.container.parentElement) {
      document.body.appendChild(this.container);
    }

    this.container.style.display = 'block';
    this.visible = true;
    this.refresh();
  }

  hide(): void {
    if (this.container) {
      this.container.style.display = 'none';
    }
    this.visible = false;
  }

  toggle(): void {
    if (this.visible) {
      this.hide();
    } else {
      this.show();
    }
  }

  getShadowRoot(): ShadowRoot {
    if (!this.shadowRoot) {
      throw new Error('Shadow DOM not initialized');
    }
    return this.shadowRoot;
  }

  getExportButton(): HTMLElement | null {
    return this.shadowRoot?.querySelector('.export-btn') || null;
  }

  isVisible(): boolean {
    return this.visible;
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
pnpm test -- side-panel.test.ts
```

Expected: PASS (all tests pass)

- [ ] **Step 5: Commit**

```bash
git add src/_includes/assets/js/context-reader/side-panel.ts src/_includes/assets/js/context-reader/side-panel.test.ts
git commit -m "feat: implement side panel for vocabulary review and export"
```

---

### Task 7: Implement main Context Reader module

**Files:**

- Create: `src/_includes/assets/js/context-reader/context-reader.ts`
- Create: `src/_includes/assets/js/context-reader/context-reader.test.ts`

**Interfaces:**

- Consumes:
  - All components from Tasks 1-6
  - `getSelectedWord`, `extractSentence`, `detectLanguage` from Task 3
- Produces: `ContextReader` class with methods:
  - `initialize(): Promise<void>`
  - `enable(): void`
  - `disable(): void`
  - `isEnabled(): boolean`

- [ ] **Step 1: Write test for Context Reader main module**

```typescript
// src/_includes/assets/js/context-reader/context-reader.test.ts

import { ContextReader } from './context-reader';

describe('ContextReader', () => {
  let contextReader: ContextReader;

  beforeEach(async () => {
    contextReader = new ContextReader(
      'https://api.example.com/translate',
      'test-key'
    );
  });

  afterEach(() => {
    contextReader.disable();
  });

  test('initializes successfully', async () => {
    await contextReader.initialize();
    expect(contextReader.isInitialized()).toBe(true);
  });

  test('enables feature and adds double-click listener', async () => {
    await contextReader.initialize();
    contextReader.enable();
    expect(contextReader.isEnabled()).toBe(true);
  });

  test('disables feature and removes double-click listener', async () => {
    await contextReader.initialize();
    contextReader.enable();
    contextReader.disable();
    expect(contextReader.isEnabled()).toBe(false);
  });

  test('reads preference from localStorage', async () => {
    localStorage.setItem('contextReader:enabled', 'true');
    await contextReader.initialize();
    expect(contextReader.isEnabled()).toBe(true);
  });

  test('persists enabled state to localStorage', async () => {
    await contextReader.initialize();
    contextReader.enable();
    expect(localStorage.getItem('contextReader:enabled')).toBe('true');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
pnpm test -- context-reader.test.ts
```

Expected: FAIL with "ContextReader is not defined"

- [ ] **Step 3: Implement Context Reader main module**

```typescript
// src/_includes/assets/js/context-reader/context-reader.ts

import { StorageManager } from './storage';
import { TranslatorService } from './translator';
import { PopupComponent } from './popup';
import { SidePanelComponent } from './side-panel';
import { extractSentence, detectLanguage, getSelectedWord } from './utils';
import type { ContextReaderConfig, SavedWord } from './types';

export class ContextReader {
  private storage: StorageManager;
  private translator: TranslatorService;
  private popup: PopupComponent;
  private sidePanel: SidePanelComponent;
  private initialized: boolean = false;
  private enabled: boolean = false;
  private config: ContextReaderConfig;
  private pageLanguage: 'en' | 'es' = 'en';

  constructor(workerUrl: string, apiKey: string) {
    this.storage = new StorageManager();
    this.translator = new TranslatorService(workerUrl, apiKey);
    this.popup = new PopupComponent();
    this.sidePanel = new SidePanelComponent(this.storage);
    this.config = {
      enabled: false,
      nativeLanguage: 'en',
      learningLanguage: 'es'
    };
  }

  async initialize(): Promise<void> {
    try {
      // Initialize storage
      await this.storage.init();

      // Detect page language
      this.pageLanguage = detectLanguage(document);

      // Load settings from localStorage
      const savedEnabled = localStorage.getItem('contextReader:enabled');
      if (savedEnabled === 'true') {
        this.enabled = true;
        this.setupEventListeners();
      }

      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize Context Reader:', error);
      throw error;
    }
  }

  private setupEventListeners(): void {
    // Listen for double-clicks on article content
    const articleContent = document.querySelector('article') || document.body;

    articleContent.addEventListener('dblclick', e => {
      if (!this.enabled) return;

      const target = e.target as HTMLElement;

      // Don't trigger on buttons, inputs, etc.
      if (['BUTTON', 'INPUT', 'TEXTAREA', 'A'].includes(target.tagName)) {
        return;
      }

      const selected = getSelectedWord();
      if (!selected) return;

      e.preventDefault();
      this.handleWordSelection(selected.word, selected.rect);
    });
  }

  private async handleWordSelection(
    word: string,
    rect: DOMRect
  ): Promise<void> {
    try {
      // Determine source and target languages
      const sourceLang = this.pageLanguage;
      const targetLang =
        sourceLang === 'en' ? ('es' as const) : ('en' as const);

      // Show loading popup
      this.popup.show(word, { x: rect.left, y: rect.bottom });

      // Get the context (surrounding text)
      const articleContent = document.querySelector('article') || document.body;
      const contextText = articleContent.textContent || '';
      const contextSentence = extractSentence(
        contextText,
        contextText.indexOf(word)
      );

      // Fetch lookup result
      const result = await this.translator.lookup(
        word,
        contextSentence,
        sourceLang,
        targetLang
      );

      // Update popup with result
      this.popup.updateResult(result);

      // Attach save handler
      const saveBtn = this.popup.getSaveButton();
      if (saveBtn) {
        saveBtn.onclick = async () => {
          await this.handleSaveWord(
            word,
            result.translation,
            contextSentence,
            sourceLang,
            targetLang
          );
        };
      }
    } catch (error) {
      console.error('Lookup failed:', error);
      this.popup.updateError('Failed to look up word. Please try again.');
    }
  }

  private async handleSaveWord(
    word: string,
    translation: string,
    contextSentence: string,
    sourceLang: 'en' | 'es',
    targetLang: 'en' | 'es'
  ): Promise<void> {
    try {
      const savedWord: SavedWord = {
        id: `${word.toLowerCase()}-${Date.now()}`,
        word,
        translation,
        sourceLanguage: sourceLang,
        targetLanguage: targetLang,
        contextSentence,
        articleUrl: window.location.href,
        articleTitle: document.title,
        savedAt: new Date().toISOString()
      };

      await this.storage.saveWord(savedWord);
      console.log('Word saved:', savedWord);

      // Close popup and show confirmation
      this.popup.hide();
      // Optional: Show a toast notification
    } catch (error) {
      console.error('Failed to save word:', error);
      this.popup.updateError('Failed to save word. Please try again.');
    }
  }

  enable(): void {
    if (this.enabled) return;

    this.enabled = true;
    localStorage.setItem('contextReader:enabled', 'true');
    this.setupEventListeners();
  }

  disable(): void {
    this.enabled = false;
    localStorage.setItem('contextReader:enabled', 'false');
    this.popup.hide();
    this.sidePanel.hide();
  }

  toggleSidePanel(): void {
    this.sidePanel.toggle();
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  isInitialized(): boolean {
    return this.initialized;
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
pnpm test -- context-reader.test.ts
```

Expected: PASS (all tests pass)

- [ ] **Step 5: Commit**

```bash
git add src/_includes/assets/js/context-reader/context-reader.ts src/_includes/assets/js/context-reader/context-reader.test.ts
git commit -m "feat: implement main Context Reader module with initialization and event handling"
```

---

### Task 8: Create Context Reader CSS styles

**Files:**

- Create: `src/_includes/assets/css/context-reader.css`

**Interfaces:**

- Consumes: None (CSS only)
- Produces: Styles for popup and side panel (already in components, this is additional global styles if needed)

- [ ] **Step 1: Create base stylesheet**

```css
/* src/_includes/assets/css/context-reader.css */

/* Context Reader Feature Styles */
/* Uses freeCodeCamp Command-line Chic design system */

:root {
  --cr-primary: #0a66c2;
  --cr-text: #1a1a1a;
  --cr-bg: #ffffff;
  --cr-border: #e0e0e0;
  --cr-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  --cr-z-popup: 10000;
  --cr-z-panel: 9999;
  --cr-radius: 8px;
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  :root {
    --cr-text: #e0e0e0;
    --cr-bg: #1a1a1a;
    --cr-border: #333;
  }
}

/* Highlight interactive text when feature is enabled */
article p:has(+ [data-context-reader-enabled='true']),
article li:has(+ [data-context-reader-enabled='true']) {
  cursor: text;
}

/* Selected text styling */
::selection {
  background-color: rgba(10, 102, 194, 0.2);
}

/* Accessibility: Focus visible on interactive elements */
#context-reader-popup:focus-visible,
#context-reader-side-panel:focus-visible {
  outline: 2px solid var(--cr-primary);
  outline-offset: 2px;
}

/* Ensure popup and panel don't break layout */
#context-reader-popup,
#context-reader-side-panel {
  box-sizing: border-box;
  * {
    box-sizing: border-box;
  }
}

/* Print styles: hide context reader UI when printing */
@media print {
  #context-reader-popup,
  #context-reader-side-panel {
    display: none !important;
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  #context-reader-popup,
  #context-reader-side-panel {
    animation: none !important;
    transition: none !important;
  }
}
```

- [ ] **Step 2: Verify CSS is valid**

```bash
# Just check for syntax (no CSS linter configured for this project yet)
head -20 src/_includes/assets/css/context-reader.css
```

Expected: File exists and contains valid CSS

- [ ] **Step 3: Commit**

```bash
git add src/_includes/assets/css/context-reader.css
git commit -m "feat: add base CSS styles for context-reader feature"
```

---

### Task 9: Integrate toggle into navigation

**Files:**

- Modify: `src/_includes/partials/site-nav.njk`

**Interfaces:**

- Consumes: Navigation template structure (existing)
- Produces: Adds context-reader toggle button to nav

- [ ] **Step 1: Read existing site-nav.njk to understand structure**

```bash
head -50 src/_includes/partials/site-nav.njk
```

- [ ] **Step 2: Add toggle switch to navigation**

Modify `src/_includes/partials/site-nav.njk` to add the toggle. Find the navigation list and add:

```nunjucks
<li>
  <button
    id="context-reader-toggle"
    class="context-reader-toggle"
    aria-label="Toggle Context Reader mode"
    aria-pressed="false"
  >
    <span class="toggle-label">Context Reader</span>
    <span class="toggle-state" aria-live="polite">OFF</span>
  </button>
</li>
```

Add inline styles to site-nav.njk or reference from context-reader.css:

```css
<style>
  .context-reader-toggle {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: none;
    border: 1px solid var(--cr-border);
    border-radius: 4px;
    padding: 6px 12px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    color: var(--cr-text);
    transition: all 0.2s;
  }

  .context-reader-toggle:hover {
    background: var(--cr-bg);
    border-color: var(--cr-primary);
  }

  .context-reader-toggle[aria-pressed="true"] {
    background: var(--cr-primary);
    color: white;
    border-color: var(--cr-primary);
  }

  .toggle-state {
    font-size: 12px;
    font-weight: 600;
  }
</style>
```

- [ ] **Step 3: Commit**

```bash
git add src/_includes/partials/site-nav.njk
git commit -m "feat: add Context Reader toggle to navigation"
```

---

### Task 10: Integrate Context Reader module into post template

**Files:**

- Modify: `src/_includes/layouts/post.njk`

**Interfaces:**

- Consumes: Post layout structure (existing)
- Produces: Includes context-reader.ts initialization

- [ ] **Step 1: Read existing post.njk to understand structure**

```bash
head -50 src/_includes/layouts/post.njk
tail -50 src/_includes/layouts/post.njk
```

- [ ] **Step 2: Add Context Reader initialization script**

Add to the end of `src/_includes/layouts/post.njk` (before closing body tag or in a script section):

```nunjucks
<script type="module">
  import { ContextReader } from '/assets/js/context-reader/context-reader.js';

  // Initialize Context Reader when DOM is ready
  const contextReader = new ContextReader(
    '/api/context-reader/translate', // Cloudflare Worker URL
    '' // API key will be added by server
  );

  contextReader.initialize().catch(err => {
    console.warn('Context Reader failed to initialize:', err);
  });

  // Listen for toggle button clicks
  document.addEventListener('DOMContentLoaded', () => {
    const toggleBtn = document.getElementById('context-reader-toggle');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => {
        if (contextReader.isEnabled()) {
          contextReader.disable();
          toggleBtn.setAttribute('aria-pressed', 'false');
          toggleBtn.querySelector('.toggle-state').textContent = 'OFF';
        } else {
          contextReader.enable();
          toggleBtn.setAttribute('aria-pressed', 'true');
          toggleBtn.querySelector('.toggle-state').textContent = 'ON';
        }
      });

      // Set initial button state
      if (contextReader.isEnabled()) {
        toggleBtn.setAttribute('aria-pressed', 'true');
        toggleBtn.querySelector('.toggle-state').textContent = 'ON';
      }
    }
  });

  // Listen for side panel toggle from keyboard shortcut
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'V') {
      contextReader.toggleSidePanel();
    }
  });
</script>
```

- [ ] **Step 3: Commit**

```bash
git add src/_includes/layouts/post.njk
git commit -m "feat: integrate Context Reader module into post layout"
```

---

### Task 11: Create Cloudflare Worker backend

**Files:**

- Create: `workers/src/translator.ts` (Worker entry point)
- Create: `workers/src/services/deepl-service.ts`
- Create: `workers/src/services/dictionary-service.ts`
- Create: `workers/src/types.ts`
- Create: `wrangler.toml`

**Interfaces:**

- Consumes: Worker environment variables (API keys)
- Produces: HTTP endpoints for /translate and /dictionary

- [ ] **Step 1: Create wrangler.toml configuration**

```toml
# wrangler.toml
name = "context-reader-worker"
type = "javascript"
account_id = "" # Set via environment
workers_dev = true

[env.production]
route = "api.example.com/api/context-reader/*"
```

- [ ] **Step 2: Create Worker types**

```typescript
// workers/src/types.ts

export interface TranslationRequest {
  action: 'translate';
  text: string;
  sourceLang: 'en' | 'es';
  targetLang: 'en' | 'es';
  context?: string;
}

export interface DictionaryRequest {
  action: 'dictionary';
  word: string;
  lang: 'en' | 'es';
}

export type WorkerRequest = TranslationRequest | DictionaryRequest;

export interface TranslationResponse {
  translatedText: string;
  detectedSourceLanguage?: string;
}

export interface DictionaryEntry {
  word: string;
  phonetic?: string;
  meanings: Array<{
    partOfSpeech: string;
    definitions: Array<{
      definition: string;
      example?: string;
    }>;
  }>;
}
```

- [ ] **Step 3: Create DeepL service wrapper**

```typescript
// workers/src/services/deepl-service.ts

import type { TranslationResponse } from '../types';

export class DeepLService {
  private apiKey: string;
  private apiUrl = 'https://api-free.deepl.com/v1/translate';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async translate(
    text: string,
    sourceLang: 'en' | 'es',
    targetLang: 'en' | 'es',
    context?: string
  ): Promise<TranslationResponse> {
    const params = new URLSearchParams({
      auth_key: this.apiKey,
      text,
      source_lang: sourceLang.toUpperCase(),
      target_lang: targetLang.toUpperCase(),
      context
    });

    if (context) {
      params.append('context', context);
    }

    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: params
      });

      if (!response.ok) {
        throw new Error(
          `DeepL API error: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();
      return {
        translatedText: data.translations[0]?.text || '',
        detectedSourceLanguage: data.translations[0]?.detected_source_language
      };
    } catch (error) {
      console.error('DeepL translation failed:', error);
      throw error;
    }
  }
}
```

- [ ] **Step 4: Create Dictionary service wrapper**

```typescript
// workers/src/services/dictionary-service.ts

import type { DictionaryEntry } from '../types';

export class DictionaryService {
  private dictionaryApiUrl =
    'https://api.dictionaryapi.dev/api/v2/entries/english';
  private spanishDictionaryUrl = 'https://www.spanishdict.com/guide';

  async getEnglishDictionary(word: string): Promise<DictionaryEntry[]> {
    try {
      const response = await fetch(
        `${this.dictionaryApiUrl}/${encodeURIComponent(word)}`
      );

      if (!response.ok) {
        if (response.status === 404) {
          return [];
        }
        throw new Error(`Dictionary API error: ${response.statusText}`);
      }

      const entries = await response.json();
      return entries || [];
    } catch (error) {
      console.error('English dictionary lookup failed:', error);
      return [];
    }
  }

  async getSpanishDictionary(word: string): Promise<DictionaryEntry[]> {
    // For Spanish, we can use a public API or return empty for MVP
    // SpanishDict doesn't have a free API, so we'll skip for MVP
    return [];
  }

  async lookup(word: string, lang: 'en' | 'es'): Promise<DictionaryEntry[]> {
    if (lang === 'en') {
      return this.getEnglishDictionary(word);
    } else {
      return this.getSpanishDictionary(word);
    }
  }
}
```

- [ ] **Step 5: Create Worker entry point**

```typescript
// workers/src/translator.ts

import { DeepLService } from './services/deepl-service';
import { DictionaryService } from './services/dictionary-service';
import type { WorkerRequest } from './types';

interface Env {
  DEEPL_API_KEY: string;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    };

    // Handle preflight
    if (request.method === 'OPTIONS') {
      return new Response('OK', { headers: corsHeaders });
    }

    try {
      const url = new URL(request.url);

      // POST requests with action in body
      if (request.method === 'POST') {
        const body = (await request.json()) as WorkerRequest;

        if (body.action === 'translate') {
          const deepl = new DeepLService(env.DEEPL_API_KEY);
          const result = await deepl.translate(
            body.text,
            body.sourceLang,
            body.targetLang,
            body.context
          );

          return new Response(JSON.stringify(result), {
            status: 200,
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders
            }
          });
        }

        if (body.action === 'dictionary') {
          const dictionary = new DictionaryService();
          const result = await dictionary.lookup(body.word, body.lang);

          return new Response(JSON.stringify(result), {
            status: 200,
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders
            }
          });
        }
      }

      // GET requests for dictionary (alternative endpoint)
      if (request.method === 'GET') {
        const word = url.searchParams.get('word');
        const lang = (url.searchParams.get('lang') as 'en' | 'es') || 'en';

        if (word) {
          const dictionary = new DictionaryService();
          const result = await dictionary.lookup(word, lang);

          return new Response(JSON.stringify(result), {
            status: 200,
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders
            }
          });
        }
      }

      return new Response(JSON.stringify({ error: 'Invalid request' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
    } catch (error) {
      console.error('Worker error:', error);
      return new Response(
        JSON.stringify({
          error: 'Internal server error',
          message: error instanceof Error ? error.message : 'Unknown error'
        }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        }
      );
    }
  }
};
```

- [ ] **Step 6: Commit Worker files**

```bash
git add workers/src/translator.ts workers/src/services/deepl-service.ts workers/src/services/dictionary-service.ts workers/src/types.ts wrangler.toml
git commit -m "feat: create Cloudflare Worker backend for translation and dictionary services"
```

---

### Task 12: Add global CSS import and finalize styles

**Files:**

- Modify: `src/_includes/assets/css/global.css` (or main stylesheet)

**Interfaces:**

- Consumes: context-reader.css
- Produces: Imported styles available site-wide

- [ ] **Step 1: Add import to global.css**

Find the global.css file and add at the end:

```css
/* Import Context Reader styles */
@import 'context-reader.css';
```

- [ ] **Step 2: Verify import works**

```bash
grep -n "context-reader.css" src/_includes/assets/css/global.css
```

Expected: Shows the import line added

- [ ] **Step 3: Commit**

```bash
git add src/_includes/assets/css/global.css
git commit -m "feat: import context-reader styles into global stylesheet"
```

---

### Task 13: Write integration tests

**Files:**

- Create: `cypress/e2e/english/context-reader.cy.ts` (or appropriate locale)

**Interfaces:**

- Consumes: Cypress testing framework (existing)
- Produces: E2E test suite for the feature

- [ ] **Step 1: Write E2E test for Context Reader**

```typescript
// cypress/e2e/english/context-reader.cy.ts

describe('Context Reader Feature', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('displays toggle button in navigation', () => {
    cy.get('#context-reader-toggle').should('exist');
    cy.get('#context-reader-toggle').should('contain', 'Context Reader');
  });

  it('toggles context reader on and off', () => {
    cy.get('#context-reader-toggle').should(
      'have.attr',
      'aria-pressed',
      'false'
    );
    cy.get('#context-reader-toggle').click();
    cy.get('#context-reader-toggle').should(
      'have.attr',
      'aria-pressed',
      'true'
    );
    cy.get('#context-reader-toggle').should('contain', 'ON');
  });

  it('persists toggle state to localStorage', () => {
    cy.get('#context-reader-toggle').click();
    cy.visit('/');
    cy.get('#context-reader-toggle').should(
      'have.attr',
      'aria-pressed',
      'true'
    );
  });

  context('when enabled', () => {
    beforeEach(() => {
      cy.get('#context-reader-toggle').click();
    });

    it('shows popup on double-click of article text', () => {
      cy.visit('/news/sample-article');

      // Double-click a word in the article
      cy.get('article p')
        .first()
        .within(() => {
          cy.get('article p').first().dblclick();
        });

      // Popup should appear
      cy.get('#context-reader-popup').should('be.visible');
    });

    it('can save a word from the popup', () => {
      cy.visit('/news/sample-article');

      // Double-click a word
      cy.get('article p').first().dblclick();

      // Wait for popup and result to load
      cy.get('#context-reader-popup').should('be.visible');

      // Click save button
      cy.get('#context-reader-popup').find('button.save-btn').click();

      // Popup should close
      cy.get('#context-reader-popup').should('not.be.visible');
    });
  });

  it('opens vocabulary panel with keyboard shortcut', () => {
    cy.get('#context-reader-toggle').click();

    // Press Ctrl+Shift+V (or Cmd+Shift+V on Mac)
    cy.get('body').type('{ctrl}{shift}v');

    cy.get('#context-reader-side-panel').should('be.visible');
  });
});
```

- [ ] **Step 2: Run E2E tests**

```bash
pnpm cypress:run:english
```

Expected: Tests run (some may fail if sample article doesn't exist)

- [ ] **Step 3: Commit**

```bash
git add cypress/e2e/english/context-reader.cy.ts
git commit -m "test: add E2E tests for Context Reader feature"
```

---

### Task 14: Documentation and final setup

**Files:**

- Create: `docs/CONTEXT_READER.md`
- Create: `.env.example` (for worker configuration)

**Interfaces:**

- Consumes: Project structure and requirements
- Produces: User and developer documentation

- [ ] **Step 1: Create user/developer documentation**

```markdown
# Context Reader Feature Documentation

## Overview

Context Reader is an opt-in reading companion that helps English and Spanish learners acquire vocabulary while reading freeCodeCamp News articles.

## User Guide

### Enabling the Feature

1. Navigate to any article on freeCodeCamp News
2. Click the "Context Reader" toggle in the navigation (top right)
3. The toggle will change to show "ON"

### Looking Up Words

1. With Context Reader enabled, double-click any word in the article
2. A popup will appear with:
   - Translation
   - Pronunciation (if available)
   - Dictionary definition
   - Example from the article
3. Click "Save Word" to add it to your vocabulary

### Managing Vocabulary

1. Open the vocabulary panel with **Ctrl+Shift+V** (or **Cmd+Shift+V** on Mac)
2. View all saved words with their:
   - Translations
   - Context sentences
   - Save dates
   - Links to source articles
3. Delete words by clicking the ✕ button
4. Export your vocabulary as CSV by clicking "Export CSV"

## Developer Guide

### Architecture
```

Frontend Module (TypeScript)
├── context-reader.ts Main module & initialization
├── popup.ts Shadow DOM popup UI
├── side-panel.ts Vocabulary review & export
├── storage.ts IndexedDB wrapper
├── translator.ts API client
├── utils.ts Helpers (sentence extraction, etc)
└── types.ts TypeScript interfaces

Cloudflare Worker Backend
├── translator.ts Worker entry point
└── services/
├── deepl-service.ts DeepL API wrapper
└── dictionary-service.ts Free Dictionary API wrapper

````

### Configuration

Set environment variables in `wrangler.toml`:

```toml
[env.production]
vars = { DEEPL_API_KEY = "your-deepl-key-here" }
````

### Building

```bash
# Install dependencies
pnpm install

# Build frontend
pnpm build

# Deploy worker
cd workers && npm install && wrangler deploy
```

### Testing

```bash
# Unit tests
pnpm test

# E2E tests
pnpm cypress:run:english

# Type checking
pnpm type-check
```

### API Endpoints

**POST /api/context-reader/translate**

Request:

```json
{
  "action": "translate",
  "text": "hello",
  "sourceLang": "en",
  "targetLang": "es",
  "context": "Hello world"
}
```

Response:

```json
{
  "translatedText": "hola",
  "detectedSourceLanguage": "en"
}
```

**GET /api/context-reader/dictionary?word=hello&lang=en**

Returns array of dictionary entries from Free Dictionary API.

### Privacy

- Only sends selected word and minimal context to backend
- No entire article content is transmitted
- All data stored locally in user's browser (IndexedDB)
- CSV exports are created client-side

### Performance

- Lookup results cached locally (1 hour TTL)
- Shadow DOM for UI isolation
- Feature disabled by default (zero impact on other readers)
- Target: <500ms for cached lookups

````

- [ ] **Step 2: Create environment example file**

```bash
# .env.example
DEEPL_API_KEY=your_deepl_api_key_here
CONTEXT_READER_WORKER_URL=https://your-worker-url.workers.dev
````

- [ ] **Step 3: Commit documentation**

```bash
git add docs/CONTEXT_READER.md .env.example
git commit -m "docs: add Context Reader user and developer documentation"
```

---

### Task 15: Final validation and testing

**Files:**

- No new files, validate existing implementation

**Interfaces:**

- Consumes: All components from Tasks 1-14
- Produces: Verified working implementation

- [ ] **Step 1: Run all tests**

```bash
pnpm test
```

Expected: All tests pass

- [ ] **Step 2: Run build**

```bash
pnpm build
```

Expected: Build completes without errors

- [ ] **Step 3: Run linter**

```bash
pnpm lint
```

Expected: No linting errors

- [ ] **Step 4: Type check**

```bash
pnpm type-check
```

Expected: No type errors

- [ ] **Step 5: Verify E2E tests**

```bash
pnpm cypress:run:english
```

Expected: E2E tests run successfully

- [ ] **Step 6: Create final commit and summary**

```bash
git log --oneline -15
```

Expected: Shows all feature commits

- [ ] **Step 7: Final commit message**

```bash
git commit --allow-empty -m "feat: complete Context Reader feature implementation

- Implemented Context Reader opt-in toggle in navigation
- Double-click word lookup with Shadow DOM popup
- Vocabulary management with IndexedDB storage
- CSV export functionality
- Cloudflare Worker backend for DeepL + Dictionary APIs
- Comprehensive test coverage (unit & E2E)
- Full TypeScript implementation
- Privacy-first design (minimal data transmission)
- Accessible UI with ARIA labels
- Dark mode support
- Performance optimized (<500ms cached lookups)

Feature is disabled by default with zero impact on existing readers."
```

---

## Spec Coverage Verification

- ✅ **Navigation Toggle** - Task 9 (added to site-nav.njk)
- ✅ **Double-click Lookup** - Task 7 (event handling in context-reader.ts)
- ✅ **Popup UI** - Task 5 (PopupComponent with Shadow DOM)
- ✅ **Vocabulary Storage** - Task 2 (IndexedDB StorageManager)
- ✅ **Side Panel** - Task 6 (SidePanelComponent with review and export)
- ✅ **CSV Export** - Task 2 (StorageManager.exportAsCSV())
- ✅ **DeepL Integration** - Task 11 (DeepL service in Worker)
- ✅ **Dictionary API** - Task 11 (Dictionary service in Worker)
- ✅ **Language Detection** - Task 3 (detectLanguage utility)
- ✅ **Sentence Extraction** - Task 3 (extractSentence utility)
- ✅ **TypeScript Types** - Task 1 (types.ts)
- ✅ **Tests (Unit & E2E)** - Tasks 2-7, 13
- ✅ **Documentation** - Task 14
- ✅ **Styling (Command-line Chic)** - Task 8

---

## Execution Path

**Plan complete and saved to `docs/superpowers/plans/2026-07-13-context-reader.md`.**

Two execution options:

**1. Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

**Which approach would you prefer?**
