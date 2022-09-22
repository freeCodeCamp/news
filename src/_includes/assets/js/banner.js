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

  const bannerDonorText = `{% t 'banner.authenticated-donor', {
    '<0>': '<span>',
    '</0>': '</span>',
    interpolation: {
        escapeValue: false
    }
  } %}`;
  const bannerDonorLink = `{% t 'links:banner.authenticated-donor' %}`;

  // eslint-disable-next-line no-undef
  if (isAuthenticated) {
    bannerTextNode.innerHTML = bannerAuthText;
    bannerAnchor.href = bannerAuthLink;
    bannerAnchor.setAttribute('text-variation', 'authenticated');
    // eslint-disable-next-line no-undef
  } else if (isDonor) {
    bannerTextNode.innerHTML = bannerDonorText;
    bannerAnchor.href = bannerDonorLink;
    bannerAnchor.setAttribute('text-variation', 'donor');
  } else {
    bannerTextNode.innerHTML = bannerDefaultText;
    bannerAnchor.href = bannerDefaultLink;
    bannerAnchor.setAttribute('text-variation', 'default');
  }
});
