# Task 6: Implement side panel component (vocabulary review)

**Files:**

- Create: `src/_includes/assets/js/context-reader/side-panel.ts`
- Create: `src/_includes/assets/js/context-reader/side-panel.test.ts`

**Interfaces:**

- Consumes:
  - `SavedWord` from Task 1
  - `StorageManager` from Task 2
- Produces: `SidePanelComponent` class with methods:
  - `toggle(): void`
  - `show(): void`
  - `hide(): void`
  - `refresh(): Promise<void>`
  - `getShadowRoot(): ShadowRoot`
  - `getExportButton(): HTMLElement | null`
  - `isVisible(): boolean`

## Test Cases (4 tests)

1. "creates panel with shadow DOM"
   - Create SidePanelComponent(storage)
   - Verify getShadowRoot() returns non-null ShadowRoot

2. "shows and hides panel"
   - Call show(), verify isVisible() === true
   - Call hide(), verify isVisible() === false

3. "toggles panel visibility"
   - Call toggle(), verify isVisible() === true
   - Call toggle(), verify isVisible() === false

4. "displays saved words"
   - Save a word to storage: { word: "hello", translation: "hola", ... }
   - Show panel and call refresh()
   - Verify shadowRoot text contains "hello" and "hola"

5. "has export button"
   - Show panel
   - Get export button via getExportButton()
   - Verify button exists and is truthy

## Implementation Details

**SidePanelComponent class:**

- Constructor takes StorageManager as parameter
- Private container: HTMLElement | null
- Private shadowRoot: ShadowRoot | null
- Private visible: boolean = false
- Private storage: StorageManager
- Private words: SavedWord[] = []

**Constructor:**

- Store storage reference
- Call createShadowDOM()

**createShadowDOM():**

- Creates div with id="context-reader-side-panel"
- Attaches shadow root in open mode
- Creates style element with CSS
- Creates panel structure with:
  - Panel header: h2 "Vocabulary", close button
  - Panel controls: export button, search input
  - Words list (.words-list) empty initially
  - Empty state message (shown when no words)
- Event listeners:
  - Close button → hide()
  - Export button → handleExport()
  - Document keydown Escape → hide()

**CSS:**

- Fixed positioning right: 0, top: 0
- Width 350px, height 100vh
- Dark mode support
- Flexbox layout for header/controls/list
- Word item cards with delete button
- Hover states

**show() method:**

- Append to body if needed
- Set display: block
- Set visible = true
- Call refresh()

**hide() method:**

- Set display: none
- Set visible = false

**toggle() method:**

- If visible, call hide(); else call show()

**refresh() method (async):**

- Call storage.getWords()
- Store in this.words
- Call render()

**render() private method:**

- If words.length === 0:
  - Clear words-list
  - Show empty-state (display: block)
- Otherwise:
  - Hide empty-state
  - Build HTML for each word with:
    - Word name (word-item-word)
    - Translation (word-item-translation)
    - Context sentence (word-item-context) in quotes
    - Save date and link to article (word-item-footer)
    - Delete button (delete-btn) with ✕
  - Attach delete handlers to each delete button

**handleExport() private method:**

- Call storage.exportAsCSV()
- Create Blob from CSV text
- Create ObjectURL
- Create anchor element
- Set href, download="context-reader-vocabulary-{date}.csv"
- Append to body, click, remove
- Catch errors and show alert

**getShadowRoot:**

- Return shadowRoot, throw if not initialized

**getExportButton:**

- Return querySelector(".export-btn") from shadow root

**isVisible:**

- Return visible boolean

## Commit Message

`feat: implement side panel for vocabulary review and export`

## Testing

Run: `pnpm test -- side-panel.test.ts`
All tests must pass. Must create fresh StorageManager in beforeEach.
