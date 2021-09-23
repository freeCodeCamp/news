const sanitizeHtml = require('sanitize-html');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;
const { extname } = require('path');
const { getImageDimensions } = require('./image-dimensions');
const i18next = require('../i18n/config');

const allowedAMPTags = ['html', 'body', 'article', 'section', 'nav', 'aside', 'h1', 'h2',
  'h3', 'h4', 'h5', 'h6', 'header', 'footer', 'address', 'p', 'hr',
  'pre', 'blockquote', 'ol', 'ul', 'li', 'dl', 'dt', 'dd', 'figure',
  'figcaption', 'div', 'main', 'a', 'em', 'strong', 'small', 's', 'cite',
  'q', 'dfn', 'abbr', 'data', 'time', 'code', 'var', 'samp', 'kbd', 'sub',
  'sup', 'i', 'b', 'u', 'mark', 'ruby', 'rb', 'rt', 'rtc', 'rp', 'bdi',
  'bdo', 'span', 'br', 'wbr', 'ins', 'del', 'source', 'track', 'svg', 'g',
  'path', 'glyph', 'glyphref', 'marker', 'view', 'circle', 'line', 'polygon',
  'polyline', 'rect', 'text', 'textpath', 'tref', 'tspan', 'clippath',
  'filter', 'lineargradient', 'radialgradient', 'mask', 'pattern', 'vkern',
  'hkern', 'defs', 'stop', 'use', 'foreignobject', 'symbol', 'desc', 'title',
  'table', 'caption', 'colgroup', 'col', 'tbody', 'thead', 'tfoot', 'tr', 'td',
  'th', 'button', 'noscript', 'acronym', 'center', 'dir', 'hgroup', 'listing',
  'multicol', 'nextid', 'nobr', 'spacer', 'strike', 'tt', 'xmp', 'amp-img',
  'amp-video', 'amp-ad', 'amp-embed', 'amp-anim', 'amp-iframe', 'amp-youtube',
  'amp-pixel', 'amp-audio', 'O:P'];

const allowedAMPAttributes = {
  '*': ['itemid', 'itemprop', 'itemref', 'itemscope', 'itemtype', 'accesskey', 'class', 'dir', 'draggable',
      'id', 'lang', 'tabindex', 'title', 'translate', 'aria-*', 'role', 'placeholder', 'fallback', 'lightbox',
      'overflow', 'amp-access', 'amp-access-*', 'i-amp-access-id', 'data-*'],
  h1: ['align'],
  h2: ['align'],
  h3: ['align'],
  h4: ['align'],
  h5: ['align'],
  h6: ['align'],
  p: ['align'],
  blockquote: ['align'],
  ol: ['reversed', 'start', 'type'],
  li: ['value'],
  div: ['align'],
  a: ['href', 'hreflang', 'rel', 'role', 'tabindex', 'target', 'download', 'media', 'type', 'border', 'name'],
  time: ['datetime'],
  bdo: ['dir'],
  ins: ['datetime'],
  del: ['datetime'],
  source: ['src', 'srcset', 'sizes', 'media', 'type', 'kind', 'label', 'srclang'],
  track: ['src', 'default', 'kind', 'label', 'srclang'],
  svg: ['*'],
  g: ['*'],
  glyph: ['*'],
  glyphref: ['*'],
  marker: ['*'],
  path: ['*'],
  view: ['*'],
  circle: ['*'],
  line: ['*'],
  polygon: ['*'],
  polyline: ['*'],
  rect: ['*'],
  text: ['*'],
  textpath: ['*'],
  tref: ['*'],
  tspan: ['*'],
  clippath: ['*'],
  filter: ['*'],
  hkern: ['*'],
  lineargradient: ['*'],
  mask: ['*'],
  pattern: ['*'],
  radialgradient: ['*'],
  stop: ['*'],
  vkern: ['*'],
  defs: ['*'],
  symbol: ['*'],
  use: ['*'],
  foreignobject: ['*'],
  desc: ['*'],
  title: ['*'],
  table: ['sortable', 'align', 'border', 'bgcolor', 'cellpadding', 'cellspacing', 'width'],
  colgroup: ['span'],
  col: ['span'],
  tr: ['align', 'bgcolor', 'height', 'valign'],
  td: ['align', 'bgcolor', 'height', 'valign', 'colspan', 'headers', 'rowspan'],
  th: ['align', 'bgcolor', 'height', 'valign', 'colspan', 'headers', 'rowspan', 'abbr', 'scope', 'sorted'],
  button: ['disabled', 'name', 'role', 'tabindex', 'type', 'value', 'formtarget'],
  // Built ins
  'amp-img': ['media', 'noloading', 'alt', 'attribution', 'placeholder', 'src', 'srcset', 'width', 'height', 'layout'],
  'amp-pixel': ['src'],
  'amp-video': ['src', 'srcset', 'media', 'noloading', 'width', 'height', 'layout', 'alt', 'attribution',
      'autoplay', 'controls', 'loop', 'muted', 'poster', 'preload'],
  'amp-embed': ['media', 'noloading', 'width', 'height', 'layout', 'type', 'data-*', 'json'],
  'amp-ad': ['media', 'noloading', 'width', 'height', 'layout', 'type', 'data-*', 'json'],
  // Extended components Ghost supports
  'amp-anim': ['media', 'noloading', 'alt', 'attribution', 'placeholder', 'src', 'srcset', 'width', 'height', 'layout'],
  'amp-audio': ['src', 'width', 'height', 'autoplay', 'loop', 'muted', 'controls'],
  'amp-iframe': ['src', 'srcdoc', 'width', 'height', 'layout', 'frameborder', 'allowfullscreen', 'allowtransparency',
      'sandbox', 'referrerpolicy'],
  'amp-youtube': ['src', 'width', 'height', 'layout', 'frameborder', 'autoplay', 'loop', 'data-videoid', 'data-live-channelid']
};

const setAttributes = (source, target) => {
  const attributes = source.getAttributeNames();

  attributes.forEach((attr) => {
    target.setAttribute(attr, source.getAttribute(attr));
  });

  return target;
};

const ampHandler = async (obj) => {
  // Create object to hold results
  const ampObj = {
    html: '',
    elements: {}
  };
  const html = obj.html;
  const dom = new JSDOM(html);
  const document = dom.window.document;
  const imgEls = [...document.getElementsByTagName('img')];
  const iframeEls = [...document.getElementsByTagName('iframe')];
  const audioEls = [...document.getElementsByTagName('audio')];
  const videoEls = [...document.getElementsByTagName('video')];

  const createAmpAudioOrVideo = (type, originalEl) => {
    const sourceEls = [...originalEl.getElementsByTagName('source')];
    const fallbackDiv = document.createElement('div');
    const fallbackParagraph = document.createElement('p');
    const i18nKey = type.replace('amp-', '');
    const fallbackElType = i18next.t(`fallback.${i18nKey}`);
    let ampEl = document.createElement(type);

    // Set element type for dynamically loading scripts in template
    ampObj.elements[type] = true;

    ampEl = setAttributes(originalEl, ampEl);

    ampEl.setAttribute('src', sourceEls[0].src);

    fallbackDiv.setAttribute('fallback', '');
    fallbackParagraph.innerHTML = `${i18next.t('fallback.message', { element: fallbackElType })}`;
    fallbackDiv.appendChild(fallbackParagraph);
    ampEl.appendChild(fallbackDiv);

    sourceEls.forEach((source) => {
      ampEl.appendChild(source);
    });

    return ampEl;
  }

  await Promise.all(
    // Create <amp-img> and <amp-anim> elements
    imgEls.map(async (img) => {
      const title = obj.title;
      const { width, height } = await getImageDimensions(img.src, title);
      // Special handling for small image sizes
      const layoutType = width < 300 ? 'fixed' : 'responsive';
      const extension = extname(img.src);
      const targetEl = extension.toLowerCase() === '.gif' ? 'amp-anim' : 'amp-img';
      let ampEl = document.createElement(targetEl);

      // Set element type for dynamically loading scripts in template
      ampObj.elements[targetEl] = true;

      // Copy image attributes to ampEl
      ampEl = setAttributes(img, ampEl);

      // Set required attributes
      ampEl.setAttribute('layout', layoutType);
      ampEl.setAttribute('width', width);
      ampEl.setAttribute('height', height);

      img.replaceWith(ampEl);
    }),

    // Create <amp-iframe> and <amp-youtube> elements
    iframeEls.map((iframe) => {
      // This code is based heavily on the implementation
      // here: https://github.com/jbhannah/amperize
      const youtubeRe = iframe.src.match(
        /^.*(youtu.be\/|youtube(-nocookie)?.com\/(v\/|.*u\/\w\/|embed\/|.*v=))([\w-]{11}).*/
      );
      const targetEl = youtubeRe ? 'amp-youtube' : 'amp-iframe';
      let ampEl = document.createElement(targetEl);

      // Set element type for dynamically loading scripts in template
      ampObj.elements[targetEl] = true;

      // Copy iframe attributes to ampEl
      ampEl = setAttributes(iframe, ampEl);

      // Make all iframes responsive
      ampEl.setAttribute('layout', 'responsive');

      if (youtubeRe) {
        ampEl.setAttribute('data-videoid', youtubeRe[4]);

        ampEl.removeAttribute('src');
        ampEl.removeAttribute('sandbox');
        ampEl.removeAttribute('allowfullscreen');
        ampEl.removeAttribute('allow');
        ampEl.removeAttribute('frameborder');
      } else {
        ampEl.sandbox
          ? ampEl.sandbox
          : ampEl.setAttribute(
              'sandbox',
              'allow-scripts allow-same-origin allow-popups'
            );
      }

      ampEl.setAttribute('frameborder', '0');

      if (
        !ampEl.getAttribute('width') ||
        !ampEl.getAttribute('height') ||
        !ampEl.getAttribute('layout')
      ) {
        ampEl.setAttribute('width', ampEl.width ? ampEl.width : 600);
        ampEl.setAttribute('height', ampEl.height ? ampEl.height : 400);
      }

      iframe.replaceWith(ampEl);
    }),

    // Create <amp-audio> elements
    audioEls.map((audio) => {
      const ampAudio = createAmpAudioOrVideo('amp-audio', audio);

      audio.replaceWith(ampAudio);
    }),

    // Create <amp-video> elements
    videoEls.map((video) => {
      const ampVideo = createAmpAudioOrVideo('amp-video', video);

      video.replaceWith(ampVideo);
    })
  );

  const cleanHtml = sanitizeHtml(dom.window.document.body.innerHTML, {
    allowedTags: allowedAMPTags,
    allowedAttributes: allowedAMPAttributes,
    selfClosing: ['source', 'track', 'br'],
  });

  ampObj.html = cleanHtml;

  // Save results to post/page obj
  obj.amp = ampObj;

  return obj;
};

module.exports = {
  ampHandler,
};
