// eslint-disable-next-line no-unused-vars
let client, index;

document.addEventListener("DOMContentLoaded", () => {
  // load Algolia and set index globally
  // eslint-disable-next-line no-undef
  client = algoliasearch(
    "{{ secrets.algoliaAppId }}",
    "{{ secrets.algoliaAPIKey }}"
  );

  index = client.initIndex("{{ secrets.algoliaIndex }}");
});
