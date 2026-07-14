import type { SavedWord } from './types.js';

const DB_NAME = 'ContextReader';
const STORE_NAME = 'vocabulary';
const DB_VERSION = 1;

export class StorageManager {
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
          store.createIndex('word', 'word', { unique: false });
          store.createIndex('savedAt', 'savedAt', { unique: false });
        }
      };

      request.onsuccess = (event: Event) => {
        this.db = (event.target as IDBOpenDBRequest).result;
        resolve();
      };

      request.onerror = (event: Event) => {
        reject((event.target as IDBOpenDBRequest).error);
      };
    });
  }

  isInitialized(): boolean {
    return this.db !== null;
  }

  async saveWord(word: SavedWord): Promise<void> {
    if (!this.db)
      throw new Error('Database not initialized. Call init() first.');
    return new Promise((resolve, reject) => {
      const transaction = (this.db as IDBDatabase).transaction(
        STORE_NAME,
        'readwrite'
      );
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(word);

      request.onsuccess = () => resolve();
      request.onerror = (event: Event) => {
        reject((event.target as IDBRequest).error);
      };
    });
  }

  async getWords(): Promise<SavedWord[]> {
    if (!this.db)
      throw new Error('Database not initialized. Call init() first.');
    return new Promise((resolve, reject) => {
      const transaction = (this.db as IDBDatabase).transaction(
        STORE_NAME,
        'readonly'
      );
      const store = transaction.objectStore(STORE_NAME);
      const index = store.index('savedAt');
      const request = index.getAll();

      request.onsuccess = (event: Event) => {
        const words = (event.target as IDBRequest<SavedWord[]>).result;
        // Sort by savedAt descending (newest first)
        words.sort(
          (a, b) =>
            new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime()
        );
        resolve(words);
      };
      request.onerror = (event: Event) => {
        reject((event.target as IDBRequest).error);
      };
    });
  }

  async deleteWord(id: string): Promise<void> {
    if (!this.db)
      throw new Error('Database not initialized. Call init() first.');
    return new Promise((resolve, reject) => {
      const transaction = (this.db as IDBDatabase).transaction(
        STORE_NAME,
        'readwrite'
      );
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = (event: Event) => {
        reject((event.target as IDBRequest).error);
      };
    });
  }

  async exportAsCSV(): Promise<string> {
    const words = await this.getWords();
    const header = [
      'word',
      'translation',
      'sourceLanguage',
      'targetLanguage',
      'contextSentence',
      'articleUrl',
      'articleTitle',
      'savedAt'
    ].join(',');

    const rows = words.map(w =>
      [
        this.escapeCSVField(w.word),
        this.escapeCSVField(w.translation),
        this.escapeCSVField(w.sourceLanguage),
        this.escapeCSVField(w.targetLanguage),
        this.escapeCSVField(w.contextSentence),
        this.escapeCSVField(w.articleUrl),
        this.escapeCSVField(w.articleTitle),
        this.escapeCSVField(w.savedAt)
      ].join(',')
    );

    return [header, ...rows].join('\n');
  }

  private escapeCSVField(field: string): string {
    if (
      field.includes(',') ||
      field.includes('"') ||
      field.includes('\n') ||
      field.includes('\r')
    ) {
      return `"${field.replace(/"/g, '""')}"`;
    }
    return field;
  }
}
