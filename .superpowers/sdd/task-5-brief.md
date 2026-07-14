# Task 5: Implement popup component (Shadow DOM)

**Files:**

- Create: `src/_includes/assets/js/context-reader/popup.ts`
- Create: `src/_includes/assets/js/context-reader/popup.test.ts`

**Interfaces:**

- Consumes:
  - `LookupResult`, `PopupState` from Task 1
  - `TranslatorService` from Task 4 (for typing, not used in this task)
- Produces: `PopupComponent` class with methods:
  - `show(word: string, position: { x: number; y: number }): void`
  - `hide(): void`
  - `updateResult(result: LookupResult): void`
  - `updateError(message: string): void` (helper)
  - `getShadowRoot(): ShadowRoot`
  - `getSaveButton(): HTMLElement | null`
  - `isVisible(): boolean`

## Test Cases (6 tests)

1. "creates shadow DOM popup on initialization"
   - Create PopupComponent
   - Verify getShadowRoot() returns non-null ShadowRoot

2. "shows popup at specified position"
   - Call show("hello", { x: 100, y: 200 })
   - Verify isVisible() returns true

3. "hides popup and removes from DOM"
   - Call show(), then hide()
   - Verify isVisible() returns false

4. "updates popup with lookup result"
   - Call show(), then updateResult()
   - Verify shadowRoot contains translation text from result
   - Verify shadowRoot contains word from result

5. "has accessible save button"
   - Call show()
   - Get save button via getSaveButton()
   - Verify button exists and has aria-label attribute

6. "closes on escape key press"
   - Call show()
   - Simulate keydown event with key="Escape"
   - Verify popup is no longer visible

## Implementation Details

**PopupComponent class:**

- Private container: HTMLElement | null
- Private shadowRoot: ShadowRoot | null
- Private visible: boolean = false
- Private currentResult: LookupResult | null = null

**Constructor:**

- Calls createShadowDOM()

**createShadowDOM():**

- Creates div with id="context-reader-popup"
- Attaches shadow root in open mode
- Creates style element with CSS
- Creates popup container div with role="dialog" aria-label="Word definition popup"
- Builds popup structure with:
  - Close button (.close-btn) with ✕ character, aria-label
  - Loading div (.loading)
  - Result div (.result) hidden
  - Error div (.error) hidden
  - Save button (.save-btn) with aria-label
- Adds event listeners:
  - Close button click → hide()
  - Document keydown → hide() if Escape and visible

**Styles (getStyles()):**

- CSS variables for colors (primary, text, bg, border, shadow)
- Fixed positioning, z-index: 10000
- Max-width 320px, padding 16px
- Dark mode support (@media prefers-color-scheme: dark)
- Rounded corners, box shadow
- Button styling with hover/active states
- Loading/result/error states with display: none

**show method:**

- Append container to document.body if not already there
- Set position: left, top from x, y + offsets (10px)
- Show loading state (.loading display: block, .result/.error display: none)
- Set visible = true

**hide method:**

- Remove container from DOM if present
- Set visible = false

**updateResult method:**

- Store result in currentResult
- Hide loading state
- Update .result div innerHTML with:
  - Word name (word-entry div)
  - Translation (translation div with →)
  - Pronunciation if available (definition div)
  - First definition if available
- Show result div (display: block)

**getSaveButton:**

- Returns querySelector(".save-btn") from shadow root

**getShadowRoot:**

- Returns shadowRoot, throws if not initialized

**isVisible:**

- Returns visible boolean

## Commit Message

`feat: implement popup component with Shadow DOM`

## Testing

Run: `pnpm test -- popup.test.ts`
All 6 tests must pass. Use jsdom environment for DOM APIs.
