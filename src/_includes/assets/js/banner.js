document.addEventListener('DOMContentLoaded', () => {
  const bannerAnchor = document.getElementById('banner');
  const bannerTextNode = document.getElementById('banner-text');
  const bannerDefaultText = `{% t 'banner.default', {
      '<0>': '<span>',
      '</0>': '</span>',
      interpolation: {
          escapeValue: false
      }
    } %}`;
  const bannerDefaultLink = `{% t 'links:banner.default' %}`;
  const bannerAuthText = `{% t 'banner.authenticated', {
      '<0>': '<span>',
      '</0>': '</span>',
      interpolation: {
          escapeValue: false
      }
    } %}`;
  const bannerAuthLink = `{% t 'links:banner.authenticated' %}`;

  // eslint-disable-next-line no-undef
  if (notAuthenticated) {
    bannerTextNode.innerHTML = bannerDefaultText;
    bannerAnchor.href = bannerDefaultLink;
    bannerAnchor.setAttribute('text-variation', 'default');
  } else {
    bannerTextNode.innerHTML = bannerAuthText;
    bannerAnchor.href = bannerAuthLink;
    bannerAnchor.setAttribute('text-variation', 'authenticated');
  }
});
