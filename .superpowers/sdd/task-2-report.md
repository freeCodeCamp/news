# Task 2 Report: IndexedDB Storage Manager

## Status

**DONE**

## What Was Implemented

### Files Created

1. **`src/_includes/assets/js/context-reader/storage.ts`**
   - `StorageManager` class with DB_NAME="ContextReader", STORE_NAME="vocabulary", DB_VERSION=1
   - `init()` — opens IndexedDB, creates object store with keyPath "id", creates indices on "word" and "savedAt"
   - `isInitialized()` — returns true if db connection is open
   - `saveWord(word)` — uses `store.put()` for upsert semantics
   - `getWords()` — retrieves all words via savedAt index, sorts descending (newest first)
   - `deleteWord(id)` — deletes by primary key
   - `exportAsCSV()` — builds CSV with header row, escapes fields containing commas/quotes/newlines
   - `escapeCSVField()` — private helper that wraps field in double-quotes and escapes embedded quotes

2. **`src/_includes/assets/js/context-reader/storage.test.ts`**
   - 4 test cases: initializes database, saves a word to database, deletes a word from database, exports words as CSV
   - Uses `fake-indexeddb`'s `IDBFactory` for per-test isolation (fresh instance in `beforeEach`)
   - `structuredClone` polyfill for jsdom environments that lack it

3. **`tools/jest-ts-transform.cjs`**
   - Custom Jest transformer using Node 24's built-in `stripTypeScriptTypes` from `node:module`
   - Enables Jest to process `.ts` files without needing `ts-jest` or `@babel/preset-typescript`

### Configuration Changes

**`jest.config.js`** updated to add:

- `transform`: routes `*.ts` and `*.tsx` files through `tools/jest-ts-transform.cjs`
- `extensionsToTreatAsEsm: ['.ts']`: treats TypeScript files as ES modules
- `moduleNameMapper`: remaps `./foo.js` imports to `./foo` so Jest resolves `.ts` source files when imports use `.js` extensions (standard ESM TypeScript pattern)

**`package.json` / `pnpm-lock.yaml`**: added `fake-indexeddb@6.2.5` as a dev dependency.

## Test Results

**Command:** `pnpm test -- storage.test.ts`

**Output:**

```
> cross-env ELEVENTY_ENV=ci NODE_OPTIONS=--experimental-vm-modules jest -- storage.test.ts

Test Suites: 1 passed, 1 total
Tests:       4 passed, 4 total
Snapshots:   0 total
Time:        0.346 s
Ran all test suites matching storage.test.ts.
```

All 4 test cases pass. Existing tests (e.g., dark-mode.test.js) continue to pass unchanged.

## Implementation Notes

- **No ts-jest or Babel TypeScript plugin needed**: Node 24 provides `stripTypeScriptTypes` in `node:module` which strips type annotations while preserving source positions. This is used via a minimal custom transformer.
- **jsdom does not include IndexedDB**: jsdom 26.x has no IndexedDB implementation. `fake-indexeddb` provides a full spec-compliant implementation (not a mock/spy) suitable for testing real IndexedDB logic.
- **Per-test isolation**: Each test sets `globalThis.indexedDB = new IDBFactory()` in `beforeEach`, giving each test a completely fresh database instance and avoiding cross-test contamination without needing `deleteDatabase` cleanup (which caused timeouts when the previous connection was still open).
- **Prettier hook**: The pre-commit hook reformatted some long `if (!this.db) throw` lines to two-line form. Final committed code reflects that formatting.

## Commit SHA

`868309c`

Full: `868309c feat: implement IndexedDB storage manager for vocabulary`
