document.addEventListener('DOMContentLoaded', () => {
  const postFeed = document.querySelector('.post-feed');
  const localizeDates = datesList => {
    datesList.forEach(date => {
      const dateStr = date.getAttribute('datetime');
      // eslint-disable-next-line no-undef
      const dateObj = dayjs(dateStr);

      // Display either time since published or month, day, and year
      date.innerHTML = dateObj.format('LL');
    });
  };

  // Localize dates when loading more articles to the page
  const config = {
    childList: true,
    attributes: true,
    subtree: true,
    characterData: true
  };
  const observer = new MutationObserver(mutations => {
    // Capture new article nodes that are appended to the page
    // and localize their dates
    const newNodes = mutations.map(mutation => [...mutation.addedNodes]).flat();
    const newPostDates = newNodes
      .map(node => [...node.querySelectorAll('time')])
      .flat(1);

    observer.disconnect();
    localizeDates(newPostDates);
    observer.observe(postFeed, config);
  });

  // Observe mutations as the search results page loads and
  // new hits are appended
  if (postFeed) observer.observe(postFeed, config);
});
