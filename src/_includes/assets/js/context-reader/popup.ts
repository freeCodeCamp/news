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
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      }

      .popup {
        /* FCC Command-line Chic - Dark Mode (Primary) */
        --bg-primary: #0a0a23;
        --bg-secondary: #1b1b32;
        --text-primary: #f5f6f7;
        --text-bright: #ffffff;
        --text-muted: #858591;
        --border-color: #3b3b4f;
        --accent-blue: #99c9ff;
        --accent-yellow: #f1be32;
        --accent-red: #ffadad;
        --focus-ring: #198eee;

        position: fixed;
        z-index: 10000;
        max-width: 360px;
        background: var(--bg-secondary);
        border: 1px solid var(--border-color);
        border-radius: 4px;
        padding: 20px;
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
          --border-color: #858591;
          --accent-blue: #002ead;
          --accent-yellow: #4d3800;
          --accent-red: #850000;
        }
      }

      .close-btn {
        position: absolute;
        top: 12px;
        right: 12px;
        background: none;
        border: none;
        cursor: pointer;
        font-size: 18px;
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
        font-size: 20px;
        color: var(--accent-blue);
        margin-bottom: 8px;
      }

      .translation {
        font-size: 18px;
        color: var(--text-primary);
        margin-bottom: 8px;
      }

      .definition {
        font-size: 16px;
        color: var(--text-muted);
        margin-bottom: 8px;
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
