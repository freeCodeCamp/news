const jsdom = require('jsdom');
const { JSDOM } = jsdom;
const translate = require('./translate');
const {
  generateHashnodeEmbedMarkup,
  setDefaultAlt
} = require('./modify-html-helpers');
const getImageDimensions = require('./get-image-dimensions');
const fitVids = require('./fitvids');

const modifyHTMLContent = async ({ postContent, postTitle, source }) => {
  const dom = new JSDOM(postContent);
  const window = dom.window;
  const document = window.document;
  const hashnodeEmbedAnchorEls = [
    ...document.querySelectorAll('div.embed-wrapper a.embed-card')
  ];

  await Promise.all(
    hashnodeEmbedAnchorEls.map(async anchorEl => {
      const embedWrapper = anchorEl.parentElement;
      const embedURL = anchorEl.href;
      const embedMarkup = await generateHashnodeEmbedMarkup(embedURL);

      if (embedMarkup) {
        embedWrapper.innerHTML = embedMarkup;
      }
    })
  );

  const embeds = [...document.getElementsByTagName('embed')];
  const images = [...document.getElementsByTagName('img')];
  const iframes = [...document.getElementsByTagName('iframe')];

  if (source === 'Ghost' && (embeds.length || iframes.length)) fitVids(window);

  await Promise.all(
    images.map(async image => {
      // To do: swap out the image URLs here once we have them auto synced
      // with an S3 bucket
      const { width, height } = await getImageDimensions(image.src, postTitle);

      image.setAttribute('width', width);
      image.setAttribute('height', height);

      if (!image.alt) setDefaultAlt(image);

      image.setAttribute('loading', 'lazy');
    }),

    iframes.map(async iframe => {
      if (!iframe.title) iframe.setAttribute('title', translate('embed-title'));
      // For iframes on Hashnode that were copy and pasted into an HTML block,
      // wrap them in a div similar to how Hashnode does for links in embed blocks
      if (
        source === 'Hashnode' &&
        ![...iframe?.parentElement?.classList].includes(
          'embed-wrapper',
          'giphy-wrapper'
        )
      ) {
        const embedWrapper = document.createElement('div');

        embedWrapper.classList.add('embed-wrapper');
        iframe.parentElement.replaceChild(embedWrapper, iframe);
        embedWrapper.appendChild(iframe);
      }

      iframe.setAttribute('loading', 'lazy');
    })
  );

  // The jsdom parser wraps the incomplete HTML from the Ghost
  // API with HTML, head, and body elements, so return whatever
  // is within the new body element it added
  return document.body.innerHTML;
};

module.exports = modifyHTMLContent;
