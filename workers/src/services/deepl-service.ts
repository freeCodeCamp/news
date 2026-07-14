import { TranslationResponse } from '../types';

export class DeepLService {
  private apiKey: string;
  private apiUrl = 'https://api-free.deepl.com/v1/translate';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async translate(
    text: string,
    sourceLang: string,
    targetLang: string,
    context?: string
  ): Promise<TranslationResponse> {
    const params = new URLSearchParams({
      auth_key: this.apiKey,
      text,
      source_lang: sourceLang.toUpperCase(),
      target_lang: targetLang.toUpperCase()
    });

    if (context) {
      params.append('context', context);
    }

    const response = await fetch(this.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: params.toString()
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
