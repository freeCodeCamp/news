document.addEventListener('DOMContentLoaded', () => {
  const bannerText = document.getElementById('banner-text');

  const banner = `{% t 'banner', {
      '<0>': '<span>',
      '</0>': '</span>',
      interpolation: {
          escapeValue: false
      }
    } %}`;

  // eslint-disable-next-line no-undef
  if (notAuthenticated) {
    bannerText.innerHTML = banner;
  } else {
    bannerText.innerText = `{% t 'embed-title' %}`;
  }
});
