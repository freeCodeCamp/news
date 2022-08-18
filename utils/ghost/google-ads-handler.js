const jsdom = require('jsdom');
const { JSDOM } = jsdom;
const {
  googleAdsenseDataAdClient,
  googleAdsenseDataAdSlot
} = require('../../config');

const createAdContainer = type => {
  return `<div class="ad-container ${type === 'banner' ? 'banner' : ''}">
    <span class="text">ADVERTISEMENT</span>
    <ins
        class="adsbygoogle"
        data-ad-client="${googleAdsenseDataAdClient}"
        data-ad-slot="${googleAdsenseDataAdSlot}"
        data-ad-format="${type === 'banner' ? 'auto' : 'rectangle'}"
    ></ins>
  </div>
  <script>
    window.addEventListener('load', () => {
        if (notAuthenticated) (adsbygoogle = window.adsbygoogle || []).push({});
    });
  </script>`;
};

const googleAdsHandler = async obj => {
  const dom = new JSDOM(obj.html);
  const document = dom.window.document;
  // Don't include h1 as it's the title of the post
  const headingEls = [...document.querySelectorAll('h2, h3, h4, h5, h6')];
  // Remove the first heading element to prevent ad placement early in the post
  headingEls.shift();

  // {# {% set numOfSidebarAds = (((post.reading_time / 2) if post.reading_time <= 4 else (post.reading_time)) + 2) | round(0, 'floor') %} #}
  // const numberOfAds = Math.floor(Math.round(readingTime / 2) + 2);

  // Rectangle style ads for ones in the post body
  headingEls.map(heading => {
    const ad = createAdContainer('rectangle');

    heading.insertAdjacentHTML('beforebegin', ad);
  });

  // Append HTML for banner ad to the post object
  const bannerAd = createAdContainer('banner');

  obj.banner_ad = bannerAd;

  // The jsdom parser wraps the incomplete HTML from the Ghost
  // API with HTML, head, and body elements, so return whatever
  // is within the new body element it added
  obj.html = document.body.innerHTML;

  return obj;
};

module.exports = googleAdsHandler;
