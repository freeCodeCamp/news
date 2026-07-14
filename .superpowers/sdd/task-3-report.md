# Task 3 Report: Utility Functions for Sentence Extraction and Language Detection

## Status: COMPLETE

## Files Created

- `src/_includes/assets/js/context-reader/utils.ts`
- `src/_includes/assets/js/context-reader/utils.test.ts`

## Functions Implemented

1. `extractSentence(text, wordIndex)` — finds sentence boundaries (. ! ?) searching backward and forward from wordIndex
2. `detectLanguage(element)` — checks html lang attribute, then og:locale and content-language meta tags, defaults to "en"
3. `getContextWindow(element, radius)` — returns substring of 50 characters around middle of element's text content
4. `getSelectedWord()` — uses window.getSelection() and getBoundingClientRect(), returns null if nothing selected
5. `generateWordId(word, savedAt)` — returns `${word.toLowerCase()}-${Date.now()}`

## Test Results

**Command:** `pnpm test -- utils.test.ts`

**Output:**

```
> eleventy-news@1.0.0 test
> cross-env ELEVENTY_ENV=ci NODE_OPTIONS=--experimental-vm-modules jest -- utils.test.ts

Test Suites: 1 passed, 1 total
Tests:       7 passed, 7 total
Snapshots:   0 total
Time:        0.236 s
Ran all test suites matching utils.test.ts.
```

All 7 tests pass across 3 describe blocks:

- `extractSentence` — 3 tests
- `detectLanguage` — 3 tests
- `getContextWindow` — 1 test

## Commit

**SHA:** `20fe112`
**Message:** `feat: implement utility functions for sentence extraction and language detection`
