const path = require('path');
const { writeFileSync, mkdirSync } = require('fs');
const jsonmergepatch = require('json-merge-patch');
const { locales } = require('../index.js');

let source = require('../serve.json');

locales.push('dothraki');
for (let language of locales) {
  const filePath = path.join(__dirname, `/locales/${language}/serve.json`);
  const patch = require(filePath);

  source = jsonmergepatch.apply(source, patch);
  mkdirSync(path.join(__dirname, `../../docker/languages/${language}`), {
    recursive: true
  });
  writeFileSync(
    path.join(__dirname, `../../docker/languages/${language}/serve.json`),
    JSON.stringify(source, null, 2)
  );
  console.log(`Wrote ${language}/serve.json`);
}
