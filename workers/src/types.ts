export interface TranslationRequest {
  action: 'translate';
  text: string;
  sourceLang: string;
  targetLang: string;
  context?: string;
}

export interface DictionaryRequest {
  action: 'dictionary';
  word: string;
  lang: string;
}

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
      synonyms?: string[];
    }>;
  }>;
}

export interface Env {
  DEEPL_API_KEY: string;
}
