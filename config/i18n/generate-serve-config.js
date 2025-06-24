import { join } from 'path';
import { writeFileSync, mkdirSync } from 'fs';
import { locales } from '../index.js';
import { loadJSON } from '../../utils/load-json.js';

import source from '../serve.json';
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
