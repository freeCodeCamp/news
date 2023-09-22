const { defineConfig } = require('cypress');
const { postsPerPage } = require('./config');

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:8080/news',
    retries: 4,
    testIsolation: false
  },
  env: {
    postsPerPage
  }
});
