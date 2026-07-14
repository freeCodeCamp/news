# Task 7: Implement main Context Reader module

**Files:**

- Create: `src/_includes/assets/js/context-reader/context-reader.ts`
- Create: `src/_includes/assets/js/context-reader/context-reader.test.ts`

**Interfaces:**

- Consumes:
  - All types from Task 1
  - StorageManager from Task 2
  - TranslatorService from Task 4
  - PopupComponent from Task 5
  - SidePanelComponent from Task 6
  - Utils (extractSentence, detectLanguage, getSelectedWord) from Task 3
- Produces: `ContextReader` class with methods:
  - `initialize(): Promise<void>`
  - `enable(): void`
  - `disable(): void`
  - `toggleSidePanel(): void`
  - `isEnabled(): boolean`
  - `isInitialized(): boolean`

## Test Cases (5 tests)

1. "initializes successfully"
   - Create ContextReader with worker URL and API key
   - Call await contextReader.initialize()
   - Verify isInitialized() === true

2. "enables feature and adds double-click listener"
   - After initialize(), call contextReader.enable()
   - Verify isEnabled() === true

3. "disables feature and removes double-click listener"
   - After enable(), call contextReader.disable()
   - Verify isEnabled() === false

4. "reads preference from localStorage"
   - Set localStorage.setItem("contextReader:enabled", "true")
   - Create and initialize new ContextReader
   - Verify isEnabled() === true

5. "persists enabled state to localStorage"
   - After initialize(), call enable()
   - Verify localStorage.getItem("contextReader:enabled") === "true"

## Implementation Details

**ContextReader class:**

- Constructor: takes (workerUrl: string, apiKey: string)
- Private properties:
  - storage: StorageManager
  - translator: TranslatorService
  - popup: PopupComponent
  - sidePanel: SidePanelComponent
  - initialized: boolean = false
  - enabled: boolean = false
  - config: ContextReaderConfig
  - pageLanguage: "en" | "es" = "en"

**Constructor:**

```typescript
constructor(workerUrl: string, apiKey: string) {
  this.storage = new StorageManager();
  this.translator = new TranslatorService(workerUrl, apiKey);
  this.popup = new PopupComponent();
  this.sidePanel = new SidePanelComponent(this.storage);
  this.config = {
    enabled: false,
    nativeLanguage: "en",
    learningLanguage: "es"
  };
}
```

**initialize() method (async):**

- Call await this.storage.init()
- Detect page language: this.pageLanguage = detectLanguage(document)
- Load enabled state from localStorage: localStorage.getItem("contextReader:enabled")
- If enabled === "true", call setupEventListeners()
- Set this.initialized = true
- Catch errors and throw

**setupEventListeners() private method:**

- Add dblclick listener to article element (or body if no article)
- In listener:
  - Check if enabled
  - Skip if target is button/input/textarea/a
  - Call getSelectedWord()
  - If selected word exists, call handleWordSelection()

**handleWordSelection() private method:**

- Determine source and target languages (page language and opposite)
- Call popup.show(word, rect)
- Get context by calling extractSentence() on article text
- Call await this.translator.lookup()
- Call popup.updateResult(result)
- Attach onclick to save button to call handleSaveWord()
- Catch errors and call popup.updateError()

**handleSaveWord() private method:**

- Create SavedWord object with:
  - id: `${word.toLowerCase()}-${Date.now()}`
  - word, translation
  - sourceLanguage, targetLanguage
  - contextSentence
  - articleUrl: window.location.href
  - articleTitle: document.title
  - savedAt: new Date().toISOString()
- Call await this.storage.saveWord(savedWord)
- Call popup.hide()
- Log success or show error

**enable() method:**

- If already enabled, return
- Set enabled = true
- Set localStorage "contextReader:enabled" = "true"
- Call setupEventListeners()

**disable() method:**

- Set enabled = false
- Set localStorage "contextReader:enabled" = "false"
- Call popup.hide()
- Call sidePanel.hide()

**toggleSidePanel() method:**

- Call this.sidePanel.toggle()

**isEnabled() method:**

- Return enabled boolean

**isInitialized() method:**

- Return initialized boolean

## Commit Message

`feat: implement main Context Reader module with initialization and event handling`

## Testing

Run: `pnpm test -- context-reader.test.ts`
All 5 tests must pass.
