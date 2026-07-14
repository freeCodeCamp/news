# Task 8: Create Context Reader CSS styles

**Files:**

- Create: `src/_includes/assets/css/context-reader.css`

**Interfaces:**

- Consumes: None (CSS only)
- Produces: Global CSS variables and styles for context-reader feature

## CSS Requirements

Create a file with:

1. **CSS Variables (in :root)**
   - --cr-primary: #0a66c2
   - --cr-text: #1a1a1a
   - --cr-bg: #ffffff
   - --cr-border: #e0e0e0
   - --cr-shadow: 0 2px 8px rgba(0, 0, 0, 0.15)
   - --cr-z-popup: 10000
   - --cr-z-panel: 9999
   - --cr-radius: 8px

2. **Dark Mode Support**
   - @media (prefers-color-scheme: dark) override colors

3. **Global Styles**
   - Highlight interactive text when feature is enabled
   - ::selection styling
   - Focus visible on popup/panel
   - Box sizing for popup/panel
   - Print styles: hide UI when printing
   - Reduced motion support: disable animations

4. **Markup Comments**
   - Title: "Context Reader Feature Styles"
   - Subtitle: "Uses freeCodeCamp Command-line Chic design system"

## Exact Content

```css
/* Context Reader Feature Styles */
/* Uses freeCodeCamp Command-line Chic design system */

:root {
  --cr-primary: #0a66c2;
  --cr-text: #1a1a1a;
  --cr-bg: #ffffff;
  --cr-border: #e0e0e0;
  --cr-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  --cr-z-popup: 10000;
  --cr-z-panel: 9999;
  --cr-radius: 8px;
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  :root {
    --cr-text: #e0e0e0;
    --cr-bg: #1a1a1a;
    --cr-border: #333;
  }
}

/* Highlight interactive text when feature is enabled */
article p:has(+ [data-context-reader-enabled='true']),
article li:has(+ [data-context-reader-enabled='true']) {
  cursor: text;
}

/* Selected text styling */
::selection {
  background-color: rgba(10, 102, 194, 0.2);
}

/* Accessibility: Focus visible on interactive elements */
#context-reader-popup:focus-visible,
#context-reader-side-panel:focus-visible {
  outline: 2px solid var(--cr-primary);
  outline-offset: 2px;
}

/* Ensure popup and panel don't break layout */
#context-reader-popup,
#context-reader-side-panel {
  box-sizing: border-box;
}

#context-reader-popup *,
#context-reader-side-panel * {
  box-sizing: border-box;
}

/* Print styles: hide context reader UI when printing */
@media print {
  #context-reader-popup,
  #context-reader-side-panel {
    display: none !important;
  }
}

/* Reduced motion support */
@media (prefers-color-scheme: dark) {
  #context-reader-popup,
  #context-reader-side-panel {
    animation: none !important;
    transition: none !important;
  }
}
```

## Commit Message

`feat: add base CSS styles for context-reader feature`

## Validation

File should exist at correct path and contain valid CSS (no syntax errors).
