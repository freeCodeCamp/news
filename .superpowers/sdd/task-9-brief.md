# Task 9: Integrate toggle into navigation

**Files:**

- Modify: `src/_includes/partials/site-nav.njk`

**Interfaces:**

- Consumes: Existing navigation template structure
- Produces: Navigation with Context Reader toggle button

## Implementation Details

Read the existing `src/_includes/partials/site-nav.njk` file to understand its structure.

Find a suitable location in the navigation list (typically after other navigation items or at the end of the main nav ul/ol) and add this toggle button:

```nunjucks
<li>
  <button
    id="context-reader-toggle"
    class="context-reader-toggle"
    aria-label="Toggle Context Reader mode"
    aria-pressed="false"
  >
    <span class="toggle-label">Context Reader</span>
    <span class="toggle-state" aria-live="polite">OFF</span>
  </button>
</li>
```

Optionally add inline styles or reference in a style tag in the template:

```css
.context-reader-toggle {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: none;
  border: 1px solid var(--cr-border, #e0e0e0);
  border-radius: 4px;
  padding: 6px 12px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  color: var(--cr-text, #1a1a1a);
  transition: all 0.2s;
}

.context-reader-toggle:hover {
  background: var(--cr-bg, #ffffff);
  border-color: var(--cr-primary, #0a66c2);
}

.context-reader-toggle[aria-pressed='true'] {
  background: var(--cr-primary, #0a66c2);
  color: white;
  border-color: var(--cr-primary, #0a66c2);
}

.toggle-state {
  font-size: 12px;
  font-weight: 600;
}
```

## Requirements

- Button has id="context-reader-toggle"
- Button has class="context-reader-toggle"
- Button has aria-label
- Button has aria-pressed="false" initially
- Button contains toggle-label span with text "Context Reader"
- Button contains toggle-state span with initial text "OFF"
- toggle-state span has aria-live="polite" for screen readers
- Styles applied (inline or referenced)
- Added to navigation list

## Commit Message

`feat: add Context Reader toggle to navigation`

## No Testing

This is a template modification - no tests needed. Just verify the button renders in the navigation.
