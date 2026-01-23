document.addEventListener('DOMContentLoaded', async () => {
  const { liteClient } = window['algoliasearch/lite'];
  const { autocomplete, getAlgoliaResults } =
    window['@algolia/autocomplete-js'];

  const searchClient = liteClient(
    '{{ secrets.algoliaAppId }}',
    '{{ secrets.algoliaAPIKey }}'
  );

  const DEBOUNCE_MS = 200;
  const STALL_THRESHOLD_MS = 500;

  const screenWidth = window.screen.width;
  const screenHeight = window.screen.height;
  let currentScreenWidth = window.innerWidth;
  const hitsToRender = screenWidth >= 767 && screenHeight >= 768 ? 8 : 5;
  // const searchForm = document.getElementById('search-form');
  // const input = document.getElementById('search-input');
  const searchForms = document.getElementsByClassName('ais-SearchBox-form');
  const searchInputs = document.getElementsByClassName('ais-SearchBox-input');
  const resetButtons = document.getElementsByClassName('ais-SearchBox-reset');
  const dropdownContainer = document.getElementById('dropdown-container');
  // let searchQuery, hitSelected, hits;

  // [...searchInputs].forEach(el => {
  //   el.addEventListener('input', e => {
  //     searchQuery = e.target.value;
  //   });
  // });

  // window.addEventListener('resize', () => {
  //   const newScreenWidth = window.innerWidth;
  //   // Breakpoint for hiding the dropdown search bar
  //   // and displaying the one in the left nav
  //   if (currentScreenWidth === 980 && newScreenWidth === 979) {
  //     console.log('Working');
  //     searchForm.reset();
  //   }

  //   currentScreenWidth = window.innerWidth;
  // });

  // window.addEventListener('resize', () => {});

  // // Prevent forms from being submitted with magnifying
  // // glass or enter when there is no query or hits
  // [...searchForms].forEach(el => {
  //   el.addEventListener('submit', e => {
  //     e.preventDefault();
  //     submitSearch();
  //   });
  // });

  document.addEventListener('keydown', e => {
    // Ignore if user is typing in an input or textarea
    const isTyping =
      e.target instanceof HTMLInputElement ||
      e.target instanceof HTMLTextAreaElement ||
      e.target.isContentEditable;

    if (isTyping) return;

    if (e.key === '/' || e.key === 's') {
      e.preventDefault();
      document.querySelector('.fcc_search_container input')?.focus();
    }
  });

  document
    .querySelector('.fcc_search_container')
    .addEventListener('submit', e => {
      e.preventDefault();

      const query = document
        .querySelector('.fcc_search_container input')
        .value.trim();
      const hitsList = document.querySelector('.aa-List');
      if (!query || !hitsList) return;

      console.log(`{{ '/search?query=${query}' | htmlBaseUrl(site.url) }}`);
      // Redirect to your custom URL
      window.location.assign(
        `{{ '/search?query=${query}' | htmlBaseUrl(site.url) }}`
      );
    });

  const debouncePromise = (fn, time) => {
    let timer = undefined;

    return (...args) => {
      if (timer) {
        clearTimeout(timer); // Clear the timeout first if it's already defined
      }

      return new Promise(resolve => {
        timer = setTimeout(() => resolve(fn(...args)), time);
      });
    };
  };

  const debounced = debouncePromise(
    items => Promise.resolve(items),
    DEBOUNCE_MS
  );

  autocomplete({
    container: '.fcc_search_container',
    panelContainer: '.fcc_search_container',
    stallThreshold: STALL_THRESHOLD_MS,
    detachedMediaQuery: 'none',
    debug: true, // Allow tabbing through results
    placeholder: 'Search 12,200+ news articles, tutorials, and books',
    getSources() {
      return debounced([
        {
          sourceId: 'links',
          // Get URLs to enable keyboard navigation
          // and selection
          getItemUrl({ item }) {
            return item.url;
          },
          getItems({ query }) {
            return getAlgoliaResults({
              searchClient,
              queries: [
                {
                  indexName: 'news',
                  params: {
                    query,
                    hitsPerPage: hitsToRender
                  }
                }
              ]
            });
          },
          templates: {
            item({ item, components, html }) {
              return html`<a class="aa-ItemLink" href=${item.url}>
                <div class="aa-ItemContent">
                  <div class="aa-ItemContentBody">
                    <div class="aa-ItemContentTitle">
                      ${components.Highlight({
                        hit: item,
                        attribute: 'title',
                        tagName: 'mark'
                      })}
                    </div>
                  </div>
                </div>
              </a>`;
            },
            footer({ state, html }) {
              const currQuery = state?.query;
              const hitsArr = state?.collections[0]?.items;
              if (hitsArr.length) {
                return html`<a
                  class="aa-ItemLink"
                  href="{{ '/search?query=${currQuery}' | htmlBaseUrl(site.url) }}"
                  ><div class="aa-ItemContent">
                    {% t 'search.see-results', { searchQuery: '${currQuery}' }
                    %}
                  </div></a
                >`;
              }
            },
            noResults() {
              return "{% t 'search.no-results' %}";
            }
          }
        }
      ]);
    }
  });

  // // Go to highlighted hit or search for current query
  // // when magnifying glass or enter is pressed
  // function submitSearch() {
  //   hitSelected = document.getElementsByClassName('aa-cursor')[0];

  //   if (hitSelected && searchQuery) {
  //     const articleUrl = hitSelected.querySelector('a').href;
  //     window.location.assign(articleUrl);
  //   } else if (!hitSelected && searchQuery && hits) {
  //     window.location.assign(
  //       `{{ '/search?query=${searchQuery}' | htmlBaseUrl(site.url) }}`
  //     );
  //   }
  // }

  // [...resetButtons].forEach(el => {
  //   console.log(el);
  //   el.addEventListener('click', () => {
  //     searchQuery = '';
  //     search.setQuery = '';
  //   });
  // });

  // // close dropbar when clicking off
  // document.addEventListener('click', e => {
  //   // const leftNavSearchInput = searchInputs[0];
  //   if (e.target !== searchInputs[0]) {
  //     search.autocomplete.close();
  //   }
  // });
});
