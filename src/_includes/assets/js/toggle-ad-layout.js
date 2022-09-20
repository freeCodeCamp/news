document.addEventListener('DOMContentLoaded', () => {
  document.cookie = 'reader=1; SameSite=None; Secure';
  const inner = document.querySelector('.inner');

  // eslint-disable-next-line no-undef
  if (isAuthenticated) {
    inner.classList.add('hide-ads');
  }
});
