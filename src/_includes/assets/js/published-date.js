document.addEventListener('DOMContentLoaded', () => {
  const postFeed = document.querySelector('.post-feed');
  const postDates = [...document.getElementsByClassName('post-full-meta-date')];
  const localizeDates = (datesList) => {
    datesList.forEach((date) => {
      const dateStr = date.getAttribute('datetime');
      // eslint-disable-next-line no-undef
      const dateObj = dayjs(dateStr);

      // Display either time since published or month, day, and year
      date.innerHTML = dateObj.format('LL');
    });
  };

  // Localize dates on initial page load
  localizeDates(postDates);

  // Localize dates when loading more articles to the page
  const config = {
    childList: true,
    attributes: true,
    subtree: true,
    characterData: true,
  };
  const observer = new MutationObserver((mutations) => {
    // Capture new article nodes that are appended to the page
    // and localize their dates
    const newNodes = mutations
      .map((mutation) => [...mutation.addedNodes])
      .flat();
    const newPostDates = newNodes
      .map((node) => [...node.querySelectorAll('time')])
      .flat(1);

    observer.disconnect();
    localizeDates(newPostDates);
    observer.observe(postFeed, config);
  });

  // Only observe mutations on front page and search results page
  if (postFeed) observer.observe(postFeed, config);
});
