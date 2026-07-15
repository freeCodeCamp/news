// src/_includes/assets/js/context-reader/types.ts

export type ContextReaderLanguage = 'en' | 'es' | 'pt' | 'it' | 'fr';

export interface SavedWord {
  id: string;
  word: string;
  translation: string;
  sourceLanguage: ContextReaderLanguage;
  targetLanguage: ContextReaderLanguage;
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
  sourceLanguage: ContextReaderLanguage;
  targetLanguage: ContextReaderLanguage;
}

export interface TranslationRequest {
  text: string;
  sourceLang: ContextReaderLanguage;
  targetLang: ContextReaderLanguage;
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
  nativeLanguage: ContextReaderLanguage;
  learningLanguage: ContextReaderLanguage;
}
