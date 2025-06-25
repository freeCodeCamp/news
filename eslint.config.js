import globals from 'globals';
import js from '@eslint/js';
import pluginCypress from 'eslint-plugin-cypress';
import eslintConfigPrettier from 'eslint-config-prettier/flat';

const { node, browser, commonjs } = globals;

export default [
  js.configs.recommended,
  pluginCypress.configs.recommended,
  eslintConfigPrettier,
  {
    ignores: ['**/dist/', '**/package-lock.json'],
    languageOptions: {
      globals: {
        ...node,
        ...browser,
        ...commonjs,
        Atomics: 'readonly',
        SharedArrayBuffer: 'readonly',
        isDonor: 'writable',
        isAuthenticated: 'writable'
      },
      // ecmaVersion: 2020,
      parserOptions: {}
    },
    rules: {
      'no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_'
        }
      ]
    }
  }
];
