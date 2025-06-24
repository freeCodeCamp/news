import GhostContentAPI from '@tryghost/content-api';

import { config } from '../config/index.js';

const { currentLocale_ghost } = config;

const upperLocale = currentLocale_ghost.toUpperCase();
const url = process.env[`${upperLocale}_GHOST_API_URL`];
const key = process.env[`${upperLocale}_GHOST_CONTENT_API_KEY`];
const version = process.env[`${upperLocale}_GHOST_API_VERSION`];

export const ghostAPI = process.env.DO_NOT_FETCH_FROM_GHOST
  ? null
  : new GhostContentAPI({ url, key, version });

export const ghostAPIURL = url;

export const hashnodeHost = process.env[`${upperLocale}_HASHNODE_HOST`];
