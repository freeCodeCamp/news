// src/_includes/assets/js/context-reader/translator.ts

import type {
  TranslationRequest,
  TranslationResponse,
  LookupResult,
  DictionaryEntry
} from './types.js';

export class TranslatorService {
  private workerUrl: string;
  private apiKey: string;
  private cache: Map<string, LookupResult>;

  constructor(workerUrl: string, apiKey: string) {
    this.workerUrl = workerUrl;
    this.apiKey = apiKey;
    this.cache = new Map<string, LookupResult>();
  }

  async translate(request: TranslationRequest): Promise<TranslationResponse> {
    const response = await fetch(this.workerUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        action: 'translate',
        text: request.text,
        sourceLang: request.sourceLang,
        targetLang: request.targetLang,
        ...(request.context !== undefined ? { context: request.context } : {})
      })
    });

    if (!response.ok) {
      throw new Error(
        `Translation request failed with status ${response.status}`
      );
    }

    return response.json() as Promise<TranslationResponse>;
  }

  async getDictionary(
    word: string,
    lang: 'en' | 'es'
  ): Promise<DictionaryEntry[]> {
    try {
      if (lang === 'en') {
        const url = `https://api.dictionaryapi.dev/api/v2/entries/english/${word}`;
        const response = await fetch(url);
        if (!response.ok || response.status === 404) {
          return [];
        }
        return response.json() as Promise<DictionaryEntry[]>;
      } else {
        const response = await fetch(this.workerUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.apiKey}`
          },
          body: JSON.stringify({ action: 'dictionary', word, lang: 'es' })
        });
        if (!response.ok) {
          return [];
        }
        return response.json() as Promise<DictionaryEntry[]>;
      }
    } catch {
      return [];
    }
  }

  async lookup(
    word: string,
    _contextSentence: string,
    sourceLang: 'en' | 'es',
    targetLang: 'en' | 'es'
  ): Promise<LookupResult> {
    const cacheKey = `${word}-${sourceLang}-${targetLang}`;
    const cached = this.cache.get(cacheKey);
    if (cached !== undefined) {
      return cached;
    }

    const [translationResponse, dictionaryEntries] = await Promise.all([
      this.translate({ text: word, sourceLang, targetLang }),
      this.getDictionary(word, sourceLang)
    ]);

    const result: LookupResult = {
      word,
      translation: translationResponse.translatedText,
      meanings: dictionaryEntries,
      sourceLanguage: sourceLang,
      targetLanguage: targetLang
    };

    this.cache.set(cacheKey, result);
    setTimeout(
      () => {
        this.cache.delete(cacheKey);
      },
      60 * 60 * 1000
    );

    return result;
  }

  clearCache(): void {
    this.cache.clear();
  }
}
