// src/_includes/assets/js/context-reader/popup.ts

import type { LookupResult } from './types.js';

export class PopupComponent {
  private container: HTMLElement | null = null;
  private shadowRoot: ShadowRoot | null = null;
  private visible: boolean = false;
  private currentResult: LookupResult | null = null;

  constructor() {
    this.createShadowDOM();
  }

  private getStyles(): string {
    return `
      :host {
        all: initial;
      }
      .popup {
        --color-primary: #0a0a23;
        --color-text: #1b1b32;
        --color-bg: #ffffff;
        --color-border: #d0d0d5;
        --color-shadow: rgba(0, 0, 0, 0.15);
        position: fixed;
        z-index: 10000;
        max-width: 320px;
        background: var(--color-bg);
        border: 1px solid var(--color-border);
        border-radius: 8px;
        padding: 16px;
        box-shadow: 0 4px 16px var(--color-shadow);
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-size: 14px;
        color: var(--color-text);
      }
      @media (prefers-color-scheme: dark) {
        .popup {
          --color-primary: #99c9ff;
          --color-text: #dfdfe2;
          --color-bg: #1b1b32;
          --color-border: #3b3b4f;
          --color-shadow: rgba(0, 0, 0, 0.4);
        }
      }
      .close-btn {
        position: absolute;
        top: 8px;
        right: 8px;
        background: none;
        border: none;
        cursor: pointer;
        font-size: 16px;
        color: var(--color-text);
        padding: 4px 8px;
        border-radius: 4px;
        line-height: 1;
      }
      .close-btn:hover {
        background: var(--color-border);
      }
      .close-btn:active {
        opacity: 0.7;
      }
      .loading {
        display: none;
        padding: 8px 0;
        color: var(--color-text);
        opacity: 0.7;
      }
      .result {
        display: none;
        padding-top: 4px;
      }
      .error {
        display: none;
        padding: 8px 0;
        color: #d93025;
      }
      .word-entry {
        font-weight: 700;
        font-size: 16px;
        margin-bottom: 4px;
      }
      .translation {
        font-size: 14px;
        margin-bottom: 4px;
      }
      .definition {
        font-size: 13px;
        opacity: 0.8;
        margin-bottom: 4px;
      }
      .save-btn {
        margin-top: 12px;
        background: var(--color-primary);
        color: #ffffff;
        border: none;
        border-radius: 4px;
        padding: 6px 14px;
        cursor: pointer;
        font-size: 13px;
        font-weight: 600;
        display: block;
      }
      .save-btn:hover {
        opacity: 0.9;
      }
      .save-btn:active {
        opacity: 0.7;
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

  show(word: string, position: { x: number; y: number }): void {
    if (!this.container || !this.shadowRoot) return;

    if (!document.body.contains(this.container)) {
      document.body.appendChild(this.container);
    }

    const popupDiv = this.shadowRoot.querySelector('.popup') as HTMLElement;
    if (popupDiv) {
      popupDiv.style.left = `${position.x + 10}px`;
      popupDiv.style.top = `${position.y + 10}px`;
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
      const wordEntry = `<div class="word-entry">${result.word}</div>`;
      const translation = `<div class="translation">→ ${result.translation}</div>`;
      const pronunciation = result.pronunciation
        ? `<div class="definition">${result.pronunciation}</div>`
        : '';
      const firstDefinition =
        result.meanings.length > 0 &&
        result.meanings[0].meanings.length > 0 &&
        result.meanings[0].meanings[0].definitions.length > 0
          ? `<div class="definition">${result.meanings[0].meanings[0].definitions[0].definition}</div>`
          : '';

      resultDiv.innerHTML =
        wordEntry + translation + pronunciation + firstDefinition;
      resultDiv.style.display = 'block';
    }
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
