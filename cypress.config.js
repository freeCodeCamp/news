import { defineConfig } from 'cypress';

import { config } from './config/index.js';
const { postsPerPage, locales } = config;

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:8080/news/',
    retries: 4
  },
  env: {
    postsPerPage,
    locales
  }
});
