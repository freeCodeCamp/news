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
  if (isAuthenticated) {
    bannerTextNode.innerHTML = isDonor ? bannerDonorText : bannerAuthText;
    bannerAnchor.href = isDonor ? bannerDonorLink : bannerAuthLink;
    const textVariationType = isDonor ? 'donor' : 'authenticated';
    bannerAnchor.setAttribute('text-variation', textVariationType);
  } else {
    bannerTextNode.innerHTML = bannerDefaultText;
    bannerAnchor.href = bannerDefaultLink;
    bannerAnchor.setAttribute('text-variation', 'default');
  }
});
