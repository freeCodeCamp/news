import gracefulFS from 'graceful-fs';
import { join } from 'path';

import { config } from '../../config/index.js';
import { loadJSON } from '../../utils/load-json.js';
import source from '../serve.json' with { type: 'json' };

const { currentLocale_i18n: language } = config;
const { writeFileSync, mkdirSync } = gracefulFS;
const filePath = join(
  import.meta.dirname,
  `/locales/${language}/redirects.json`
);
const redirects = loadJSON(filePath);

const serveConfig = {
  ...source,
  redirects: [
    {
      source: '/:slug/amp',
      destination:
        language === 'english' ? '/news/:slug' : `/${language}/news/:slug`,
      type: 302
    },
    ...redirects
  ]
};

const outputDirectory = join(
  import.meta.dirname,
  `../../docker/languages/${language}`
);
mkdirSync(outputDirectory, { recursive: true });
writeFileSync(
  join(outputDirectory, 'serve.json'),
  JSON.stringify(serveConfig, null, 2)
);

console.log(`Wrote ${language}/serve.json`);
