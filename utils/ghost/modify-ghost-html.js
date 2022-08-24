const jsdom = require('jsdom');
const { JSDOM } = jsdom;
const translate = require('../translate');
const { setDefaultAlt } = require('./helpers');
const getImageDimensions = require('../get-image-dimensions');
const {
  adsEnabled,
  googleAdsenseDataAdClient,
  googleAdsenseDataAdSlot
} = require('../../config');

const generateAdHTML = type => {
  return `<div class="ad-container ${
    type === 'banner' ? 'banner' : ''
  }" data-test-label="ad-container">
    <span class="ad-text" data-test-label="ad-text">${translate(
      'ad-text'
    ).toUpperCase()}</span>
    <ins
        class="adsbygoogle"
        data-ad-client="${googleAdsenseDataAdClient}"
        data-ad-slot="${googleAdsenseDataAdSlot}"
        data-ad-format="${type === 'banner' ? 'auto' : 'rectangle'}"
    ></ins>
    <script>
      window.addEventListener('load', () => {
          if (notAuthenticated) (adsbygoogle = window.adsbygoogle || []).push({});
      });
    </script>
  </div>`;
};

const modifyGhostHTML = async obj => {
  const dom = new JSDOM(obj.html);
  const document = dom.window.document;
  const title = obj.title;
  const images = [...document.getElementsByTagName('img')];
  const iframes = [...document.getElementsByTagName('iframe')];

  await Promise.all(
    images.map(async image => {
      // To do: swap out the image URLs here once we have them auto synced
      // with an S3 bucket
      const { width, height } = await getImageDimensions(image.src, title);

      image.setAttribute('width', width);
      image.setAttribute('height', height);

      if (!image.alt) setDefaultAlt(image);

      image.setAttribute('loading', 'lazy');
    }),

    iframes.map(async iframe => {
      iframe.setAttribute('title', `${translate('embed-title')}`);

      iframe.setAttribute('loading', 'lazy');
    })
  );

  if (adsEnabled) {
    // Include 2 ads by default, then add 1 ad for every 2 mins of reading time
    // if reading time <= 4 mins. Else, add 1 ad for every 1 min of reading time
    const maxBodyAds = Math.floor(Math.round(obj.reading_time / 2) + 2);
    const allHeadingEls = [
      ...document.querySelectorAll('h1, h2, h3, h4, h5, h6')
    ];
    // Filter out the post title, but leave other possible h1 elements that authors may have added.
    // Also attempt to filter out any heading elements that immediately follow another heading element.
    const targetHeadingEls = allHeadingEls.filter(
      headingEl =>
        !headingEl.classList.contains('post-full-title') &&
        !headingEl?.previousElementSibling?.nodeName?.match(/H\d/)
    );
    // Remove the first heading element, which can often be too early in an article for an ad to appear
    targetHeadingEls.shift();

    // Append rectangle style ads to target heading elements
    if (targetHeadingEls.length <= maxBodyAds) {
      targetHeadingEls.forEach(headingEl =>
        headingEl.insertAdjacentHTML('beforebegin', generateAdHTML('rectangle'))
      );
    } else {
      // Attempt to evenly distribute ads if there are more target heading elements than possible ads,
      // but lean towards showing fewer ads by rounding up
      const nth = Math.ceil(targetHeadingEls.length / maxBodyAds);

      for (let i = 0; i <= targetHeadingEls.length - 1; i += nth) {
        // Optional chaining to prevent out of bounds errors
        targetHeadingEls[i]?.insertAdjacentHTML(
          'beforebegin',
          generateAdHTML('rectangle')
        );
      }
    }

    // Append HTML for banner ad to the post object
    obj.banner_ad_html = generateAdHTML('banner');
  }

  // The jsdom parser wraps the incomplete HTML from the Ghost
  // API with HTML, head, and body elements, so return whatever
  // is within the new body element it added
  obj.html = document.body.innerHTML;

  return obj;
};

module.exports = modifyGhostHTML;
