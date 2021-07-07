/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
let client, index;

document.addEventListener('DOMContentLoaded', () => {
  const algoliaIndices = {
    en: 'news',
    es: 'news-es',
    zh: 'news-zh'
  };

  // load Algolia and set index globally
  client = algoliasearch(
    '{{ secrets.algoliaAppId }}',
    '{{ secrets.algoliaApiKey }}'
  );

  index = client.initIndex(algoliaIndices['{{ site.lang }}']);
});
