document.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);
  const queryStr = urlParams.get('query');
  const postFeed = document.querySelector('.post-feed');
  let currPage = 0;

  const getHits = async pageNo => {
    const eleventyEnv = '{{ secrets.eleventyEnv }}';

    try {
      if (eleventyEnv === 'ci') {
        const response = await fetch(
          `{{ site.url }}/assets/mock-search-hits.json`
        );
        const mockHits = await response.json();

        return mockHits;
      }

      // eslint-disable-next-line no-undef
      return index
        .search({
          query: queryStr,
          hitsPerPage: 15,
          page: pageNo
        })
        .then(({ hits } = {}) => {
          return hits;
        });
    } catch (err) {
      console.log(err);
      err.debugData ? console.log(err.debugData) : '';
    }
  };

  const getResizedImage = (url, width) =>
    url.includes('/content/images/')
      ? url.replace('/content/images/', `/content/images/size/w${width}/`)
      : url;

  const generateCardNode = (hit, lazyLoad) => {
    const featureImageEl = `
      <a class="post-card-image-link" href="${hit.url}" aria-label="${
      hit.title
    }">
        <img
          class="post-card-image"
          srcset="
            ${getResizedImage(hit.featureImage, 300)}  300w,
            ${getResizedImage(hit.featureImage, 600)}  600w,
            ${getResizedImage(hit.featureImage, 1000)} 1000w,
            ${getResizedImage(hit.featureImage, 2000)} 2000w
          "
          sizes="
            (max-width: 360px) 300px,
            (max-width: 655px) 600px,
            (max-width: 767px) 1000px,
            (min-width: 768px) 300px,
            92vw
          "
          onerror="this.style.display='none'"
          src="${hit.featureImage}"
          alt="${hit.title}"
          ${lazyLoad ? 'loading="lazy"' : ''}
        />
      </a>
    `;

    const headerEl = `
      <header class="post-card-header">
        ${
          hit?.tags[0]?.name
            ? `<span class="post-card-tags"><a href="${hit.tags[0].url}">
          #${hit.tags[0].name}
        </a></span>`
            : ''
        }
          <h2 class="post-card-title">
            <a href="${hit.url}">
              ${hit.title}
            </a>
          </h2>
      </header>
    `;

    const authorList = `
      <ul class="author-list" data-test-label="author-list">
        ${
          hit.originalPost
            ? `
          <li class="author-list-item">
            <a href="${hit.originalPost.author.url}" class="static-avatar">
            ${
              hit.originalPost.author.profileImage
                ? `
              <img
                  class="author-profile-image"
                  src="${getResizedImage(
                    hit.originalPost.author.profileImage,
                    30
                  )}"
                  alt="${hit.originalPost.author.name}"
                  width="30"
                  height="30"
                  ${lazyLoad ? 'loading="lazy"' : ''}
                  data-test-label="author-profile-image"
                >
              `
                : `
                <span class="avatar-wrapper">
                  {% set avatarTitle = "${hit.originalPost.author.name}" %}
                  {% include "partials/icons/avatar.njk" %}
                </span>
              `
            }
            </a>
            <span class="meta-content">
              <a class="meta-item" href="${hit.originalPost.author.url}">
                {% t 'original-author-translator.roles.author', { name: '${
                  hit.originalPost.author.name
                }', locale: '${hit.originalPost.translatedLocale}' } %}
              </a>
              <time class="meta-item" datetime="${
                hit.originalPost.publishedAt
              }"></time>
            </span>
          </li>
        `
            : ''
        }
        <li class="author-list-item">
          <a href="${hit.author.url}" class="static-avatar">
            ${
              hit.author.profileImage
                ? `
              <img
                class="author-profile-image"
                src="${getResizedImage(hit.author.profileImage, 30)}"
                alt="${hit.author.name}"
                width="30"
                height="30"
                ${lazyLoad ? 'loading="lazy"' : ''}
                data-test-label="author-profile-image"
              >
            `
                : `
              <span class="avatar-wrapper">
                {% set avatarTitle = "${hit.author.name}" %}
                {% include "partials/icons/avatar.njk" %}
              </span>
            `
            }
          </a>
          <span class="meta-content">
            <a class="meta-item" href="${hit.author.url}">
              ${
                hit.originalPost
                  ? `
                {% t 'original-author-translator.roles.translator', { name: '${hit.author.name}' } %}
              `
                  : `
                ${hit.author.name}
              `
              }
            </a>
            <time class="meta-item" datetime="${hit.publishedAt}"></time>
          </span>
        </li>
      </ul>
    `;

    const articleEl = document.createElement('article');
    articleEl.className = 'post-card';
    articleEl.setAttribute('data-test-label', 'post-card');
    articleEl.innerHTML = `
      ${
        hit.featureImage
          ? featureImageEl
          : '<div class="no-feature-image-offsetter"></div>'
      }
      <div class="post-card-content">
        <div class="post-card-content-link">
          ${headerEl}
        </div>
        <footer class="post-card-meta">
          ${
            hit.author.name === 'freeCodeCamp.org'
              ? `
          <time class="meta-item-single" datetime="${hit.publishedAt}"></time>
          `
              : authorList
          }
        </footer>
      </div>
    `;

    return articleEl;
  };

  const renderLoadMoreBtn = () => {
    const inner = document.querySelector('.inner');

    const readMoreRow = document.createElement('div');
    readMoreRow.className = 'read-more-row';

    const loadMoreBtn = document.createElement('button');
    loadMoreBtn.innerHTML = `{% t 'buttons.load-more-articles' %}`;
    loadMoreBtn.id = 'readMoreBtn';

    loadMoreBtn.addEventListener('click', () => {
      // Iterate currPage and load next set of hits
      populatePage(++currPage);
    });

    // Append row and button to page
    readMoreRow.appendChild(loadMoreBtn);
    inner.appendChild(readMoreRow);
  };

  const removeLoadMoreBtn = () => {
    const readMoreRow = document.querySelector('.read-more-row');

    readMoreRow.remove();
  };

  const populatePage = async pageNo => {
    const hits = await getHits(pageNo);

    hits.forEach((hit, i) => {
      const lazyLoad = i >= 2;

      postFeed.appendChild(generateCardNode(hit, lazyLoad));
    });

    // Only render "Load More Articles" button
    // if there are more than 15 hits, meaning
    // that there are up to 15 more hits in the
    // next API call
    if (hits.length === 15) {
      // Check for existing button and render if none exists
      document.querySelector('#readMoreBtn') ? '' : renderLoadMoreBtn();
    } else {
      // Remove readMoreRow if a button exists and there are less than 15 hits
      document.querySelector('#readMoreBtn') ? removeLoadMoreBtn() : '';
    }
  };

  // Render for search page 0
  populatePage(currPage);
});
