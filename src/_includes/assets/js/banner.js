document.addEventListener('DOMContentLoaded', () => {
  const bannerText = document.getElementById('banner-text');
  const banner = document.getElementById('banner');

  // eslint-disable-next-line no-undef
  if (notAuthenticated) {
    bannerText.innerText = `{% t 'banner', {
      '<0>': '<span>',
      '</0>': '</span>',
      interpolation: {
          escapeValue: false
      }
    } %}`;
  } else {
    bannerText.innerText = `{% t 'embed-title' %}`;
  }
  banner.classList.add('fade-in');
});
