import {
  describe,
  test,
  expect,
  beforeEach,
  afterEach,
  jest
} from '@jest/globals';
import { TranslatorService } from './translator.js';

const WORKER_URL = 'https://my-worker.example.com';
const API_KEY = 'test-api-key';

describe('TranslatorService', () => {
  let service: TranslatorService;

  beforeEach(() => {
    jest.useFakeTimers();
    service = new TranslatorService(WORKER_URL, API_KEY);
    service.clearCache();
    (global as Record<string, unknown>).fetch = jest.fn();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('translates text via worker', async () => {
    const mockResponse = {
      translatedText: 'hola',
      detectedSourceLanguage: 'en'
    };
    (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse
    } as Response);

    const result = await service.translate({
      text: 'hello',
      sourceLang: 'en',
      targetLang: 'es'
    });

    expect(result.translatedText).toBe('hola');
    expect(global.fetch).toHaveBeenCalledWith(
      WORKER_URL,
      expect.objectContaining({
        method: 'POST'
      })
    );
  });

  test('gets dictionary entry for a word', async () => {
    const mockDictionaryResponse = [
      {
        word: 'hello',
        phonetic: '/həˈloʊ/',
        meanings: [
          {
            partOfSpeech: 'exclamation',
            definitions: [
              {
                definition:
                  'Used as a greeting or to begin a phone conversation.',
                example: 'Hello there, Katie!'
              }
            ]
          }
        ]
      }
    ];
    (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => mockDictionaryResponse
    } as Response);

    const result = await service.getDictionary('hello', 'en');

    expect(result).toHaveLength(1);
    expect(result[0].word).toBe('hello');
    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.dictionaryapi.dev/api/v2/entries/english/hello'
    );
  });

  test('performs complete lookup with translation and dictionary', async () => {
    const mockTranslationResponse = {
      translatedText: 'hola',
      detectedSourceLanguage: 'en'
    };
    const mockDictionaryResponse = [
      {
        word: 'hello',
        meanings: [
          {
            partOfSpeech: 'exclamation',
            definitions: [{ definition: 'Used as a greeting.' }]
          }
        ]
      }
    ];

    (global.fetch as jest.MockedFunction<typeof fetch>)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockTranslationResponse
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockDictionaryResponse
      } as Response);

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
    (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
      ok: false,
      status: 500
    } as Response);

    await expect(
      service.translate({ text: 'hello', sourceLang: 'en', targetLang: 'es' })
    ).rejects.toThrow();
  });
});

describe('TranslatorService cache', () => {
  let service: TranslatorService;

  beforeEach(() => {
    jest.useFakeTimers();
    service = new TranslatorService(WORKER_URL, API_KEY);
    service.clearCache();
    (global as Record<string, unknown>).fetch = jest.fn();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('caches lookup results and clears cache', async () => {
    const mockTranslationResponse = {
      translatedText: 'hola',
      detectedSourceLanguage: 'en'
    };
    const mockDictionaryResponse = [
      {
        word: 'hello',
        meanings: [
          {
            partOfSpeech: 'exclamation',
            definitions: [{ definition: 'Used as a greeting.' }]
          }
        ]
      }
    ];

    (global.fetch as jest.MockedFunction<typeof fetch>)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockTranslationResponse
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockDictionaryResponse
      } as Response);

    // First call — hits the network
    const result1 = await service.lookup('hello', 'Hello there!', 'en', 'es');
    expect(result1.translation).toBe('hola');
    expect(global.fetch).toHaveBeenCalledTimes(2);

    // Second call — served from cache, no additional fetch calls
    const result2 = await service.lookup('hello', 'Hello there!', 'en', 'es');
    expect(result2.translation).toBe('hola');
    expect(global.fetch).toHaveBeenCalledTimes(2);

    // clearCache empties the map
    service.clearCache();

    (global.fetch as jest.MockedFunction<typeof fetch>)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockTranslationResponse
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockDictionaryResponse
      } as Response);

    // Third call after clear — hits the network again
    const result3 = await service.lookup('hello', 'Hello there!', 'en', 'es');
    expect(result3.translation).toBe('hola');
    expect(global.fetch).toHaveBeenCalledTimes(4);
  });
});

describe('TranslatorService getDictionary', () => {
  let service: TranslatorService;

  beforeEach(() => {
    jest.useFakeTimers();
    service = new TranslatorService(WORKER_URL, API_KEY);
    (global as Record<string, unknown>).fetch = jest.fn();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('returns empty array for unknown word', async () => {
    (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
      ok: false,
      status: 404
    } as Response);

    const result = await service.getDictionary('xyzunknown', 'en');
    expect(result).toEqual([]);
  });
});
