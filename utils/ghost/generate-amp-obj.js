const jsdom = require('jsdom');
const { JSDOM } = jsdom;
const { extname } = require('path');
const translate = require('../translate');
const {
  htmlSanitizer,
  allowedAMPAttributes
} = require('../transforms/html-sanitizer');

const generateAMPObj = async obj => {
  // Create object to hold results
  const ampObj = {
    html: '',
    elements: {
      'amp-img': false,
      'amp-anim': false,
      'amp-youtube': false,
      'amp-iframe': false,
      'amp-video': false,
      'amp-audio': false
    }
  };
  const html = obj.html;
  const dom = new JSDOM(html);
  const document = dom.window.document;
  const imgEls = [...document.getElementsByTagName('img')];
  const iframeEls = [...document.getElementsByTagName('iframe')];
  const audioEls = [...document.getElementsByTagName('audio')];
  const videoEls = [...document.getElementsByTagName('video')];

  const setAllowedAttributes = (allowedAttributesArr, originalEl, ampEl) => {
    allowedAttributesArr.forEach(attributeName => {
      const booleanAttributes = ['loop', 'autoplay', 'muted'];

      if (originalEl.hasAttribute(attributeName)) {
        // Add boolean attribute to the ampEl so it is present,
        // but prevent it from being set to "true"
        if (booleanAttributes.includes(attributeName)) {
          return ampEl.setAttribute(attributeName, '');
        }

        // Set allowed attribute to the value from the original element
        return ampEl.setAttribute(
          attributeName,
          originalEl.getAttribute(attributeName)
        );
      }
    });

    return ampEl;
  };

  const setWidthAndHeight = ampEl => {
    ampEl.setAttribute(
      'width',
      !ampEl.width || ampEl.width.toString().includes('%') ? 600 : ampEl.width
    );
    ampEl.setAttribute(
      'height',
      !ampEl.height || ampEl.height.toString().includes('%')
        ? 400
        : ampEl.height
    );

    return ampEl;
  };

  const addFallback = ampEl => {
    const fallbackDiv = document.createElement('div');
    const fallbackParagraph = document.createElement('p');
    const type = ampEl.tagName.toLowerCase();
    const i18nKey = type.replace('amp-', '');
    const fallbackElType = translate(`fallback.${i18nKey}`);

    fallbackDiv.setAttribute('fallback', '');
    fallbackParagraph.innerHTML = `${translate('fallback.message', {
      element: fallbackElType
    })}`;
    fallbackDiv.appendChild(fallbackParagraph);
    ampEl.appendChild(fallbackDiv);

    return ampEl;
  };

  await Promise.all(
    imgEls.map(async imgEl => {
      const width = imgEl.getAttribute('width');
      // Special handling for small image and gif sizes
      const layoutType = width < 300 ? 'fixed' : 'responsive';

      // Create <amp-img> elements
      if (extname(imgEl.src).toLowerCase() !== '.gif') {
        let ampImgEl = document.createElement('amp-img');

        ampImgEl = setAllowedAttributes(
          allowedAMPAttributes['amp-img'],
          imgEl,
          ampImgEl
        );
        ampImgEl.setAttribute('layout', layoutType);

        // Set element type for dynamically loading scripts in template
        ampObj.elements['amp-img'] = true;

        imgEl.replaceWith(ampImgEl);
      } else {
        // Create <amp-anim> elements
        let ampAnimEl = document.createElement('amp-anim');

        ampAnimEl = setAllowedAttributes(
          allowedAMPAttributes['amp-anim'],
          imgEl,
          ampAnimEl
        );
        ampAnimEl.setAttribute('layout', layoutType);

        // Set element type for dynamically loading scripts in template
        ampObj.elements['amp-anim'] = true;

        imgEl.replaceWith(ampAnimEl);
      }
    }),

    iframeEls.map(iframeEl => {
      // This code is based heavily on the implementation
      // here: https://github.com/jbhannah/amperize
      const youtubeRe = iframeEl.src.match(
        /^.*(youtu.be\/|youtube(-nocookie)?.com\/(v\/|.*u\/\w\/|embed\/|.*v=))([\w-]{11}).*/
      );
      // Set width and height for all iframes, and use defaults if necessary
      iframeEl = setWidthAndHeight(iframeEl);

      // Create <amp-youtube> elements
      if (youtubeRe) {
        let ampYouTubeEl = document.createElement('amp-youtube');

        ampYouTubeEl = setAllowedAttributes(
          allowedAMPAttributes['amp-youtube'],
          iframeEl,
          ampYouTubeEl
        );
        ampYouTubeEl.setAttribute('layout', 'responsive');
        ampYouTubeEl.setAttribute('data-videoid', youtubeRe[4]);

        // Set element type for dynamically loading scripts in template
        ampObj.elements['amp-youtube'] = true;

        iframeEl.replaceWith(ampYouTubeEl);
      } else {
        // Create <amp-iframe> elements
        let ampIframeEl = document.createElement('amp-iframe');

        ampIframeEl = setAllowedAttributes(
          allowedAMPAttributes['amp-iframe'],
          iframeEl,
          ampIframeEl
        );
        ampIframeEl.setAttribute('layout', 'responsive');

        // Special handling for the sandbox attribute
        ampIframeEl.sandbox
          ? ampIframeEl.sandbox
          : ampIframeEl.setAttribute(
              'sandbox',
              'allow-scripts allow-same-origin allow-popups'
            );

        // Set element type for dynamically loading scripts in template
        ampObj.elements['amp-iframe'] = true;

        iframeEl.replaceWith(ampIframeEl);
      }
    }),

    // Create <amp-audio> elements
    audioEls.map(audioEl => {
      const sourceEls = [...audioEl.getElementsByTagName('source')];
      let ampAudioEl = document.createElement('amp-audio');

      ampAudioEl = setAllowedAttributes(
        allowedAMPAttributes['amp-audio'],
        audioEl,
        ampAudioEl
      );

      // Add source elements as children
      sourceEls.forEach(source => ampAudioEl.appendChild(source));
      ampAudioEl = addFallback(ampAudioEl);

      // Set element type for dynamically loading scripts in template
      ampObj.elements['amp-audio'] = true;

      audioEl.replaceWith(ampAudioEl);
    }),

    // Create <amp-video> elements
    videoEls.map(videoEl => {
      // Set width and height for all videos, and use defaults if necessary
      videoEl = setWidthAndHeight(videoEl);

      const sourceEls = [...videoEl.getElementsByTagName('source')];
      let ampVideoEl = document.createElement('amp-video');

      ampVideoEl = setAllowedAttributes(
        allowedAMPAttributes['amp-video'],
        videoEl,
        ampVideoEl
      );
      ampVideoEl.setAttribute('layout', 'responsive');
      // Ensure controls are set
      ampVideoEl.setAttribute('controls', '');

      // Add source elements as children
      sourceEls.forEach(source => ampVideoEl.appendChild(source));
      ampVideoEl = addFallback(ampVideoEl);

      // Set element type for dynamically loading scripts in template
      ampObj.elements['amp-video'] = true;

      videoEl.replaceWith(ampVideoEl);
    })
  );

  const cleanHtml = htmlSanitizer(dom.window.document.body.innerHTML);
  ampObj.html = cleanHtml;

  return ampObj;
};

module.exports = generateAMPObj;
