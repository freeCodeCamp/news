// src/_includes/assets/js/context-reader/translator.ts

import type {
  TranslationRequest,
  TranslationResponse,
  LookupResult,
  DictionaryEntry,
  ContextReaderLanguage
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
      let message = `Translation request failed with status ${response.status}`;
      try {
        const errorBody = (await response.json()) as { error?: string };
        if (errorBody.error) {
          message = errorBody.error;
        }
      } catch {
        // Keep the status-based fallback if the Worker returns a non-JSON error.
      }
      throw new Error(message);
    }

    return response.json() as Promise<TranslationResponse>;
  }

  async getDictionary(
    word: string,
    lang: ContextReaderLanguage
  ): Promise<DictionaryEntry[]> {
    try {
      if (lang === 'en') {
        const url = `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`;
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
          body: JSON.stringify({ action: 'dictionary', word, lang })
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
    contextSentence: string,
    sourceLang: ContextReaderLanguage,
    targetLang: ContextReaderLanguage
  ): Promise<LookupResult> {
    const cacheKey = `${word}-${sourceLang}-${targetLang}`;
    const cached = this.cache.get(cacheKey);
    if (cached !== undefined) {
      return cached;
    }

    const [translationResponse, dictionaryEntries] = await Promise.all([
      this.translate({
        text: word,
        sourceLang,
        targetLang,
        context: contextSentence
      }),
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
