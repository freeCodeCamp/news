// src/_includes/assets/js/context-reader/side-panel.ts

import type { SavedWord } from './types.js';
import type { StorageManager } from './storage.js';

export class SidePanelComponent {
  private container: HTMLElement | null = null;
  private shadowRoot: ShadowRoot | null = null;
  private visible: boolean = false;
  private storage: StorageManager;
  private words: SavedWord[] = [];

  constructor(storage: StorageManager) {
    this.storage = storage;
    this.createShadowDOM();
  }

  private getStyles(): string {
    return `
      :host {
        all: initial;
      }
      .panel {
        --color-primary: #0a0a23;
        --color-text: #1b1b32;
        --color-bg: #ffffff;
        --color-border: #d0d0d5;
        --color-shadow: rgba(0, 0, 0, 0.15);
        --color-card-bg: #f9f9f9;
        position: fixed;
        right: 0;
        top: 0;
        width: 350px;
        height: 100vh;
        background: var(--color-bg);
        border-left: 1px solid var(--color-border);
        box-shadow: -4px 0 16px var(--color-shadow);
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-size: 14px;
        color: var(--color-text);
        z-index: 10001;
        display: flex;
        flex-direction: column;
        overflow: hidden;
      }
      @media (prefers-color-scheme: dark) {
        .panel {
          --color-primary: #99c9ff;
          --color-text: #dfdfe2;
          --color-bg: #1b1b32;
          --color-border: #3b3b4f;
          --color-shadow: rgba(0, 0, 0, 0.4);
          --color-card-bg: #2a2a3f;
        }
      }
      .panel-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 16px;
        border-bottom: 1px solid var(--color-border);
        flex-shrink: 0;
      }
      .panel-header h2 {
        margin: 0;
        font-size: 18px;
        font-weight: 700;
        color: var(--color-text);
      }
      .close-btn {
        background: none;
        border: none;
        cursor: pointer;
        font-size: 18px;
        color: var(--color-text);
        padding: 4px 8px;
        border-radius: 4px;
        line-height: 1;
      }
      .close-btn:hover {
        background: var(--color-border);
      }
      .panel-controls {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 12px 16px;
        border-bottom: 1px solid var(--color-border);
        flex-shrink: 0;
      }
      .export-btn {
        background: var(--color-primary);
        color: #ffffff;
        border: none;
        border-radius: 4px;
        padding: 6px 12px;
        cursor: pointer;
        font-size: 13px;
        font-weight: 600;
        white-space: nowrap;
      }
      .export-btn:hover {
        opacity: 0.9;
      }
      .search-input {
        flex: 1;
        border: 1px solid var(--color-border);
        border-radius: 4px;
        padding: 6px 10px;
        font-size: 13px;
        background: var(--color-bg);
        color: var(--color-text);
      }
      .words-list {
        flex: 1;
        overflow-y: auto;
        padding: 12px 16px;
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      .empty-state {
        display: none;
        text-align: center;
        padding: 40px 16px;
        color: var(--color-text);
        opacity: 0.6;
        font-size: 14px;
      }
      .word-item {
        background: var(--color-card-bg);
        border: 1px solid var(--color-border);
        border-radius: 6px;
        padding: 12px;
        position: relative;
      }
      .word-item-word {
        font-weight: 700;
        font-size: 16px;
        margin-bottom: 2px;
      }
      .word-item-translation {
        font-size: 14px;
        margin-bottom: 4px;
        color: var(--color-primary);
      }
      .word-item-context {
        font-size: 12px;
        opacity: 0.75;
        font-style: italic;
        margin-bottom: 6px;
      }
      .word-item-footer {
        font-size: 11px;
        opacity: 0.6;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .word-item-footer a {
        color: var(--color-primary);
        text-decoration: none;
      }
      .word-item-footer a:hover {
        text-decoration: underline;
      }
      .delete-btn {
        position: absolute;
        top: 8px;
        right: 8px;
        background: none;
        border: none;
        cursor: pointer;
        font-size: 14px;
        color: var(--color-text);
        opacity: 0.5;
        padding: 2px 6px;
        border-radius: 3px;
        line-height: 1;
      }
      .delete-btn:hover {
        background: var(--color-border);
        opacity: 1;
      }
    `;
  }

  private createShadowDOM(): void {
    this.container = document.createElement('div');
    this.container.id = 'context-reader-side-panel';

    this.shadowRoot = this.container.attachShadow({ mode: 'open' });

    const style = document.createElement('style');
    style.textContent = this.getStyles();
    this.shadowRoot.appendChild(style);

    const panelDiv = document.createElement('div');
    panelDiv.classList.add('panel');

    // Header
    const header = document.createElement('div');
    header.classList.add('panel-header');

    const heading = document.createElement('h2');
    heading.textContent = 'Vocabulary';

    const closeBtn = document.createElement('button');
    closeBtn.classList.add('close-btn');
    closeBtn.textContent = '✕';
    closeBtn.setAttribute('aria-label', 'Close side panel');
    closeBtn.addEventListener('click', () => this.hide());

    header.appendChild(heading);
    header.appendChild(closeBtn);

    // Controls
    const controls = document.createElement('div');
    controls.classList.add('panel-controls');

    const exportBtn = document.createElement('button');
    exportBtn.classList.add('export-btn');
    exportBtn.textContent = 'Export CSV';
    exportBtn.setAttribute('aria-label', 'Export vocabulary as CSV');
    exportBtn.addEventListener('click', () => this.handleExport());

    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.classList.add('search-input');
    searchInput.placeholder = 'Search words...';
    searchInput.setAttribute('aria-label', 'Search vocabulary');

    controls.appendChild(exportBtn);
    controls.appendChild(searchInput);

    // Words list
    const wordsList = document.createElement('div');
    wordsList.classList.add('words-list');

    // Empty state
    const emptyState = document.createElement('div');
    emptyState.classList.add('empty-state');
    emptyState.textContent =
      'No saved words yet. Click a word while reading to save it.';

    panelDiv.appendChild(header);
    panelDiv.appendChild(controls);
    panelDiv.appendChild(wordsList);
    panelDiv.appendChild(emptyState);

    this.shadowRoot.appendChild(panelDiv);

    document.addEventListener('keydown', (event: KeyboardEvent) => {
      if (event.key === 'Escape' && this.visible) {
        this.hide();
      }
    });
  }

  show(): void {
    if (!this.container) return;

    if (!document.body.contains(this.container)) {
      document.body.appendChild(this.container);
    }

    const panelDiv = this.shadowRoot?.querySelector(
      '.panel'
    ) as HTMLElement | null;
    if (panelDiv) {
      panelDiv.style.display = 'flex';
    }

    this.visible = true;
    void this.refresh();
  }

  hide(): void {
    const panelDiv = this.shadowRoot?.querySelector(
      '.panel'
    ) as HTMLElement | null;
    if (panelDiv) {
      panelDiv.style.display = 'none';
    }
    this.visible = false;
  }

  toggle(): void {
    if (this.visible) {
      this.hide();
    } else {
      this.show();
    }
  }

  async refresh(): Promise<void> {
    this.words = await this.storage.getWords();
    this.render();
  }

  private render(): void {
    if (!this.shadowRoot) return;

    const wordsList = this.shadowRoot.querySelector(
      '.words-list'
    ) as HTMLElement | null;
    const emptyState = this.shadowRoot.querySelector(
      '.empty-state'
    ) as HTMLElement | null;

    if (!wordsList || !emptyState) return;

    if (this.words.length === 0) {
      wordsList.innerHTML = '';
      emptyState.style.display = 'block';
      return;
    }

    emptyState.style.display = 'none';
    wordsList.innerHTML = '';

    for (const word of this.words) {
      const item = document.createElement('div');
      item.classList.add('word-item');
      item.dataset.id = word.id;

      const savedDate = new Date(word.savedAt).toLocaleDateString();

      item.innerHTML = `
        <div class="word-item-word">${this.escapeHtml(word.word)}</div>
        <div class="word-item-translation">${this.escapeHtml(word.translation)}</div>
        <div class="word-item-context">"${this.escapeHtml(word.contextSentence)}"</div>
        <div class="word-item-footer">
          <span>${savedDate}</span>
          <a href="${this.escapeHtml(word.articleUrl)}" target="_blank" rel="noopener noreferrer">${this.escapeHtml(word.articleTitle)}</a>
        </div>
        <button class="delete-btn" aria-label="Delete word ${this.escapeHtml(word.word)}">✕</button>
      `;

      const deleteBtn = item.querySelector(
        '.delete-btn'
      ) as HTMLButtonElement | null;
      if (deleteBtn) {
        deleteBtn.addEventListener('click', async () => {
          await this.storage.deleteWord(word.id);
          await this.refresh();
        });
      }

      wordsList.appendChild(item);
    }
  }

  private escapeHtml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  private async handleExport(): Promise<void> {
    try {
      const csv = await this.storage.exportAsCSV();
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const date = new Date().toISOString().split('T')[0];
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `context-reader-vocabulary-${date}.csv`;
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      URL.revokeObjectURL(url);
    } catch (error) {
      alert('Failed to export vocabulary. Please try again.');
    }
  }

  getShadowRoot(): ShadowRoot {
    if (!this.shadowRoot) {
      throw new Error('SidePanelComponent not initialized');
    }
    return this.shadowRoot;
  }

  getExportButton(): HTMLElement | null {
    if (!this.shadowRoot) return null;
    return this.shadowRoot.querySelector('.export-btn');
  }

  isVisible(): boolean {
    return this.visible;
  }
}
