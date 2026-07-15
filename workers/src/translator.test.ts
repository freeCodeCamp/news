import { describe, expect, test } from '@jest/globals';
import worker from './translator';

describe('translator worker', () => {
  test('returns a clear service error when DeepL is not configured', async () => {
    const response = await worker.fetch(
      new Request('https://worker.example.com', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'translate',
          text: 'hello',
          sourceLang: 'en',
          targetLang: 'es'
        })
      }),
      { DEEPL_API_KEY: '' }
    );

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toEqual({
      error: 'DEEPL_API_KEY is not configured'
    });
  });
});
