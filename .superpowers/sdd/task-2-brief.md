# Task 2: Implement IndexedDB storage wrapper

**Files:**

- Create: `src/_includes/assets/js/context-reader/storage.ts`
- Create: `src/_includes/assets/js/context-reader/storage.test.ts`

**Interfaces:**

- Consumes: `SavedWord` from Task 1
- Produces: `StorageManager` class with methods:
  - `init(): Promise<void>`
  - `saveWord(word: SavedWord): Promise<void>`
  - `getWords(): Promise<SavedWord[]>`
  - `deleteWord(id: string): Promise<void>`
  - `exportAsCSV(): Promise<string>`
  - `isInitialized(): boolean` (helper)

## Test Cases to Implement

Four test cases total:

1. **initializes database** - calls `await manager.init()` and verifies `manager.isInitialized()` returns true
2. **saves a word to database** - saves a word, retrieves it, and verifies it exists
3. **deletes a word from database** - saves word, deletes it, retrieves list, verifies empty
4. **exports words as CSV** - saves word, exports to CSV, verifies CSV contains word/translation/context data

## Implementation Details

**StorageManager class:**

- DB_NAME = "ContextReader"
- STORE_NAME = "vocabulary"
- DB_VERSION = 1
- Use IndexedDB object store with keyPath "id"
- Create index on "word" and "savedAt"
- Sort results by savedAt descending (newest first)
- CSV export with proper escaping (quotes if contains comma, quote, newline)

**Exact Code Structure:**

Create `src/_includes/assets/js/context-reader/storage.ts`:

```typescript
import type { SavedWord } from "./types";

const DB_NAME = "ContextReader";
const STORE_NAME = "vocabulary";
const DB_VERSION = 1;

export class StorageManager {
  private db: IDBDatabase | null = null;

  async init(): Promise<void> { ... }
  isInitialized(): boolean { ... }
  async saveWord(word: SavedWord): Promise<void> { ... }
  async getWords(): Promise<SavedWord[]> { ... }
  async deleteWord(id: string): Promise<void> { ... }
  async exportAsCSV(): Promise<string> { ... }
  private escapeCSVField(field: string): string { ... }
}
```

Create `src/_includes/assets/js/context-reader/storage.test.ts`:

```typescript
import { StorageManager } from "./storage";
import type { SavedWord } from "./types";

describe("StorageManager", () => {
  let manager: StorageManager;

  beforeEach(() => {
    manager = new StorageManager();
  });

  afterEach(async () => {
    // Clean up IndexedDB after each test
  });

  test("initializes database", async () => { ... });
  test("saves a word to database", async () => { ... });
  test("deletes a word from database", async () => { ... });
  test("exports words as CSV", async () => { ... });
});
```

## Testing Command

Run tests with: `pnpm test -- storage.test.ts`

All 4 tests must pass before commit.

## Commit Message

`feat: implement IndexedDB storage manager for vocabulary`

## Notes

- IndexedDB is browser API, so tests will use jest with jsdom environment (already configured in project)
- Use Promise-based wrapper around IndexedDB callbacks
- Each method should have proper error handling with try/catch
- CSV export should handle newlines and quotes in fields properly
