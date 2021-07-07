/* eslint-disable no-undef */
document.addEventListener('DOMContentLoaded', () => {
  const postDates = [...document.querySelectorAll('.post-card-meta > .meta-content > time.meta-item')];

  postDates.forEach(date => {
    const dateStr = date.getAttribute('datetime');

    // Display time ago date
    date.innerHTML = dayjs().to(dayjs(dateStr));
  });
});
