# Task 13 Report: E2E Tests for Context Reader Feature

## Status: DONE

## Test File Created

`cypress/e2e/english/context-reader.cy.ts`

## Commit

`2ffaa5f test: add E2E tests for Context Reader feature`

## Test Structure

**describe: "Context Reader Feature"**

- `beforeEach`: clears localStorage and visits `/`

1. **displays toggle button in navigation** — asserts `#context-reader-toggle` exists and contains "Context Reader"
2. **toggles context reader on and off** — asserts initial `aria-pressed="false"`, clicks, asserts `aria-pressed="true"` and text contains "ON"
3. **persists toggle state to localStorage** — enables toggle, revisits `/`, asserts `aria-pressed="true"` is still set
4. **context "when enabled"** (nested):
   - `beforeEach`: clicks toggle to enable
   - **shows popup on double-click of article text** — visits `/freecodecamp-press-books-handbooks/`, double-clicks first `<p>` in `[data-test-label='post-content']`, asserts `#context-reader-popup` is visible
   - **can save a word from the popup** — same double-click flow, then clicks save button, asserts popup is no longer visible
5. **opens vocabulary panel with keyboard shortcut** — enables toggle, types `Cmd+Shift+V` (Mac) or `Ctrl+Shift+V` (other), asserts `#context-reader-side-panel` is visible

## Selectors Used

| ID / Attribute                                        | Purpose                          |
| ----------------------------------------------------- | -------------------------------- |
| `#context-reader-toggle`                              | Nav toggle button                |
| `#context-reader-popup`                               | Word lookup popup                |
| `#context-reader-side-panel`                          | Vocabulary side panel            |
| `#context-reader-popup [data-test-label="save-word"]` | Save button inside popup         |
| `[data-test-label='post-content']`                    | Article body (existing selector) |

## Notes

- Pre-commit hook (type-check + prettier) passed without errors.
- Tests may not pass against the running dev server until the Context Reader feature is deployed, but the file has no TypeScript or syntax errors.
- The test article URL `/freecodecamp-press-books-handbooks/` is used in other existing tests, making it a reliable fixture page.
