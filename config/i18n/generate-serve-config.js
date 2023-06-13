const path = require('path');
const { writeFileSync, mkdirSync } = require('fs');
const { locales } = require('../index.js');

const source = require('../serve.json');
locales.push('dothraki');

for (let language of locales) {
  const sourceClone = { ...source };
  const filePath = path.join(__dirname, `/locales/${language}/redirects.json`);
  const redirectsArray = require(filePath);

  sourceClone.redirects = [
    {
      source: '/:slug/amp',
      destination:
        language === 'english' ? '/news/:slug' : `/${language}/news/:slug`,
      type: 302
    },
    ...(redirectsArray.length ? redirectsArray : [])
  ];

  mkdirSync(path.join(__dirname, `../../docker/languages/${language}`), {
    recursive: true
  });

  writeFileSync(
    path.join(__dirname, `../../docker/languages/${language}/serve.json`),
    JSON.stringify(sourceClone, null, 2)
  );

  console.log(`Wrote ${language}/serve.json`);
}
