module.exports = {
  env: {
    node: true,
    browser: true,
    module: true,
    es6: true
  },
  extends: ['eslint:recommended', 'plugin:cypress/recommended', 'prettier'],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly',
    isDonor: 'writable',
    isAuthenticated: 'writable'
  },
  parserOptions: {
    ecmaVersion: 2020
  },
  rules: {}
};
