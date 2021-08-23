document.addEventListener('DOMContentLoaded', () => {
  const postDates = [...document.querySelectorAll('.post-card-meta .meta-content > time.meta-item')];

  postDates.forEach(date => {
    const dateStr = date.getAttribute('datetime');

    // Display time ago date
    // eslint-disable-next-line no-undef
    date.innerHTML = dayjs().to(dayjs(dateStr));
  });
});
