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
    allowedAttributesArr.forEach(attribute => {
      const booleanAttributes = ['loop', 'autoplay', 'muted'];

      if (originalEl.hasAttribute(attribute)) {
        // Add boolean attribute to the ampEl so it is present,
        // but prevent it from being set to "true"
        if (booleanAttributes.includes(attribute)) {
          return ampEl.setAttribute(attribute, '');
        }

        return ampEl.setAttribute(attribute, originalEl[attribute]);
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
    imgEls.map(async img => {
      const width = img.getAttribute('width');
      // Special handling for small image and gif sizes
      const layoutType = width < 300 ? 'fixed' : 'responsive';

      // Create <amp-img> elements
      if (extname(img.src).toLowerCase() !== '.gif') {
        let ampImg = document.createElement('amp-img');

        ampImg = setAllowedAttributes(
          allowedAMPAttributes['amp-img'],
          img,
          ampImg
        );
        ampImg.setAttribute('layout', layoutType);

        // Set element type for dynamically loading scripts in template
        ampObj.elements['amp-img'] = true;

        img.replaceWith(ampImg);
      } else {
        // Create <amp-anim> elements
        let ampAnim = document.createElement('amp-anim');

        ampAnim = setAllowedAttributes(
          allowedAMPAttributes['amp-anim'],
          img,
          ampAnim
        );
        ampAnim.setAttribute('layout', layoutType);

        // Set element type for dynamically loading scripts in template
        ampObj.elements['amp-anim'] = true;

        img.replaceWith(ampAnim);
      }
    }),

    iframeEls.map(iframe => {
      // This code is based heavily on the implementation
      // here: https://github.com/jbhannah/amperize
      const youtubeRe = iframe.src.match(
        /^.*(youtu.be\/|youtube(-nocookie)?.com\/(v\/|.*u\/\w\/|embed\/|.*v=))([\w-]{11}).*/
      );
      // Set width and height for all iframes, and use defaults if necessary
      iframe = setWidthAndHeight(iframe);

      // Create <amp-youtube> elements
      if (youtubeRe) {
        let ampYouTube = document.createElement('amp-youtube');

        ampYouTube = setAllowedAttributes(
          allowedAMPAttributes['amp-youtube'],
          iframe,
          ampYouTube
        );
        ampYouTube.setAttribute('layout', 'responsive');
        ampYouTube.setAttribute('data-videoid', youtubeRe[4]);

        // Set element type for dynamically loading scripts in template
        ampObj.elements['amp-youtube'] = true;

        iframe.replaceWith(ampYouTube);
      } else {
        // Create <amp-iframe> elements
        let ampIframe = document.createElement('amp-iframe');

        ampIframe = setAllowedAttributes(
          allowedAMPAttributes['amp-iframe'],
          iframe,
          ampIframe
        );
        ampIframe.setAttribute('layout', 'responsive');

        // Special handling for the sandbox attribute
        ampIframe.sandbox
          ? ampIframe.sandbox
          : ampIframe.setAttribute(
              'sandbox',
              'allow-scripts allow-same-origin allow-popups'
            );

        // Set element type for dynamically loading scripts in template
        ampObj.elements['amp-iframe'] = true;

        iframe.replaceWith(ampIframe);
      }
    }),

    // Create <amp-audio> elements
    audioEls.map(audio => {
      const sourceEls = [...audio.getElementsByTagName('source')];
      let ampAudio = document.createElement('amp-audio');

      ampAudio = setAllowedAttributes(
        allowedAMPAttributes['amp-audio'],
        audio,
        ampAudio
      );

      // Add source elements as children
      sourceEls.forEach(source => ampAudio.appendChild(source));
      ampAudio = addFallback(ampAudio);

      // Set element type for dynamically loading scripts in template
      ampObj.elements['amp-audio'] = true;

      audio.replaceWith(ampAudio);
    }),

    // Create <amp-video> elements
    videoEls.map(video => {
      // Set width and height for all videos, and use defaults if necessary
      video = setWidthAndHeight(video);

      const sourceEls = [...video.getElementsByTagName('source')];
      let ampVideo = document.createElement('amp-video');

      ampVideo = setAllowedAttributes(
        allowedAMPAttributes['amp-video'],
        video,
        ampVideo
      );
      ampVideo.setAttribute('layout', 'responsive');
      // Ensure controls are set
      ampVideo.setAttribute('controls', '');

      // Add source elements as children
      sourceEls.forEach(source => ampVideo.appendChild(source));
      ampVideo = addFallback(ampVideo);

      // Set element type for dynamically loading scripts in template
      ampObj.elements['amp-video'] = true;

      video.replaceWith(ampVideo);
    })
  );

  const cleanHtml = htmlSanitizer(dom.window.document.body.innerHTML);
  ampObj.html = cleanHtml;

  return ampObj;
};

module.exports = generateAMPObj;
