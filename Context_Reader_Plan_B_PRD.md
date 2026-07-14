# Context Reader — Plan B PRD

## Project

**Context Reader Mode for freeCodeCamp News**

## Vision

> **A reading companion that helps English and Spanish learners acquire vocabulary naturally while reading real websites.**

This project integrates directly into the freeCodeCamp News publication as an **opt-in reading mode**. By default it is **OFF** so the existing reading experience is unchanged.

---

# MVP Scope

Support one language pair only:

- English → Spanish
- Spanish → English

Users configure:

- Native Language
- Learning Language

The page language is detected automatically.

---

# Goals

- Keep learners immersed.
- No tab switching.
- Context-aware word lookup.
- Save vocabulary while reading.
- Zero impact for readers who do not enable the feature.

---

# Core Loop

1. Learner enables **Context Reader** from the navigation.
2. Learner double-clicks an unfamiliar word.
3. Popup appears showing:
   - Translation
   - Meaning in learning language
   - Meaning in native language
   - Pronunciation
   - Example sentence
   - Save button
4. Clicking **Save** stores the word, translation, context sentence, article URL, and timestamp.
5. Toggle button opens the vocabulary side panel.
6. Review or delete saved words.
7. Export vocabulary as CSV.

---

# Navigation

Add an opt-in toggle to the News navigation.

```text
Context Reader   OFF
```

Default:

- Disabled
- Preference persisted locally

---

# User Experience

When OFF:

- Site behaves exactly as today.

When ON:

- Double-click activates lookup.
- Floating popup appears.
- Vocabulary side panel becomes available.

---

# Architecture

```text
freeCodeCamp News
        │
        ▼
 Context Reader Toggle
        │
        ▼
 Double-click word
        │
        ▼
 Context Reader Module
        │
        ▼
 Extract sentence context
        │
        ▼
 Cloudflare Worker
   ├── DeepL API
   └── Dictionary API
        │
        ▼
 Floating Popup
        │
        ▼
 IndexedDB
        │
        ▼
 Vocabulary Side Panel
```

---

# Storage

Use IndexedDB.

```ts
interface SavedWord {
  id: string;
  word: string;
  translation: string;
  sourceLanguage: 'en' | 'es';
  targetLanguage: 'en' | 'es';
  contextSentence: string;
  articleUrl: string;
  savedAt: string;
}
```

---

# Repository Structure

```text
src/
  features/
    context-reader/
      components/
        popup/
        side-panel/
        toggle/
      services/
        translator.ts
        dictionary.ts
      storage/
        vocabulary-db.ts
      utils/
        extract-sentence.ts
        detect-language.ts
      styles/
      context-reader.ts
```

---

# Technical Stack

Frontend

- TypeScript
- Existing freeCodeCamp News architecture
- Shadow DOM popup
- IndexedDB

Backend

- Cloudflare Workers

Translation

- DeepL (context-aware)

Dictionary

- Free Dictionary API

---

# Privacy

Only send:

- Selected word
- Minimal sentence context
- Language metadata

Never send:

- Entire article
- User content unrelated to the lookup

---

# Success Metrics

- Opt-in only
- <500ms cached lookup
- Accurate contextual translations
- Minimal disruption to reading

---

# Styling

Use the **commanda-line-chi** skill for the complete design system, reusable components, spacing, typography, colors, accessibility, and overall UI consistency so the feature feels native to freeCodeCamp News.
