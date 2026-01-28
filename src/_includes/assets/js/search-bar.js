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
  const hitsToRender =
    window.screen.width >= 767 && window.screen.height >= 768 ? 8 : 5;

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

  const loadAutocomplete = selector => {
    return autocomplete({
      container: selector,
      panelContainer: selector,
      stallThreshold: STALL_THRESHOLD_MS,
      detachedMediaQuery: 'none', // Disable detached mode for mobile views
      debug: true, // Allow tabbing through results
      placeholder:
        Number(`{{ site.roundedTotalRecords }}`) < 100
          ? `{%- t 'search.placeholder.default' -%}`
          : `{%- t 'search.placeholder.numbered', {
            roundedTotalRecords: site.roundedTotalRecordsLocalizedString
        } -%}`,
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
  };

  const leftNavAlgoliaInstance = loadAutocomplete('#nav-left-search-container');
  loadAutocomplete('#nav-right-search-container');
  const searchBarEls = document.querySelectorAll('.fcc-search-container');

  // Shortcuts for focusing on search input
  document.addEventListener('keydown', e => {
    // Ignore if user is typing in an input or textarea
    const isTyping =
      e.target instanceof HTMLInputElement ||
      e.target instanceof HTMLTextAreaElement ||
      e.target.isContentEditable;

    if (isTyping) return;

    if (e.key === '/' || e.key === 's') {
      e.preventDefault();
      searchBarEls.forEach(el => {
        if (el.checkVisibility()) {
          el.querySelector('input').focus();
        }
      });
    }
  });

  // Handle redirect to search page when form is
  // submitted via enter or magnifying glass
  searchBarEls.forEach(el => {
    el.addEventListener('submit', e => {
      e.preventDefault();

      const query = el.querySelector('input').value.trim();
      const hitsList = el.querySelector('.aa-List');
      if (!query || !hitsList) return;

      window.location.assign(
        `{{ '/search?query=${query}' | htmlBaseUrl(site.url) }}`
      );
    });
  });

  // Close left search bar dropdown when clicking off
  document.addEventListener('click', e => {
    if (
      e.target !== document.querySelector('#nav-left-search-container .aa-Form')
    ) {
      leftNavAlgoliaInstance.setIsOpen(false);
    }
  });
});
