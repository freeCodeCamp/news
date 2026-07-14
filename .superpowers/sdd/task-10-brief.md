# Task 10: Integrate Context Reader module into post layout

**Files:**

- Modify: `src/_includes/layouts/post.njk`

**Interfaces:**

- Consumes: Existing post layout structure
- Produces: Post layout with Context Reader module initialization

## Implementation Details

Read the existing `src/_includes/layouts/post.njk` file to understand its structure.

Add a script tag (preferably near the end of the file, before closing body tag or in a script section) that:

1. Imports ContextReader class from context-reader module
2. Creates a new ContextReader instance
3. Initializes it
4. Listens for toggle button clicks
5. Updates toggle button state when enabled/disabled
6. Listens for keyboard shortcut (Ctrl+Shift+V or Cmd+Shift+V) to toggle side panel

## Exact Script Content

Add this module script to the post layout:

```nunjucks
<script type="module">
  import { ContextReader } from '/assets/js/context-reader/context-reader.js';

  // Initialize Context Reader when DOM is ready
  const contextReader = new ContextReader(
    '/api/context-reader/translate', // Cloudflare Worker URL
    '' // API key will be added by server
  );

  contextReader.initialize().catch(err => {
    console.warn('Context Reader failed to initialize:', err);
  });

  // Listen for toggle button clicks
  document.addEventListener('DOMContentLoaded', () => {
    const toggleBtn = document.getElementById('context-reader-toggle');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => {
        if (contextReader.isEnabled()) {
          contextReader.disable();
          toggleBtn.setAttribute('aria-pressed', 'false');
          toggleBtn.querySelector('.toggle-state').textContent = 'OFF';
        } else {
          contextReader.enable();
          toggleBtn.setAttribute('aria-pressed', 'true');
          toggleBtn.querySelector('.toggle-state').textContent = 'ON';
        }
      });

      // Set initial button state
      if (contextReader.isEnabled()) {
        toggleBtn.setAttribute('aria-pressed', 'true');
        toggleBtn.querySelector('.toggle-state').textContent = 'ON';
      }
    }
  });

  // Listen for side panel toggle from keyboard shortcut
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'V') {
      contextReader.toggleSidePanel();
    }
  });
</script>
```

## Requirements

- Script is type="module"
- Imports ContextReader from correct path
- Creates ContextReader with worker URL and API key
- Calls initialize()
- Catches initialization errors and logs warning
- Listens for toggle button clicks
- Updates toggle button aria-pressed attribute
- Updates toggle-state span text (ON/OFF)
- Sets initial button state on DOMContentLoaded
- Listens for Ctrl+Shift+V (or Cmd+Shift+V) keyboard shortcut
- Calls toggleSidePanel() on keyboard shortcut

## Commit Message

`feat: integrate Context Reader module into post layout`

## No Testing

This is a layout integration - no automated tests. Manually verify script loads and initializes.
