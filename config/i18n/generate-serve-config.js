import gracefulFS from 'graceful-fs';
import { join } from 'path';

import { config } from '../../config/index.js';
import { loadJSON } from '../../utils/load-json.js';
import source from '../serve.json' with { type: 'json' };

const { locales } = config;
const { writeFileSync, mkdirSync } = gracefulFS;

locales.push('dothraki');

for (let language of locales) {
  const sourceClone = { ...source };
  const filePath = join(
    import.meta.dirname,
    `/locales/${language}/redirects.json`
  );
  const redirectsArray = loadJSON(filePath);

  sourceClone.redirects = [
    {
      source: '/:slug/amp',
      destination:
        language === 'english' ? '/news/:slug' : `/${language}/news/:slug`,
      type: 302
    },
    ...(redirectsArray.length ? redirectsArray : [])
  ];

  mkdirSync(join(import.meta.dirname, `../../docker/languages/${language}`), {
    recursive: true
  });

  writeFileSync(
    join(import.meta.dirname, `../../docker/languages/${language}/serve.json`),
    JSON.stringify(sourceClone, null, 2)
  );

  console.log(`Wrote ${language}/serve.json`);
}
