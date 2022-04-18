document.addEventListener('DOMContentLoaded', () => {
  const bannerText = document.getElementById('banner-text');

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
});
