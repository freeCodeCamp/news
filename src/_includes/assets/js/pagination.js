(async () => {
  const readMoreBtn = document.getElementById('readMoreBtn');
  const readMoreRow = document.querySelector('.read-more-row');
  const postFeed = document.querySelector('.post-feed');
  let nextPageNum = 1;

  const fetchNextPage = async () => {
    try {
      const nextTag = document.querySelector('link[rel="next"]');
      let href = window.location.href;
      if (!href.endsWith('/')) href = `${href}/`;
      const nextPageUrl = `${href}${nextPageNum}/`;
      const res = await fetch(nextPageUrl);

      if (nextTag) nextTag.href = nextPageUrl;

      if (res.ok) {
        const text = await res.text();
        const parser = new DOMParser();

        nextPageNum++;
        return parser.parseFromString(text, 'text/html');
      } else {
        readMoreRow.remove();
      }
    } catch (e) {
      console.error(`Connection error: ${e}`);
    }
  };

  let nextPageHtml = await fetchNextPage();

  const renderArticles = async () => {
    const nextPagePostCards = [...nextPageHtml.querySelectorAll('.post-card')];
    nextPagePostCards.forEach(postCard => postFeed.appendChild(postCard));

    nextPageHtml = await fetchNextPage();
  };

  readMoreBtn.addEventListener('click', renderArticles);
})();
