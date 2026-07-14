import { DeepLService } from './services/deepl-service';
import { DictionaryService } from './services/dictionary-service';
import { TranslationRequest, DictionaryRequest, Env } from './types';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization'
};

function corsResponse(
  body: string,
  status: number,
  contentType = 'application/json'
): Response {
  return new Response(body, {
    status,
    headers: {
      ...CORS_HEADERS,
      'Content-Type': contentType
    }
  });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: CORS_HEADERS
      });
    }

    try {
      const url = new URL(request.url);

      // Handle GET requests for dictionary lookups
      if (request.method === 'GET') {
        const word = url.searchParams.get('word');
        const lang = url.searchParams.get('lang');

        if (!word || !lang) {
          return corsResponse(
            JSON.stringify({
              error: 'Missing required parameters: word, lang'
            }),
            400
          );
        }

        const dictionaryService = new DictionaryService();
        const entries = await dictionaryService.lookup(word, lang);
        return corsResponse(JSON.stringify(entries), 200);
      }

      // Handle POST requests
      if (request.method === 'POST') {
        let body: TranslationRequest | DictionaryRequest;

        try {
          body = (await request.json()) as
            TranslationRequest | DictionaryRequest;
        } catch {
          return corsResponse(
            JSON.stringify({ error: 'Invalid JSON body' }),
            400
          );
        }

        if (!body || !body.action) {
          return corsResponse(
            JSON.stringify({ error: 'Missing required field: action' }),
            400
          );
        }

        if (body.action === 'translate') {
          const translateReq = body as TranslationRequest;

          if (
            !translateReq.text ||
            !translateReq.sourceLang ||
            !translateReq.targetLang
          ) {
            return corsResponse(
              JSON.stringify({
                error: 'Missing required fields: text, sourceLang, targetLang'
              }),
              400
            );
          }

          const deepLService = new DeepLService(env.DEEPL_API_KEY);
          const result = await deepLService.translate(
            translateReq.text,
            translateReq.sourceLang,
            translateReq.targetLang,
            translateReq.context
          );

          return corsResponse(JSON.stringify(result), 200);
        }

        if (body.action === 'dictionary') {
          const dictReq = body as DictionaryRequest;

          if (!dictReq.word || !dictReq.lang) {
            return corsResponse(
              JSON.stringify({ error: 'Missing required fields: word, lang' }),
              400
            );
          }

          const dictionaryService = new DictionaryService();
          const entries = await dictionaryService.lookup(
            dictReq.word,
            dictReq.lang
          );
          return corsResponse(JSON.stringify(entries), 200);
        }

        return corsResponse(
          JSON.stringify({
            error: `Unknown action: ${(body as { action: string }).action}`
          }),
          400
        );
      }

      return corsResponse(JSON.stringify({ error: 'Method not allowed' }), 405);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Internal server error';
      return corsResponse(JSON.stringify({ error: message }), 500);
    }
  }
};
