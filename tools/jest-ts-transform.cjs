/**
 * Custom Jest transformer for TypeScript files.
 * Uses Node 24's built-in stripTypeScriptTypes from node:module.
 */
'use strict';

const { stripTypeScriptTypes } = require('node:module');

module.exports = {
  process(sourceText) {
    // Strip TypeScript types using Node's built-in API
    const stripped = stripTypeScriptTypes(sourceText, { mode: 'strip' });
    return { code: stripped };
  }
};
