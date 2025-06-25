import { join } from 'path';
import { config } from '../index.js';
import { loadJSON } from '../../utils/load-json.js';
import linksSchema from './locales/english/links.json' with { type: 'json' };
import metaTagsSchema from './locales/english/meta-tags.json' with { type: 'json' };
import translationsSchema from './locales/english/translations.json' with { type: 'json' };

const { locales } = config;

/**
 * Flattens a nested object structure into a single
 * object with property chains as keys.
 * @param {Object} obj Object to flatten
 * @param {String} namespace Used for property chaining
 */
const flattenAnObject = (obj, namespace = '') => {
  const flattened = {};
  Object.keys(obj).forEach(key => {
    if (Array.isArray(obj[key])) {
      flattened[namespace ? `${namespace}.${key}` : key] = obj[key];
    } else if (typeof obj[key] === 'object') {
      Object.assign(
        flattened,
        flattenAnObject(obj[key], namespace ? `${namespace}.${key}` : key)
      );
    } else {
      flattened[namespace ? `${namespace}.${key}` : key] = obj[key];
    }
  });
  return flattened;
};

/**
 * Checks if a translation object is missing keys
 * that are present in the schema.
 * @param {String[]} file Array of translation object's keys
 * @param {String[]} schema Array of matching schema's keys
 * @param {String} path string path to file
 */
const findMissingKeys = (file, schema, path) => {
  const missingKeys = [];
  for (const key of schema) {
    if (!file.includes(key)) {
      missingKeys.push(key);
    }
  }
  if (missingKeys.length) {
    console.warn(
      `${path} is missing these required keys: ${missingKeys.join(', ')}`
    );
  }
};

/**
 * Checks if a translation object has extra
 * keys which are NOT present in the schema.
 * @param {String[]} file Array of translation object's keys
 * @param {String[]} schema Array of matching schema's keys
 * @param {String} path string path to file
 */
const findExtraneousKeys = (file, schema, path) => {
  const extraKeys = [];
  for (const key of file) {
    if (!schema.includes(key)) {
      extraKeys.push(key);
    }
  }
  if (extraKeys.length) {
    console.warn(
      `${path} has these keys that are not in the schema: ${extraKeys.join(
        ', '
      )}`
    );
  }
};

/**
 * Validates that all values in the object are non-empty. Includes
 * validation of nested objects.
 * @param {Object} obj The object to check the values of
 * @param {String} namespace String for tracking nested properties
 */
const noEmptyObjectValues = (obj, namespace = '') => {
  const emptyKeys = [];
  for (const key of Object.keys(obj)) {
    if (Array.isArray(obj[key])) {
      if (!obj[key].length) {
        emptyKeys.push(namespace ? `${namespace}.${key}` : key);
      }
    } else if (typeof obj[key] === 'object') {
      emptyKeys.push(
        noEmptyObjectValues(obj[key], namespace ? `${namespace}.${key}` : key)
      );
    } else if (!obj[key]) {
      emptyKeys.push(namespace ? `${namespace}.${key}` : key);
    }
  }
  return emptyKeys.flat();
};

/**
 * Grab the schema keys once, to avoid overhead of
 * fetching within iterative function.
 */
const linksSchemaKeys = Object.keys(flattenAnObject(linksSchema));
const metaTagsSchemaKeys = Object.keys(flattenAnObject(metaTagsSchema));
const translationSchemaKeys = Object.keys(flattenAnObject(translationsSchema));

/**
 * Function that checks the translations.json file
 * for each available client language.
 * @param {String[]} languages List of languages to test
 */
const translationSchemaValidation = languages => {
  languages.forEach(language => {
    const filePath = join(
      import.meta.dirname,
      `/locales/${language}/translations.json`
    );
    const fileJson = loadJSON(filePath);
    const fileKeys = Object.keys(flattenAnObject(fileJson));
    findMissingKeys(
      fileKeys,
      translationSchemaKeys,
      `${language}/translations.json`
    );
    findExtraneousKeys(
      fileKeys,
      translationSchemaKeys,
      `${language}/translations.json`
    );
    const emptyKeys = noEmptyObjectValues(fileJson);
    if (emptyKeys.length) {
      console.warn(
        `${language}/translation.json has these empty keys: ${emptyKeys.join(
          ', '
        )}`
      );
    }
    console.info(`${language} translation.json validation complete.`);
  });
};

const metaTagsSchemaValidation = languages => {
  languages.forEach(language => {
    const filePath = join(
      import.meta.dirname,
      `/locales/${language}/meta-tags.json`
    );
    const fileJson = loadJSON(filePath);
    const fileKeys = Object.keys(flattenAnObject(fileJson));
    findMissingKeys(fileKeys, metaTagsSchemaKeys, `${language}/meta-tags.json`);
    findExtraneousKeys(
      fileKeys,
      metaTagsSchemaKeys,
      `${language}/metaTags.json`
    );
    const emptyKeys = noEmptyObjectValues(fileJson);
    if (emptyKeys.length) {
      console.warn(
        `${language}/metaTags.json has these empty keys: ${emptyKeys.join(
          ', '
        )}`
      );
    }
    console.info(`${language} metaTags.json validation complete`);
  });
};

const linksSchemaValidation = languages => {
  languages.forEach(language => {
    const filePath = join(
      import.meta.dirname,
      `/locales/${language}/links.json`
    );
    const fileJson = loadJSON(filePath);
    const fileKeys = Object.keys(flattenAnObject(fileJson));
    findMissingKeys(fileKeys, linksSchemaKeys, `${language}/links.json`);
    findExtraneousKeys(fileKeys, linksSchemaKeys, `${language}/links.json`);
    const emptyKeys = noEmptyObjectValues(fileJson);
    if (emptyKeys.length) {
      console.warn(
        `${language}/links.json has these empty keys: ${emptyKeys.join(', ')}`
      );
    }
    console.info(`${language} links.json validation complete`);
  });
};

const translatedLangs = locales.filter(x => x !== 'english');

linksSchemaValidation(translatedLangs);
metaTagsSchemaValidation(translatedLangs);
translationSchemaValidation(translatedLangs);
