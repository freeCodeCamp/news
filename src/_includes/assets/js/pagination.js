(async () => {
  const readMoreBtn = document.getElementById('readMoreBtn');
  const postFeed = document.querySelector('.post-feed');
  let nextPageNum = 1;
  
  const fetchNextPage = async () => {
    try {
      const nextTag = document.querySelector('link[rel="next"]');
      const nextPageUrl = `${window.location.href}${nextPageNum}/`;
      const res = await fetch(nextPageUrl);

      if (nextTag) nextTag.href = nextPageUrl;

      if (res.ok) {
        const text = await res.text();
        const parser = new DOMParser();

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
