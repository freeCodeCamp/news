# Task 11: Create Cloudflare Worker backend

**Files:**

- Create: `workers/src/translator.ts` (Worker entry point)
- Create: `workers/src/services/deepl-service.ts` (DeepL API wrapper)
- Create: `workers/src/services/dictionary-service.ts` (Dictionary API wrapper)
- Create: `workers/src/types.ts` (Worker types)
- Create: `wrangler.toml` (Worker configuration)

**Interfaces:**

- Consumes: Environment variables (DEEPL_API_KEY)
- Produces: HTTP endpoints for /translate and /dictionary

## Worker Entry Point (`workers/src/translator.ts`)

- Export default handler with fetch(request, env) function
- Handle CORS with preflight requests (OPTIONS)
- Parse JSON body from POST requests
- Route based on `action` field in request body
- Two actions: "translate" and "dictionary"
- Return JSON responses with proper status codes
- Error handling with 500 response

## DeepL Service (`workers/src/services/deepl-service.ts`)

- Class DeepLService
- Constructor takes apiKey
- Method: async translate(text, sourceLang, targetLang, context?)
- POST to https://api-free.deepl.com/v1/translate
- Parameters: auth_key, text, source_lang, target_lang, context (if provided)
- Return: { translatedText, detectedSourceLanguage }

## Dictionary Service (`workers/src/services/dictionary-service.ts`)

- Class DictionaryService
- Methods:
  - async getEnglishDictionary(word) - calls Free Dictionary API
  - async getSpanishDictionary(word) - returns [] for MVP (no free API available)
  - async lookup(word, lang) - routes to appropriate dictionary
- Return: DictionaryEntry[] or []

## Types (`workers/src/types.ts`)

Define these interfaces:

- TranslationRequest: { action: "translate", text, sourceLang, targetLang, context? }
- DictionaryRequest: { action: "dictionary", word, lang }
- TranslationResponse: { translatedText, detectedSourceLanguage? }
- DictionaryEntry (from Task 1 types)

## Configuration (`wrangler.toml`)

```toml
name = "context-reader-worker"
type = "javascript"
main = "src/translator.ts"

[env.production]
route = "api.example.com/api/context-reader/*"
vars = { DEEPL_API_KEY = "your-key-here" }
```

## Requirements

- All 5 files created
- Worker handles POST /api/context-reader/translate with action="translate"
- Worker handles GET /api/context-reader/dictionary?word=X&lang=Y
- Worker handles OPTIONS preflight requests
- CORS headers on all responses
- Error handling with proper status codes (500 for server errors)
- DeepL integration with context parameter
- Dictionary API integration (English only)
- Proper TypeScript types throughout

## Commit Message

`feat: create Cloudflare Worker backend for translation and dictionary services`

## No Testing

This is backend configuration - verification is manual deployment. Ensure files exist and TypeScript compiles.
