document.addEventListener('DOMContentLoaded', () => {
  document.cookie = 'reader=1; SameSite=None; Secure';

  // eslint-disable-next-line no-undef
  if (isAuthenticated) {
    const inner = document.querySelector('.inner');
    const adWrappers = document.querySelectorAll('.ad-wrapper');

    inner.classList.remove('ad-layout');
    adWrappers.forEach(adWrapper => adWrapper.remove());
  }
});
