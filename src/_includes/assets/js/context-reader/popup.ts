// src/_includes/assets/js/context-reader/popup.ts

import type { LookupResult } from './types.js';

export class PopupComponent {
  private container: HTMLElement | null = null;
  private shadowRoot: ShadowRoot | null = null;
  private visible: boolean = false;
  private currentResult: LookupResult | null = null;
  private boundOutsideClickHandler: ((event: MouseEvent) => void) | null = null;

  constructor() {
    this.createShadowDOM();
  }

  private getStyles(): string {
    return `
      :host {
        all: initial;
        font-family: 'Roboto Mono', Menlo, Consolas, monospace;
      }

      .popup {
        /* FCC Command-line Chic - Dark Mode (Primary) */
        --bg-primary: #0a0a23;
        --bg-secondary: #1b1b32;
        --bg-tertiary: #2a2a40;
        --text-primary: #f5f6f7;
        --text-bright: #ffffff;
        --text-muted: #858591;
        --text-subtle: #d0d0d5;
        --border-color: #3b3b4f;
        --accent-blue: #99c9ff;
        --accent-yellow: #f1be32;
        --accent-red: #ffadad;
        --focus-ring: #198eee;

        position: fixed;
        z-index: 10000;
        right: 32px;
        bottom: 32px;
        width: min(376px, calc(100vw - 32px));
        max-height: min(560px, calc(100vh - 64px));
        overflow-y: auto;
        background: var(--bg-primary);
        border: 1px solid var(--border-color);
        border-radius: 4px;
        box-shadow: 0 16px 48px rgba(10, 10, 35, 0.35);
        padding: 24px 20px 20px;
        font-size: 18px;
        line-height: 1.5;
        color: var(--text-primary);
      }

      @media (prefers-color-scheme: light) {
        .popup {
          --bg-primary: #ffffff;
          --bg-secondary: #f5f6f7;
          --text-primary: #0a0a23;
          --text-bright: #0a0a23;
          --text-muted: #3b3b4f;
          --text-subtle: #1b1b32;
          --border-color: #858591;
          --accent-blue: #002ead;
          --accent-yellow: #4d3800;
          --accent-red: #850000;
        }
      }

      .close-btn {
        position: absolute;
        top: 14px;
        right: 14px;
        background: none;
        border: none;
        cursor: pointer;
        font-size: 28px;
        line-height: 1;
        color: var(--text-muted);
        padding: 4px;
        border-radius: 4px;
        transition: color 0.2s;
      }

      .close-btn:hover {
        color: var(--text-primary);
      }

      .close-btn:focus-visible {
        outline: 2px solid var(--focus-ring);
        outline-offset: 2px;
      }

      .loading {
        display: none;
        padding: 8px 0;
        color: var(--text-muted);
        font-size: 16px;
      }

      .result {
        display: none;
        padding-top: 0;
      }

      .error {
        display: none;
        padding: 8px 0;
        color: var(--accent-red);
        font-size: 16px;
      }

      .word-entry {
        font-weight: 700;
        font-size: 30px;
        color: var(--accent-blue);
        line-height: 1.2;
        margin-bottom: 4px;
        padding-right: 40px;
      }

      .pronunciation {
        color: var(--text-muted);
        font-size: 16px;
        font-style: italic;
        margin-bottom: 18px;
      }

      .translation {
        font-size: 22px;
        font-weight: 700;
        color: var(--text-primary);
        margin-bottom: 18px;
      }

      .part-of-speech {
        color: var(--text-muted);
        font-size: 14px;
        letter-spacing: 0;
        margin-bottom: 14px;
        text-transform: uppercase;
      }

      .definitions {
        border-bottom: 1px solid var(--border-color);
        margin-bottom: 16px;
        padding-bottom: 16px;
      }

      .definition {
        color: var(--text-subtle);
        display: grid;
        font-size: 16px;
        gap: 12px;
        grid-template-columns: 28px 1fr;
        line-height: 1.55;
        margin-bottom: 14px;
      }

      .definition-number {
        color: var(--accent-blue);
        font-weight: 700;
      }

      .example {
        color: var(--text-muted);
        font-size: 16px;
        font-style: italic;
        line-height: 1.5;
      }

      .save-btn {
        margin-top: 16px;
        width: 100%;
        background: var(--accent-yellow);
        color: var(--bg-primary);
        border: none;
        border-radius: 4px;
        padding: 10px 16px;
        cursor: pointer;
        font-size: 16px;
        font-weight: 600;
        display: block;
        transition: opacity 0.2s;
      }

      @media (max-width: 500px) {
        .popup {
          right: 16px;
          bottom: 16px;
          width: calc(100vw - 32px);
        }
      }

      .save-btn:hover {
        opacity: 0.9;
      }

      .save-btn:focus-visible {
        outline: 2px solid var(--focus-ring);
        outline-offset: 2px;
      }

      .save-btn:active {
        opacity: 0.8;
      }
    `;
  }

  private createShadowDOM(): void {
    this.container = document.createElement('div');
    this.container.id = 'context-reader-popup';

    this.shadowRoot = this.container.attachShadow({ mode: 'open' });

    const style = document.createElement('style');
    style.textContent = this.getStyles();
    this.shadowRoot.appendChild(style);

    const popupDiv = document.createElement('div');
    popupDiv.classList.add('popup');
    popupDiv.setAttribute('role', 'dialog');
    popupDiv.setAttribute('aria-label', 'Word definition popup');

    const closeBtn = document.createElement('button');
    closeBtn.classList.add('close-btn');
    closeBtn.textContent = '✕';
    closeBtn.setAttribute('aria-label', 'Close popup');
    closeBtn.addEventListener('click', () => this.hide());

    const loadingDiv = document.createElement('div');
    loadingDiv.classList.add('loading');
    loadingDiv.textContent = 'Loading...';

    const resultDiv = document.createElement('div');
    resultDiv.classList.add('result');

    const errorDiv = document.createElement('div');
    errorDiv.classList.add('error');

    const saveBtn = document.createElement('button');
    saveBtn.classList.add('save-btn');
    saveBtn.textContent = 'Save word';
    saveBtn.setAttribute('aria-label', 'Save word to vocabulary list');

    popupDiv.appendChild(closeBtn);
    popupDiv.appendChild(loadingDiv);
    popupDiv.appendChild(resultDiv);
    popupDiv.appendChild(errorDiv);
    popupDiv.appendChild(saveBtn);

    this.shadowRoot.appendChild(popupDiv);

    document.addEventListener('keydown', (event: KeyboardEvent) => {
      if (event.key === 'Escape' && this.visible) {
        this.hide();
      }
    });
  }

  private handleOutsideClick(event: MouseEvent): void {
    if (!this.visible || !this.container) return;

    const eventPath = event.composedPath();
    if (eventPath.includes(this.container)) {
      return;
    }

    this.hide();
  }

  show(word: string, position: { x: number; y: number }): void {
    if (!this.container || !this.shadowRoot) return;

    if (!document.body.contains(this.container)) {
      document.body.appendChild(this.container);
    }

    if (!this.boundOutsideClickHandler) {
      this.boundOutsideClickHandler = (event: MouseEvent) => {
        this.handleOutsideClick(event);
      };
    }
    document.addEventListener('click', this.boundOutsideClickHandler, true);

    const popupDiv = this.shadowRoot.querySelector('.popup') as HTMLElement;
    if (popupDiv) {
      popupDiv.style.left = '';
      popupDiv.style.top = '';
      popupDiv.style.right = '32px';
      popupDiv.style.bottom = '32px';
    }

    const loadingDiv = this.shadowRoot.querySelector('.loading') as HTMLElement;
    const resultDiv = this.shadowRoot.querySelector('.result') as HTMLElement;
    const errorDiv = this.shadowRoot.querySelector('.error') as HTMLElement;

    if (loadingDiv) loadingDiv.style.display = 'block';
    if (resultDiv) resultDiv.style.display = 'none';
    if (errorDiv) errorDiv.style.display = 'none';

    this.visible = true;
  }

  hide(): void {
    if (this.boundOutsideClickHandler) {
      document.removeEventListener(
        'click',
        this.boundOutsideClickHandler,
        true
      );
    }
    if (this.container && this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }
    this.visible = false;
  }

  updateResult(result: LookupResult): void {
    if (!this.shadowRoot) return;

    this.currentResult = result;

    const loadingDiv = this.shadowRoot.querySelector('.loading') as HTMLElement;
    const resultDiv = this.shadowRoot.querySelector('.result') as HTMLElement;

    if (loadingDiv) loadingDiv.style.display = 'none';

    if (resultDiv) {
      const firstEntry = result.meanings[0];
      const firstMeaning = firstEntry?.meanings[0];
      const definitions = firstMeaning?.definitions.slice(0, 2) ?? [];
      const example = definitions.find(definition => definition.example);
      const pronunciation = result.pronunciation ?? firstEntry?.phonetic ?? '';

      const wordEntry = `<div class="word-entry">${this.escapeHtml(result.word)}</div>`;
      const pronunciationMarkup = pronunciation
        ? `<div class="pronunciation">${this.escapeHtml(pronunciation)}</div>`
        : '';
      const translation = `<div class="translation">→ ${this.escapeHtml(result.translation)}</div>`;
      const partOfSpeech = firstMeaning?.partOfSpeech
        ? `<div class="part-of-speech">${this.escapeHtml(firstMeaning.partOfSpeech.toUpperCase())}</div>`
        : '';
      const definitionMarkup =
        definitions.length > 0
          ? `<div class="definitions">${definitions
              .map(
                (definition, index) => `
                  <div class="definition">
                    <span class="definition-number">${index + 1}.</span>
                    <span>${this.escapeHtml(definition.definition)}</span>
                  </div>`
              )
              .join('')}</div>`
          : '';
      const exampleMarkup = example?.example
        ? `<div class="example">${this.escapeHtml(example.example)}</div>`
        : '';

      resultDiv.innerHTML =
        wordEntry +
        pronunciationMarkup +
        partOfSpeech +
        translation +
        definitionMarkup +
        exampleMarkup;
      resultDiv.style.display = 'block';
    }
  }

  private escapeHtml(value: string): string {
    return value
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }

  updateError(message: string): void {
    if (!this.shadowRoot) return;

    const loadingDiv = this.shadowRoot.querySelector('.loading') as HTMLElement;
    const errorDiv = this.shadowRoot.querySelector('.error') as HTMLElement;

    if (loadingDiv) loadingDiv.style.display = 'none';
    if (errorDiv) {
      errorDiv.textContent = message;
      errorDiv.style.display = 'block';
    }
  }

  getShadowRoot(): ShadowRoot {
    if (!this.shadowRoot) {
      throw new Error('PopupComponent not initialized');
    }
    return this.shadowRoot;
  }

  getSaveButton(): HTMLElement | null {
    if (!this.shadowRoot) return null;
    return this.shadowRoot.querySelector('.save-btn');
  }

  isVisible(): boolean {
    return this.visible;
  }
}
