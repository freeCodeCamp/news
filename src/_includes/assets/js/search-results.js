/* eslint-disable no-undef */
document.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);
  const queryStr = urlParams.get('query');
  const postFeed = document.querySelector('.post-feed');
  let currPage = 0;

  function getHits(pageNo) {
    return index
      .search({
        query: queryStr,
        hitsPerPage: 15,
        page: pageNo,
      })
      .then(({ hits } = {}) => {
        return hits;
      })
      .catch((err) => {
        console.log(err);
        console.log(err.debugData);
      });
  }

  async function renderSearchResults(arr) {
    arr.forEach((hit) => {
      const featureImage = hit.featureImage || null;
      const url = hit.url || '#';
      const title = hit.title || '#';
      const authorName = hit.author.name;
      const authorImage = hit.author.profileImage
        .replace('/content/images/', '/content/images/size/w30/'); // Get smaller author image
      const authorUrl = hit.author.url;
      const primaryTagCodeBlock =
        hit.tags.length === 0
          ? ''
          : `
          <a href="${hit.tags[0].url}">
            #${hit.tags[0].name}
          </a>
        `;
      const publishedAt = hit.publishedAt;
      const originalPost = hit.originalPost || null;
      const originalAuthor = originalPost ? originalPost.primaryAuthor : null;
      const originalAuthorImage = originalPost ? originalAuthor.profileImage
        .replace('/content/images/', '/content/images/size/w30/') : null;
      const articleItem = document.createElement('article');
      articleItem.className =
        'post-card post';
      const articleHTML = `
        ${
          featureImage
            ? `
          <a class="post-card-image-link" href="${url}" aria-label="${title}">
            <img
              class="post-card-image lazyload"
              data-srcset="
                ${featureImage}  300w,
                ${featureImage}  600w,
                ${featureImage} 1000w,
                ${featureImage} 2000w
              "
              sizes="
                (max-width: 360px) 300px,
                (max-width: 655px) 600px,
                (max-width: 767px) 1000px,
                (min-width: 768px) 300px,
                92vw
              "
              onerror="this.style.display='none'"
              data-src="${featureImage}"
              alt="${title}"
            />
          </a>
        `
            : `
          <div class="no-feature-image-offsetter"></div>
        `
        }
      <div class="post-card-content">
        <div class="post-card-content-link">
          <header class="post-card-header">
            <span class="post-card-tags">
              ${primaryTagCodeBlock}
            </span>
            <h2 class="post-card-title">
              <a href="${url}">
                ${title}
              </a>
            </h2>
          </header>
        </div>
        <footer class="post-card-meta">
          ${
            authorName === 'freeCodeCamp.org'
              ? `<time class="meta-item-single" datetime="${publishedAt}"></time>`
              : `
          <ul class="author-list">
            ${ originalPost ? `
              <li class="author-list-item">
                <div class="author-name-tooltip">
                  ${originalAuthor.name}
                </div>
                ${originalAuthor.profileImage ? `
                  <a href="${originalAuthor.url}" class="static-avatar">
                    <img
                      class="author-profile-image lazyload"
                      data-srcset="${originalAuthorImage} 30w"
                      data-src="${originalAuthorImage}"
                      alt="${originalAuthor.name}"
                    >
                  </a>
                ` : `
                <a href="${originalAuthor.url}" class="static-avatar author-profile-image">
                  {% include "partials/icons/avatar.njk" %}
                </a>
                `}
                <span class="meta-content">
                  <a class="meta-item" href="${originalAuthor.url}">{% t 'localization-meta.author', { authorName: '${originalAuthor.name}' } %} ({% t 'localization-meta.languages.en' %})</a>
                  <time class="meta-item" datetime="${originalPost.publishedAt}"></time>
                </span>
            ` : ''}
            <li class="author-list-item">
              <div class="author-name-tooltip">
                ${authorName}
              </div>
              ${
                authorImage
                  ? `
                <a href="${authorUrl}" class="static-avatar">
                  <img
                    class="author-profile-image lazyload"
                    data-srcset="${authorImage} 30w"
                    data-src="${authorImage}"
                    alt="${authorName}"
                  >
                </a>
              `
                  : `
                <a href="${authorUrl}" class="static-avatar author-profile-image">
                  {% include "partials/icons/avatar.njk" %}
                </a>
              `
              }
              <span class="meta-content">
                <a class="meta-item" href="${authorUrl}">
                  ${originalPost ? `
                    {% t 'localization-meta.translator', { translatorName: '${authorName}' } %}
                  ` : `
                    ${authorName}
                  `}
                </a>
                <time class="meta-item" datetime="${publishedAt}"></time>
              </span>
            </li>
          </ul>
        `
          }
        </footer>
      </div>
    `;

      articleItem.innerHTML = articleHTML;
      postFeed.appendChild(articleItem);
    });
  }

  function renderLoadMoreBtn() {
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
  }

  function removeLoadMoreBtn() {
    const readMoreRow = document.querySelector('.read-more-row');

    readMoreRow.remove();
  }

  async function populatePage(pageNo) {
    const hitsArr = await getHits(pageNo);

    await renderSearchResults(hitsArr);

    // Only render "Load More Articles" button
    // if there are more than 15 hits, meaning
    // that there are up to 15 more hits in the
    // next API call
    if (hitsArr.length === 15) {
      // Check for existing button and render if none exists
      document.querySelector('#readMoreBtn') ? '' : renderLoadMoreBtn();
    } else {
      // Remove readMoreRow if a button exists and there are less than 15 hits
      document.querySelector('#readMoreBtn') ? removeLoadMoreBtn() : '';
    }
  }

  // Render for search page 0
  populatePage(currPage);
});
