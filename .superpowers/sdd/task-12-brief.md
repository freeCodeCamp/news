# Task 12: Add global CSS import

**Files:**

- Modify: `src/_includes/assets/css/global.css`

**Interfaces:**

- Consumes: context-reader.css (created in Task 8)
- Produces: Global stylesheet with context-reader styles imported

## Implementation Details

Read the existing `src/_includes/assets/css/global.css` file.

At the end of the file, add this import statement:

```css
/* Import Context Reader styles */
@import 'context-reader.css';
```

That's it - just import the context-reader.css file created in Task 8.

## Requirements

- Import statement added at end of global.css
- Uses @import directive
- Path is "context-reader.css" (relative to global.css)
- Comment above import explaining what it is

## Commit Message

`feat: import context-reader styles into global stylesheet`

## Verification

Just verify the import line exists in the file.
