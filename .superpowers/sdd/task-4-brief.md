# Task 4: Implement Translator API client

**Files:**

- Create: `src/_includes/assets/js/context-reader/translator.ts`
- Create: `src/_includes/assets/js/context-reader/translator.test.ts`

**Interfaces:**

- Consumes:
  - `TranslationRequest`, `TranslationResponse`, `LookupResult`, `DictionaryEntry` from Task 1
  - `detectLanguage` from Task 3
- Produces: `TranslatorService` class with methods:
  - `translate(request: TranslationRequest): Promise<TranslationResponse>`
  - `getDictionary(word: string, lang: "en" | "es"): Promise<DictionaryEntry[]>`
  - `lookup(word: string, contextSentence: string, sourceLang: "en" | "es", targetLang: "en" | "es"): Promise<LookupResult>`
  - `clearCache(): void` (helper)

## Test Cases (3 describe blocks, 5 tests total)

**TranslatorService describe block:**

1. "translates text via worker"
   - Mock fetch to return { translatedText: "hola", detectedSourceLanguage: "en" }
   - Call: await service.translate({ text: "hello", sourceLang: "en", targetLang: "es" })
   - Verify result.translatedText === "hola"
   - Verify fetch was called with worker URL

2. "gets dictionary entry for a word"
   - Mock fetch to return Free Dictionary API response
   - Call: await service.getDictionary("hello", "en")
   - Verify result array has the word entry
   - Verify fetch called with correct dictionary URL

3. "performs complete lookup with translation and dictionary"
   - Mock fetch twice (first for translation, second for dictionary)
   - Call: await service.lookup("hello", "Hello there, friend!", "en", "es")
   - Verify result.word === "hello"
   - Verify result.translation === "hola"
   - Verify result.sourceLanguage === "en"
   - Verify result.targetLanguage === "es"

4. "handles translation errors gracefully"
   - Mock fetch to return { ok: false, status: 500 }
   - Expect error to be thrown

## Implementation Details

**TranslatorService constructor:**

```typescript
constructor(workerUrl: string, apiKey: string) {
  this.workerUrl = workerUrl;
  this.apiKey = apiKey;
  this.cache = new Map<string, LookupResult>();
}
```

**translate method:**

- Sends POST request to worker with action: "translate"
- Headers: Content-Type: application/json, Authorization: Bearer {apiKey}
- Body: { action: "translate", text, sourceLang, targetLang, context? }
- Returns TranslationResponse
- Throws on !response.ok

**getDictionary method:**

- For English: calls https://api.dictionaryapi.dev/api/v2/entries/english/{word}
- For Spanish: calls worker with { action: "dictionary", word, lang: "es" }
- Returns array of DictionaryEntry
- Returns [] on 404 or error

**lookup method:**

- Cache key: `${word}-${sourceLang}-${targetLang}`
- Check cache first, return if hit
- Call translate() for translation
- Call getDictionary() for definitions
- Build LookupResult object
- Cache result with 1-hour TTL (setTimeout to delete after 60*60*1000ms)
- Return result

**clearCache method:**

- Clears the Map: this.cache.clear()

## Commit Message

`feat: implement translator service for DeepL and Dictionary API integration`

## Testing

Run: `pnpm test -- translator.test.ts`
All 5 tests must pass using mock fetch (global.fetch = jest.fn()).
