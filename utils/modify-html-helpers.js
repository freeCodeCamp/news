const getVideoId = (...args) =>
  import('get-video-id').then(({ default: getVideoId }) => getVideoId(...args));
const jsdom = require('jsdom');
const { JSDOM } = jsdom;
const { parse } = require('path');

const embedAttributes = {
  youtube: {
    width: 560,
    height: 315,
    title: 'YouTube video player',
    allow:
      'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share',
    referrerpolicy: 'strict-origin-when-cross-origin',
    allowfullscreen: ''
  },
  vimeo: {
    width: 640,
    height: 360,
    title: 'Vimeo embed',
    allow: 'autoplay; fullscreen; picture-in-picture',
    allowfullscreen: ''
  },
  codepen: {
    width: '100%',
    height: 350,
    title: 'CodePen embed',
    scrolling: 'no',
    allowtransparency: 'true',
    allowfullscreen: 'true'
  },
  codesandbox: {
    width: '100%',
    height: 350,
    title: 'CodeSandbox embed',
    allow:
      'geolocation; microphone; camera; midi; vr; accelerometer; gyroscope; payment; ambient-light-sensor; encrypted-media; usb',
    sandbox:
      'allow-modals allow-forms allow-popups allow-scripts allow-same-origin'
  },
  giphy: {
    width: '100%',
    height: '100%',
    title: 'Giphy embed',
    allowfullscreen: ''
  },
  glitch: {
    width: '100%',
    height: 500,
    title: 'Glitch embed',
    allow:
      'geolocation; microphone; camera; midi; vr; accelerometer; gyroscope; payment; ambient-light-sensor; encrypted-media'
  },
  soundcloud: {
    width: '100%',
    height: 400,
    title: 'SoundCloud embed',
    scrolling: 'no'
  },
  spotify: {
    width: '100%',
    title: 'Spotify embed',
    allow:
      'autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture',
    allowfullscreen: ''
  },
  anchor: {
    width: '100%',
    height: 152,
    title: 'Anchor embed',
    scrolling: 'no'
  },
  runkit: {
    width: '100%',
    height: 350,
    title: 'RunKit embed',
    allow: 'autoplay'
  }
};

const setEmbedAttributes = (iframeEl, embedType) => {
  const attributes = embedAttributes[embedType];
  for (const [key, value] of Object.entries(attributes)) {
    iframeEl.setAttribute(key, value);
  }
};

const generateHashnodeEmbedMarkup = async embedURL => {
  try {
    const dom = new JSDOM();
    const document = dom.window.document;
    const iframe = document.createElement('iframe');
    iframe.setAttribute(
      'style',
      'aspect-ratio: 16 / 9; width: 100%; height: auto;'
    ); // Set a default aspect ratio for most embeds

    if (
      [/https:\/\/.*\.?youtube\.com\//, /https:\/\/youtu\.be\//].some(pattern =>
        pattern.test(embedURL)
      )
    ) {
      const { id } = await getVideoId(embedURL);
      setEmbedAttributes(iframe, 'youtube');
      iframe.setAttribute('src', `https://www.youtube.com/embed/${id}`);

      return iframe.outerHTML;
    }

    if (
      [/https:\/\/vimeo\.com\//, /https:\/\/player\.vimeo\.com\/video\//].some(
        pattern => pattern.test(embedURL)
      )
    ) {
      const { id } = await getVideoId(embedURL);
      setEmbedAttributes(iframe, 'vimeo');
      iframe.setAttribute('src', `https://player.vimeo.com/video/${id}`);

      return iframe.outerHTML;
    }

    if (/https:\/\/codepen.io\//.test(embedURL)) {
      setEmbedAttributes(iframe, 'codepen');
      iframe.setAttribute(
        'src',
        embedURL.replace(/\/pen\/|\/full\//, '/embed/')
      );

      return iframe.outerHTML;
    }

    if (
      [
        /https:\/\/codesandbox\.io\/(s|p)\//,
        /https:\/\/codesandbox.io\/embed\//
      ].some(pattern => pattern.test(embedURL))
    ) {
      setEmbedAttributes(iframe, 'codesandbox');
      iframe.setAttribute('src', embedURL);

      return iframe.outerHTML;
    }

    if (
      [
        /https:\/\/twitter\.com\/.*\/status\//,
        /https:\/\/.*\.twitter\.com\/.*\/status\//
      ].some(pattern => pattern.test(embedURL))
    ) {
      return `
        <blockquote class="twitter-tweet">
          <a href="${embedURL}"></a>
        </blockquote>
        <script defer src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>`;
    }

    const giphyRegExpressions = [
      /https:\/\/giphy\.com\/gifs\/(.*)/,
      /https:\/\/giphy\.com\/clips\/(.*)/,
      /https?:\/\/gph\.is\/(.*)/,
      /https:\/\/media\.giphy\.com\/media\/(.*)\/giphy\.gif/
    ];
    const giphyMatch = giphyRegExpressions
      .map(pattern => embedURL.match(pattern))
      .filter(match => match)[0];
    if (giphyMatch) {
      const giphyId = giphyMatch[1].split('-').pop();
      const giphyWrapper = document.createElement('div');
      giphyWrapper.classList.add('giphy-wrapper');
      giphyWrapper.setAttribute(
        'style',
        'width: 100%; height: 0; padding-bottom: 125%; position: relative;'
      );
      setEmbedAttributes(iframe, 'giphy');
      iframe.setAttribute('src', `https://giphy.com/embed/${giphyId}`);
      iframe.setAttribute('style', 'position: absolute');

      giphyWrapper.appendChild(iframe);
      return giphyWrapper.outerHTML;
    }

    if (/https:\/\/gist\.github\.com\//.test(embedURL)) {
      return `
        <script src="${embedURL}.js"></script>`;
    }

    if (/https:\/\/glitch\.com\/embed\//.test(embedURL)) {
      setEmbedAttributes(iframe, 'glitch');
      iframe.setAttribute('src', embedURL);

      return iframe.outerHTML;
    }

    if (
      [
        /https?:\/\/soundcloud\.com\//,
        /https:\/\/on\.soundcloud\.com\//,
        /https:\/\/soundcloud\.app\.goog\.gl\//
      ].some(pattern => pattern.test(embedURL))
    ) {
      setEmbedAttributes(iframe, 'soundcloud');
      iframe.setAttribute(
        'src',
        `https://w.soundcloud.com/player/?url=${embedURL}&visual=true&show_artwork=true`
      );

      return iframe.outerHTML;
    }

    if (/https:\/\/open\.spotify\.com\//.test(embedURL)) {
      const embedPath = new URL(embedURL).pathname;
      const [type, id] = embedPath.split('/').filter(Boolean);
      setEmbedAttributes(iframe, 'spotify');
      if (type !== 'playlist') iframe.removeAttribute('style');
      iframe.setAttribute('height', type === 'playlist' ? 352 : 152);
      iframe.setAttribute(
        'src',
        `https://open.spotify.com/embed/${type}/${id}`
      );

      return iframe.outerHTML;
    }

    if (/https:\/\/anchor\.fm\//.test(embedURL)) {
      const podcastPath = new URL(embedURL).pathname;
      const [podcastName, type, podcastSlug] = podcastPath
        .split('/')
        .filter(Boolean);
      setEmbedAttributes(iframe, 'anchor');
      // Assume the podcast is an episode and use the same height as the Spotify embed
      // for a single episode
      iframe.setAttribute('height', 152);
      iframe.removeAttribute('style');
      iframe.setAttribute(
        'src',
        `https://anchor.fm/${podcastName}/embed/${type}/${podcastSlug}`
      );

      return iframe.outerHTML;
    }

    if (/https:\/\/runkit\.com\//.test(embedURL)) {
      const embedPath = new URL(embedURL).pathname;
      const [username, repoHash] = embedPath.split('/').filter(Boolean);
      setEmbedAttributes(iframe, 'runkit');
      iframe.setAttribute(
        'src',
        `https://runkit.com/e/oembed-iframe?target=%2Fusers%2F${username}%2Frepositories%2F${repoHash}%2Fdefault&referrer=`
      );

      return iframe.outerHTML;
    }

    // No HTML can be generated or found for the given URL
    return null;
  } catch (err) {
    console.log(`Error processing Hashnode embed: ${err}`);
  }
};

const setDefaultAlt = el => {
  const filename = parse(el.src).name;

  el.setAttribute('alt', filename);
  return el;
};

module.exports = {
  generateHashnodeEmbedMarkup,
  setDefaultAlt
};
