// eslint-disable-next-line no-unused-vars
let client, index;

document.addEventListener('DOMContentLoaded', () => {
  const algoliaIndices = {
    en: 'news',
    es: 'news-es',
    zh: 'news-zh',
    'pt-br': 'news-pt-br',
    it: 'news-it'
  };

  // load Algolia and set index globally
  // eslint-disable-next-line no-undef
  client = algoliasearch(
    '{{ secrets.algoliaAppId }}',
    '{{ secrets.algoliaAPIKey }}'
  );

  index = client.initIndex(algoliaIndices['{{ site.lang }}']);
});
