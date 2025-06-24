import jsdom from 'jsdom';

import { translate } from './translate.js';
import {
  generateHashnodeEmbedMarkup,
  setDefaultAlt
} from './modify-html-helpers.js';
import { getImageDimensions } from './get-image-dimensions.js';
import { fitVids } from './fitvids.js';

const { JSDOM } = jsdom;

export const modifyHTMLContent = async ({ postContent, postTitle, source }) => {
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
      const { width, height } = await getImageDimensions(
        image.src,
        `Body image in ${postTitle}: ${image.src}`
      );

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
        !['embed-wrapper', 'giphy-wrapper'].some(className =>
          iframe?.parentElement?.classList.contains(className)
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
