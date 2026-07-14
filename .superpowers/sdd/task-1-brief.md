# Task 1: Set up TypeScript types and interfaces

**Files:**

- Create: `src/_includes/assets/js/context-reader/types.ts`

**Interfaces:**

- Produces:
  - `SavedWord` interface
  - `PopupState` interface
  - `LookupResult` interface
  - `TranslationRequest`, `TranslationResponse` interfaces

## Exact Deliverable

Create TypeScript file with these interfaces:

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

Then commit with message: `feat: add TypeScript types for context-reader module`
