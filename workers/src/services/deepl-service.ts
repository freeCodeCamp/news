import type { TranslationResponse } from '../types';

export class DeepLService {
  private apiKey: string;
  private apiUrl = 'https://api-free.deepl.com/v2/translate';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async translate(
    text: string,
    sourceLang: string,
    targetLang: string,
    context?: string
  ): Promise<TranslationResponse> {
    const body = {
      text: [text],
      source_lang: sourceLang.toUpperCase(),
      target_lang: targetLang.toUpperCase(),
      ...(context !== undefined ? { context } : {})
    };

    const response = await fetch(this.apiUrl, {
      method: 'POST',
      headers: {
        Authorization: `DeepL-Auth-Key ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      throw new Error(
        `DeepL API error: ${response.status} ${response.statusText}`
      );
    }

    const data = (await response.json()) as {
      translations: Array<{
        text: string;
        detected_source_language: string;
      }>;
    };

    const translation = data.translations[0];

    return {
      translatedText: translation.text,
      detectedSourceLanguage: translation.detected_source_language
    };
  }
}
