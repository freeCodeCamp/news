# Task 3: Implement utility functions (sentence extraction and language detection)

**Files:**

- Create: `src/_includes/assets/js/context-reader/utils.ts`
- Create: `src/_includes/assets/js/context-reader/utils.test.ts`

**Interfaces:**

- Consumes: none
- Produces:
  - `extractSentence(text: string, wordIndex: number): string`
  - `detectLanguage(element: HTMLElement | Document): "en" | "es"`
  - `getContextWindow(element: HTMLElement, radius: number): string`
  - `getSelectedWord(): { word: string; rect: DOMRect } | null`
  - `generateWordId(word: string, savedAt: string): string`

## Test Cases (3 describe blocks, 7 tests total)

**extractSentence describe block (3 tests):**

1. "extracts a single sentence containing the word"
   - Input: "Hello world. This is a test. Another sentence here."
   - wordIndex = text.indexOf("test")
   - Expected: "This is a test."

2. "handles word at the beginning of text"
   - Input: "Hello world. Another sentence."
   - wordIndex = 0
   - Expected: "Hello world."

3. "handles word at the end of text"
   - Input: "First sentence. Last"
   - wordIndex = text.indexOf("Last")
   - Expected: "Last"

**detectLanguage describe block (3 tests):**

1. "detects English from meta tag"
   - Create meta property="og:locale" content="en_US"
   - Expected: "en"

2. "detects Spanish from html lang attribute"
   - Create html element with lang="es"
   - Expected: "es"

3. "defaults to English when language cannot be determined"
   - Create empty div
   - Expected: "en"

**getContextWindow describe block (1 test):**

1. "returns text content around selected element"
   - Create paragraph with text
   - Expected: contains some of that text

## Implementation Details

**extractSentence:**

- Finds sentence boundaries (. ! ?)
- Searches backward from wordIndex to find sentence start
- Searches forward to find sentence end
- Trims whitespace
- Returns the sentence including punctuation

**detectLanguage:**

- Check html element lang attribute
- If not found, check meta tag (og:locale or content-language)
- Default to "en" if nothing found

**getContextWindow:**

- Gets textContent from element
- Returns substring of 50 characters around middle of text

**getSelectedWord:**

- Gets window.getSelection()
- Returns { word: selected text, rect: bounding rectangle }
- Returns null if nothing selected

**generateWordId:**

- Creates ID from word + timestamp
- Format: `${word.toLowerCase()}-${Date.now()}`

## Commit Message

`feat: implement utility functions for sentence extraction and language detection`

## Testing

Run: `pnpm test -- utils.test.ts`
All 7 tests must pass.
