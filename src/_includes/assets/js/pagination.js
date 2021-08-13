(async () => {
  const readMoreBtn = document.getElementById('readMoreBtn');
  const postFeed = document.querySelector('.post-feed');
  let nextPageNum = 1;
  
  const fetchNextPage = async () => {
    try {
      const nextPageUrl = `${window.location.href}${nextPageNum}/`;
      const res = await fetch(nextPageUrl);

      if (res.ok) {
        const text = await res.text();
        const parser = new DOMParser();
        const nextTag = document.querySelector('link[rel="next"]');

        if (nextTag) {
          nextTag.href = nextPageUrl;
        } else {
          const head = document.getElementsByTagName('head')[0];
          const link = document.createElement('link');
          link.rel = 'next';
          link.href = nextPageUrl;

          head.appendChild(link);
        }

        nextPageNum++;
        return await parser.parseFromString(text, 'text/html');
      } else {
        readMoreBtn.style.display = 'none';
      }
    } catch (e) {
      console.error(`Connection error: ${e}`);
    }
  }

  let nextPageHtml = await fetchNextPage();

  const renderArticles = async () => {
    const nextPagePostCards = [...nextPageHtml.querySelectorAll('.post-card')];
    nextPagePostCards.forEach(postCard => postFeed.appendChild(postCard));
    
    nextPageHtml = await fetchNextPage();
  }

  readMoreBtn.addEventListener('click', renderArticles);
})();
