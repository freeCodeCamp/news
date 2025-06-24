import { URL } from 'url';

import { config } from '../config/index.js';

const { siteURL } = config;

export const sitePath = new URL(siteURL).pathname;
