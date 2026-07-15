import { beforeEach, describe, expect, test, jest } from '@jest/globals';
import { DeepLService } from './deepl-service';

describe('DeepLService', () => {
  beforeEach(() => {
    (global as Record<string, unknown>).fetch = jest.fn();
  });

  test('translates text with the current DeepL v2 JSON API contract', async () => {
    (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        translations: [
          {
            text: 'hola',
            detected_source_language: 'EN'
          }
        ]
      })
    } as Response);

    const service = new DeepLService('test-deepl-key');
    const result = await service.translate('hello', 'en', 'es', 'hello there');

    expect(result.translatedText).toBe('hola');
    expect(global.fetch).toHaveBeenCalledWith(
      'https://api-free.deepl.com/v2/translate',
      {
        method: 'POST',
        headers: {
          Authorization: 'DeepL-Auth-Key test-deepl-key',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text: ['hello'],
          source_lang: 'EN',
          target_lang: 'ES',
          context: 'hello there'
        })
      }
    );
  });
});
