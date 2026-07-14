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
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      }

      .panel {
        /* FCC Command-line Chic - Dark Mode (Primary) */
        --bg-primary: #0a0a23;
        --bg-secondary: #1b1b32;
        --bg-tertiary: #2a2a40;
        --text-primary: #f5f6f7;
        --text-bright: #ffffff;
        --text-muted: #858591;
        --border-color: #3b3b4f;
        --accent-blue: #99c9ff;
        --accent-yellow: #f1be32;
        --accent-red: #ffadad;
        --focus-ring: #198eee;

        position: fixed;
        right: 0;
        top: 0;
        width: 380px;
        height: 100vh;
        background: var(--bg-secondary);
        border-left: 1px solid var(--border-color);
        font-size: 18px;
        line-height: 1.5;
        color: var(--text-primary);
        z-index: 9999;
        display: flex;
        flex-direction: column;
        overflow: hidden;
      }

      @media (prefers-color-scheme: light) {
        .panel {
          --bg-primary: #ffffff;
          --bg-secondary: #f5f6f7;
          --bg-tertiary: #dfdfe2;
          --text-primary: #0a0a23;
          --text-bright: #0a0a23;
          --text-muted: #3b3b4f;
          --border-color: #858591;
          --accent-blue: #002ead;
          --accent-yellow: #4d3800;
          --accent-red: #850000;
        }
      }

      .panel-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 20px;
        border-bottom: 1px solid var(--border-color);
        flex-shrink: 0;
      }

      .panel-header h2 {
        margin: 0;
        font-size: 22px;
        font-weight: 700;
        color: var(--text-primary);
      }

      .close-btn {
        background: none;
        border: none;
        cursor: pointer;
        font-size: 20px;
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

      .panel-controls {
        display: flex;
        flex-direction: column;
        gap: 12px;
        padding: 16px 20px;
        border-bottom: 1px solid var(--border-color);
        flex-shrink: 0;
      }

      .export-btn {
        background: var(--accent-yellow);
        color: var(--bg-primary);
        border: none;
        border-radius: 4px;
        padding: 10px 16px;
        cursor: pointer;
        font-size: 16px;
        font-weight: 600;
        white-space: nowrap;
        transition: opacity 0.2s;
      }

      .export-btn:hover {
        opacity: 0.9;
      }

      .export-btn:focus-visible {
        outline: 2px solid var(--focus-ring);
        outline-offset: 2px;
      }

      .search-input {
        border: 1px solid var(--border-color);
        border-radius: 4px;
        padding: 10px 14px;
        font-size: 16px;
        background: var(--bg-tertiary);
        color: var(--text-primary);
      }

      .search-input::placeholder {
        color: var(--text-muted);
      }

      .search-input:focus {
        outline: 2px solid var(--focus-ring);
        outline-offset: -2px;
      }

      .words-list {
        flex: 1;
        overflow-y: auto;
        padding: 16px 20px;
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .empty-state {
        display: none;
        text-align: center;
        padding: 40px 20px;
        color: var(--text-muted);
        font-size: 16px;
        line-height: 1.5;
      }

      .word-item {
        background: var(--bg-tertiary);
        border: 1px solid var(--border-color);
        border-radius: 4px;
        padding: 14px;
        position: relative;
      }

      .word-item-word {
        font-weight: 700;
        font-size: 18px;
        color: var(--accent-blue);
        margin-bottom: 4px;
      }

      .word-item-translation {
        font-size: 16px;
        color: var(--text-primary);
        margin-bottom: 6px;
      }

      .word-item-context {
        font-size: 14px;
        color: var(--text-muted);
        font-style: italic;
        margin-bottom: 8px;
        line-height: 1.4;
      }

      .word-item-footer {
        font-size: 14px;
        color: var(--text-muted);
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 8px;
      }

      .word-item-footer a {
        color: var(--accent-blue);
        text-decoration: none;
        transition: opacity 0.2s;
      }

      .word-item-footer a:hover {
        opacity: 0.8;
      }

      .delete-btn {
        position: absolute;
        top: 12px;
        right: 12px;
        background: none;
        border: none;
        cursor: pointer;
        font-size: 16px;
        color: var(--accent-red);
        padding: 4px;
        border-radius: 4px;
        transition: opacity 0.2s;
      }

      .delete-btn:hover {
        opacity: 0.8;
      }

      .delete-btn:focus-visible {
        outline: 2px solid var(--focus-ring);
        outline-offset: 2px;
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
