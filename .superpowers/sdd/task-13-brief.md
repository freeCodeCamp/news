# Task 13: Write integration/E2E tests

**Files:**

- Create: `cypress/e2e/english/context-reader.cy.ts`

**Interfaces:**

- Consumes: Cypress testing framework (already configured)
- Produces: E2E test suite for Context Reader feature

## Test Cases (5 describe/test blocks)

### Main describe: "Context Reader Feature"

**beforeEach:** cy.visit("/")

1. **displays toggle button in navigation**
   - cy.get("#context-reader-toggle").should("exist")
   - cy.get("#context-reader-toggle").should("contain", "Context Reader")

2. **toggles context reader on and off**
   - Get toggle button, verify aria-pressed="false"
   - Click toggle button
   - Verify aria-pressed="true"
   - Verify it contains "ON"

3. **persists toggle state to localStorage**
   - Click toggle button to enable
   - cy.visit("/") to reload
   - Verify toggle button aria-pressed="true"

4. **context "when enabled"** (nested describe)
   - beforeEach: click toggle button to enable

   a. "shows popup on double-click of article text"
   - Visit a test article page with article content
   - Double-click a word in the article
   - Verify #context-reader-popup is visible

   b. "can save a word from the popup"
   - Double-click a word in article
   - Wait for popup to appear
   - Click save button
   - Verify popup closes

5. **opens vocabulary panel with keyboard shortcut**
   - Enable context reader (click toggle)
   - Type keyboard shortcut: Ctrl+Shift+V (or Cmd+Shift+V on Mac)
   - Verify #context-reader-side-panel is visible

## Implementation Notes

- Use @cypress/schematic patterns (cy.get, cy.visit, cy.click, cy.should, etc.)
- Test is for English locale
- Path: cypress/e2e/english/context-reader.cy.ts
- Can mock article content or use existing test article
- Focus on user interactions: toggle, double-click, keyboard
- Use realistic selectors: #context-reader-toggle, #context-reader-popup, #context-reader-side-panel

## Commit Message

`test: add E2E tests for Context Reader feature`

## Running Tests

```
pnpm cypress:run:english
```

Tests should run without errors (may fail if dependencies not deployed, but should not have syntax errors).
