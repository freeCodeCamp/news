// src/_includes/assets/js/context-reader/context-reader.ts

import type { SavedWord, ContextReaderConfig, LookupResult } from './types.js';
import { StorageManager } from './storage.js';
import { TranslatorService } from './translator.js';
import { PopupComponent } from './popup.js';
import { SidePanelComponent } from './side-panel.js';
import { extractSentence, detectLanguage, getSelectedWord } from './utils.js';

const STORAGE_KEY = 'contextReader:enabled';

export class ContextReader {
  private storage: StorageManager;
  private translator: TranslatorService;
  private popup: PopupComponent;
  private sidePanel: SidePanelComponent;
  private initialized: boolean = false;
  private enabled: boolean = false;
  private config: ContextReaderConfig;
  private pageLanguage: 'en' | 'es' = 'en';

  // Keep a reference so we can remove the listener on disable
  private boundDblClickHandler: ((event: Event) => void) | null = null;

  constructor(workerUrl: string, apiKey: string) {
    this.storage = new StorageManager();
    this.translator = new TranslatorService(workerUrl, apiKey);
    this.popup = new PopupComponent();
    this.sidePanel = new SidePanelComponent(this.storage);
    this.config = {
      enabled: false,
      nativeLanguage: 'en',
      learningLanguage: 'es'
    };
  }

  async initialize(): Promise<void> {
    try {
      await this.storage.init();
      this.pageLanguage = detectLanguage(document);

      const storedEnabled = localStorage.getItem(STORAGE_KEY);
      if (storedEnabled === 'true') {
        this.enabled = true;
        this.setupEventListeners();
      }

      this.initialized = true;
    } catch (error) {
      throw error;
    }
  }

  private setupEventListeners(): void {
    const target =
      (document.querySelector('article') as HTMLElement | null) ??
      document.body;

    this.boundDblClickHandler = (event: Event) => {
      if (!this.enabled) return;

      const el = event.target as HTMLElement;
      const tag = el.tagName.toLowerCase();
      if (
        tag === 'button' ||
        tag === 'input' ||
        tag === 'textarea' ||
        tag === 'a'
      ) {
        return;
      }

      const selected = getSelectedWord();
      if (selected) {
        void this.handleWordSelection(selected.word, selected.rect);
      }
    };

    target.addEventListener('dblclick', this.boundDblClickHandler);
  }

  private async handleWordSelection(
    word: string,
    rect: DOMRect
  ): Promise<void> {
    const sourceLang = this.pageLanguage;
    const targetLang: 'en' | 'es' = sourceLang === 'en' ? 'es' : 'en';

    this.popup.show(word, { x: rect.left, y: rect.bottom });

    try {
      const articleEl = document.querySelector('article') as HTMLElement | null;
      const articleText =
        articleEl?.textContent ?? document.body.textContent ?? '';
      const wordIndex = articleText.indexOf(word);
      const contextSentence =
        wordIndex >= 0 ? extractSentence(articleText, wordIndex) : '';

      const result: LookupResult = await this.translator.lookup(
        word,
        contextSentence,
        sourceLang,
        targetLang
      );

      this.popup.updateResult(result);

      const saveBtn = this.popup.getSaveButton();
      if (saveBtn) {
        saveBtn.onclick = () => {
          void this.handleSaveWord(
            word,
            result.translation,
            sourceLang,
            targetLang,
            contextSentence
          );
        };
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Translation failed';
      this.popup.updateError(message);
    }
  }

  private async handleSaveWord(
    word: string,
    translation: string,
    sourceLanguage: 'en' | 'es',
    targetLanguage: 'en' | 'es',
    contextSentence: string
  ): Promise<void> {
    const savedWord: SavedWord = {
      id: `${word.toLowerCase()}-${Date.now()}`,
      word,
      translation,
      sourceLanguage,
      targetLanguage,
      contextSentence,
      articleUrl: window.location.href,
      articleTitle: document.title,
      savedAt: new Date().toISOString()
    };

    try {
      await this.storage.saveWord(savedWord);
      this.popup.hide();
      console.log(`Word "${word}" saved successfully.`);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to save word';
      console.error(message);
    }
  }

  enable(): void {
    if (this.enabled) return;
    this.enabled = true;
    localStorage.setItem(STORAGE_KEY, 'true');
    this.setupEventListeners();
  }

  disable(): void {
    this.enabled = false;
    localStorage.setItem(STORAGE_KEY, 'false');
    this.popup.hide();
    this.sidePanel.hide();
  }

  toggleSidePanel(): void {
    this.sidePanel.toggle();
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  isInitialized(): boolean {
    return this.initialized;
  }
}
