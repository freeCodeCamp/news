document.addEventListener('DOMContentLoaded', () => {
  const screenWidth = window.screen.width;
  const screenHeight = window.screen.height;
  const hitsToRender = screenWidth >= 767 && screenHeight >= 768 ? 8 : 5;
  const searchForm = document.getElementById('search-form');
  const input = document.getElementById('search-input');
  const dropdownContainer = document.getElementById('dropdown-container');
  let searchQuery, hitSelected, hits;

  input.addEventListener('input', (e) => {
    searchQuery = e.target.value;
  });

  // Prevent form from being submitted with magnifying
  // glass or enter when there is no query or hits
  searchForm.addEventListener('submit', (e) => {
    e.preventDefault();

    submitSearch();
  });

  // eslint-disable-next-line no-undef
  const search = autocomplete(
    '#search-input',
    {
      hint: false,
      keyboardShortcuts: ['s', 191],
      openOnFocus: true,
      appendTo: dropdownContainer,
      debug: true, // allow tabbing through results
    },
    [
      {
        // eslint-disable-next-line no-undef
        source: autocomplete.sources.hits(index, { hitsPerPage: hitsToRender }),
        debounce: 250,
        templates: {
          suggestion: (suggestion) => {
            hits = true;
            return `
            <a href="${suggestion.url}">
              <div class="algolia-result">
                <span>${suggestion._highlightResult.title.value}</span>
              </div>
            </a>
          `;
          },
          empty: () => {
            hits = false;
            return `
            <div class="aa-suggestion footer-suggestion no-hits-footer">
              <div class="algolia-result">
                <span>
                  {% t 'search.no-tutorials' %}
                </span>
              </div>
            </div>
          `;
          },
          footer: (query) => {
            if (!query.isEmpty) {
              return `
              <div class="aa-suggestion footer-suggestion">
                <a id="algolia-footer-selector" href="{{ site.url }}/search?query=${searchQuery}">
                  <div class="algolia-result algolia-footer">
                    {% t 'search.see-results', { searchQuery: '${searchQuery}' } %}
                  </div>
                </a>
              </div>
            `;
            }
          },
        },
      },
    ]
  ).on('autocomplete:selected', (event, suggestion, dataset, context) => {
    // If article is selected, set to URL of the article.
    // If footer is selected, set to search results path
    hitSelected = suggestion
      ? suggestion.url
      : `{{ site.url }}/search?query=${searchQuery}`;

    // Let browser handle click, and do not go to selection on tab key press
    if (
      context.selectionMethod === 'click' ||
      context.selectionMethod === 'tabKey'
    ) {
      return;
    }

    // Go to selected article or footer path
    if (hits) {
      window.location.assign(hitSelected);
    }
  });

  // Go to highlighted hit or search for current query
  // when magnifying glass or enter is pressed
  function submitSearch() {
    hitSelected = document.getElementsByClassName('aa-cursor')[0];

    if (hitSelected && searchQuery) {
      const articleUrl = hitSelected.querySelector('a').href;
      window.location.assign(articleUrl);
    } else if (!hitSelected && searchQuery && hits) {
      window.location.assign(`{{ site.url }}/search?query=${searchQuery}`);
    }
  }

  // close dropbar when clicking off
  document.addEventListener('click', (e) => {
    if (e.target !== input) {
      search.autocomplete.close();
    }
  });
});
