# Context Reader

Context Reader is an opt-in reading companion built into freeCodeCamp News. It helps language learners acquire vocabulary while reading articles by providing instant translations and dictionary definitions for any word on the page.

## Table of Contents

- [Overview](#overview)
- [User Guide](#user-guide)
  - [Enabling the Feature](#enabling-the-feature)
  - [Looking Up Words](#looking-up-words)
  - [Managing Your Vocabulary](#managing-your-vocabulary)
- [Developer Guide](#developer-guide)
  - [Architecture](#architecture)
  - [Configuration](#configuration)
  - [Building](#building)
  - [Testing](#testing)
- [API Endpoints](#api-endpoints)
  - [POST /api/context-reader/translate](#post-apicontext-readertranslate)
  - [GET /api/context-reader/dictionary](#get-apicontext-readerdictionary)
- [Privacy](#privacy)
- [Performance](#performance)

---

## Overview

Context Reader is designed for learners who read freeCodeCamp News articles in English or Spanish and want to build vocabulary in the other language. It is completely opt-in — the feature is dormant until you turn it on, and it stores all saved words locally in your browser with no account required.

Key capabilities:

- **Instant translation** — double-click any word to see its translation powered by DeepL.
- **Dictionary definitions** — phonetics, part of speech, and example sentences from the Free Dictionary API (English words).
- **Vocabulary panel** — a side panel that lists every word you have saved, with context sentences and links back to the source article.
- **CSV export** — download your full vocabulary list at any time.
- **Persistent state** — your toggle preference and saved words survive page reloads and browser restarts.

Supported language pair: **English (en) and Spanish (es)**.

---

## User Guide

### Enabling the Feature

Context Reader is off by default. To turn it on:

1. Find the **Context Reader** button in the site navigation bar.
2. Click the button. The label changes to **Context Reader: ON** and the button's `aria-pressed` state becomes `true`.
3. To turn it off, click the button again.

Your preference is saved in `localStorage` under the key `contextReader:enabled` and restored automatically the next time you visit the site.

### Looking Up Words

While Context Reader is enabled:

1. **Double-click any word** in an article. A popup appears just below the word showing:
   - The word and its translation.
   - Pronunciation (if available for English words).
   - Part of speech and definitions.
   - An example sentence (if available).
2. Click **Save** in the popup to add the word to your vocabulary list.
3. Click anywhere outside the popup, or press **Escape**, to dismiss it without saving.

The popup is built with Shadow DOM so its styles never conflict with the page.

### Managing Your Vocabulary

Press **Cmd+Shift+V** (Mac) or **Ctrl+Shift+V** (Windows/Linux) at any time to open the Vocabulary side panel. You can also open it programmatically via the `toggleSidePanel()` method on the `ContextReader` instance.

Inside the panel:

| Action             | How                                                       |
| ------------------ | --------------------------------------------------------- |
| Browse saved words | Scroll the list; words appear newest first.               |
| Search             | Type in the search box to filter the list.                |
| Delete a word      | Click the **x** button on the word card.                  |
| Export as CSV      | Click **Export CSV** to download a `.csv` file.           |
| Close the panel    | Click the **x** in the panel header, or press **Escape**. |

The exported CSV file is named `context-reader-vocabulary-YYYY-MM-DD.csv` and contains these columns:

```
word, translation, sourceLanguage, targetLanguage, contextSentence, articleUrl, articleTitle, savedAt
```

---

## Developer Guide

### Architecture

Context Reader consists of two independent layers that communicate over HTTP:

```
Browser (client)
│
├── ContextReader          — main controller (context-reader.ts)
│   ├── StorageManager     — IndexedDB wrapper (storage.ts)
│   ├── TranslatorService  — HTTP client + in-memory cache (translator.ts)
│   ├── PopupComponent     — word popup, Shadow DOM (popup.ts)
│   └── SidePanelComponent — vocabulary panel, Shadow DOM (side-panel.ts)
│
└── utils.ts               — detectLanguage, extractSentence, getSelectedWord

Cloudflare Worker (server)
│
└── translator.ts          — HTTP router
    ├── DeepLService        — calls DeepL API (services/deepl-service.ts)
    └── DictionaryService   — calls Free Dictionary API (services/dictionary-service.ts)
```

**Data flow for a word lookup:**

1. User double-clicks a word in the article.
2. `getSelectedWord()` returns the word text and its bounding rect.
3. `ContextReader.handleWordSelection()` calls `TranslatorService.lookup()`.
4. `TranslatorService` checks its in-memory cache. On a cache miss it fires two parallel requests:
   - `POST /api/context-reader/translate` (via the Cloudflare Worker) to translate the word with DeepL.
   - `GET` to `https://api.dictionaryapi.dev/api/v2/entries/english/<word>` (English words only) for definitions.
5. The result is cached for one hour, then returned to `PopupComponent` which renders it.

**Storage:**

Saved words are persisted in the browser's IndexedDB database named `ContextReader`, object store `vocabulary`. No data is sent to any server when a word is saved.

**Language detection:**

The client detects the article language from, in priority order:

1. The `lang` attribute on the element itself.
2. The `lang` attribute on `<html>`.
3. The `og:locale` meta tag.
4. The `http-equiv="content-language"` meta tag.
5. Default: `en`.

### Configuration

The Cloudflare Worker requires a DeepL API key. For deployed Workers, set it as a Wrangler secret instead of committing it to `wrangler.toml`:

```bash
npx wrangler secret put DEEPL_API_KEY
```

Environment variables used by the worker:

| Variable        | Description                             |
| --------------- | --------------------------------------- |
| `DEEPL_API_KEY` | Your DeepL API key (free or paid tier). |

Environment variables used by the client (set at build time or passed to `ContextReader` constructor):

| Variable                    | Description                                 |
| --------------------------- | ------------------------------------------- |
| `CONTEXT_READER_WORKER_URL` | Full URL of the deployed Cloudflare Worker. |

Instantiating the client:

```typescript
import { ContextReader } from './context-reader/context-reader.js';

const reader = new ContextReader(
  'https://your-worker-url.workers.dev',
  'your-api-key'
);

await reader.initialize();
```

### Building

The client TypeScript files live in:

```
src/_includes/assets/js/context-reader/
```

They are compiled as part of the normal site build. From the project root:

```bash
# Development server with live reload
pnpm run develop

# Production build
pnpm run build
```

The Cloudflare Worker lives in `workers/` and is deployed separately with Wrangler:

```bash
# Configure the DeepL secret once per deployed Worker
npx wrangler secret put DEEPL_API_KEY

# Deploy the worker
npx wrangler deploy
```

The worker entry point is configured in `wrangler.toml`:

```toml
name = "context-reader-worker"
main = "workers/src/translator.ts"
```

### Testing

Unit tests use Jest and live alongside their source files as `*.test.ts` files:

```bash
# Run all unit tests
pnpm run test
```

End-to-end tests are written in Cypress:

```bash
# Run E2E tests (English locale)
pnpm run cypress:run:english

# Open Cypress interactively
pnpm run cypress:watch
```

The Context Reader E2E spec is at `cypress/e2e/english/context-reader.cy.ts`. It covers:

- Toggle button visibility and aria state.
- `localStorage` persistence across page loads.
- Popup appearance on double-click.
- Saving a word from the popup.
- Opening the vocabulary panel with the keyboard shortcut.

---

## API Endpoints

Both endpoints are served by a Cloudflare Worker deployed at `CONTEXT_READER_WORKER_URL`. All responses include CORS headers allowing cross-origin requests.

### POST /api/context-reader/translate

Translates a word or phrase using the DeepL API.

**Request body:**

```json
{
  "action": "translate",
  "text": "hello",
  "sourceLang": "en",
  "targetLang": "es",
  "context": "Hello, world!"
}
```

| Field        | Type             | Required | Description                                           |
| ------------ | ---------------- | -------- | ----------------------------------------------------- |
| `action`     | `"translate"`    | Yes      | Must be `"translate"`.                                |
| `text`       | string           | Yes      | The word or phrase to translate.                      |
| `sourceLang` | `"en"` or `"es"` | Yes      | Language of `text`.                                   |
| `targetLang` | `"en"` or `"es"` | Yes      | Language to translate into.                           |
| `context`    | string           | No       | Surrounding sentence to improve translation accuracy. |

**Success response (200):**

```json
{
  "translatedText": "hola",
  "detectedSourceLanguage": "EN"
}
```

**Error responses:**

| Status | Body                                                                 | Cause                                         |
| ------ | -------------------------------------------------------------------- | --------------------------------------------- |
| 400    | `{"error": "Missing required fields: text, sourceLang, targetLang"}` | One or more required fields absent.           |
| 400    | `{"error": "Invalid JSON body"}`                                     | Request body is not valid JSON.               |
| 405    | `{"error": "Method not allowed"}`                                    | Request used a method other than POST or GET. |
| 500    | `{"error": "<message>"}`                                             | DeepL API error or unexpected server error.   |

---

### GET /api/context-reader/dictionary

Retrieves dictionary entries (phonetics, definitions, examples) for a word.

**Query parameters:**

| Parameter | Required | Description                      |
| --------- | -------- | -------------------------------- |
| `word`    | Yes      | The word to look up.             |
| `lang`    | Yes      | Language code: `"en"` or `"es"`. |

**Example request:**

```
GET /api/context-reader/dictionary?word=hello&lang=en
```

**Success response (200):**

```json
[
  {
    "word": "hello",
    "phonetic": "/həˈloʊ/",
    "meanings": [
      {
        "partOfSpeech": "exclamation",
        "definitions": [
          {
            "definition": "Used as a greeting or to begin a telephone conversation.",
            "example": "Hello, I'm ringing to book a taxi.",
            "synonyms": ["hi", "hey", "howdy"]
          }
        ]
      }
    ]
  }
]
```

Returns an empty array `[]` when the word is not found or the language is unsupported.

**Error responses:**

| Status | Body                                                   | Cause                                |
| ------ | ------------------------------------------------------ | ------------------------------------ |
| 400    | `{"error": "Missing required parameters: word, lang"}` | `word` or `lang` query param absent. |

> **Note:** For English words the Worker proxies the request to the free [dictionaryapi.dev](https://dictionaryapi.dev) API. Spanish dictionary lookups return an empty array in the current release.

---

## Privacy

Context Reader is designed to minimise data exposure.

**What is sent to external services:**

| Data                                        | Destination                                         | Purpose                       |
| ------------------------------------------- | --------------------------------------------------- | ----------------------------- |
| The word being translated                   | DeepL (via the Cloudflare Worker)                   | Translation                   |
| The surrounding sentence (optional context) | DeepL (via the Cloudflare Worker)                   | Improved translation accuracy |
| The word being looked up                    | dictionaryapi.dev (direct from browser for English) | Dictionary definitions        |

**What is NOT sent:**

- Your full reading history or browsing activity.
- Which articles you have read.
- Any personally identifiable information.
- Your saved vocabulary list — it stays in your browser.

**Local storage:**

- The on/off preference is stored in `localStorage` (`contextReader:enabled`).
- All saved words are stored in the browser's **IndexedDB** database (`ContextReader` / `vocabulary`). Nothing in the vocabulary list is transmitted to any server.

You can clear all Context Reader data at any time by clearing your browser's site data for freeCodeCamp News.

---

## Performance

| Metric                                    | Target                                                   |
| ----------------------------------------- | -------------------------------------------------------- |
| Cached word lookup (in-memory)            | < 500 ms                                                 |
| Uncached word lookup (network round-trip) | Best-effort; depends on DeepL and dictionary API latency |
| Popup render after translation returns    | < 50 ms                                                  |

The `TranslatorService` caches every `(word, sourceLang, targetLang)` result in memory for one hour. Repeated lookups of the same word within that window are served instantly from the cache without any network requests.
