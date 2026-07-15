import type { DictionaryEntry } from '../types';

const FREE_DICTIONARY_API = 'https://api.dictionaryapi.dev/api/v2/entries/en';

export class DictionaryService {
  async getEnglishDictionary(word: string): Promise<DictionaryEntry[]> {
    const response = await fetch(
      `${FREE_DICTIONARY_API}/${encodeURIComponent(word)}`
    );

    if (!response.ok) {
      if (response.status === 404) {
        return [];
      }
      throw new Error(
        `Dictionary API error: ${response.status} ${response.statusText}`
      );
    }

    const data = (await response.json()) as Array<{
      word: string;
      phonetic?: string;
      meanings: Array<{
        partOfSpeech: string;
        definitions: Array<{
          definition: string;
          example?: string;
          synonyms?: string[];
        }>;
      }>;
    }>;

    return data.map(entry => ({
      word: entry.word,
      phonetic: entry.phonetic,
      meanings: entry.meanings.map(meaning => ({
        partOfSpeech: meaning.partOfSpeech,
        definitions: meaning.definitions.map(def => ({
          definition: def.definition,
          example: def.example,
          synonyms: def.synonyms
        }))
      }))
    }));
  }

  async getSpanishDictionary(_word: string): Promise<DictionaryEntry[]> {
    // No free Spanish dictionary API available for MVP
    return [];
  }

  async lookup(word: string, lang: string): Promise<DictionaryEntry[]> {
    const normalizedLang = lang.toLowerCase();

    if (normalizedLang === 'en' || normalizedLang === 'english') {
      return this.getEnglishDictionary(word);
    }

    if (normalizedLang === 'es' || normalizedLang === 'spanish') {
      return this.getSpanishDictionary(word);
    }

    return [];
  }
}
