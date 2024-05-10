const extract = (...args) =>
  import('@extractus/oembed-extractor').then(({ extract }) => extract(...args));
const getVideoId = (...args) =>
  import('get-video-id').then(({ default: getVideoId }) => getVideoId(...args));
const { parse } = require('path');

const generateHashnodeEmbedMarkup = async embedURL => {
  try {
    if (
      [/https:\/\/.*\.youtube\.com\//, /https:\/\/youtu\.be\//].some(pattern =>
        pattern.test(embedURL)
      )
    ) {
      const { id } = await getVideoId(embedURL);

      return `
        <iframe
          width="560"
          height="315"
          src="https://www.youtube.com/embed/${id}"
          style="aspect-ratio: 16 / 9; width: 100%; height: auto;"
          title="YouTube video player"
          frameborder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerpolicy="strict-origin-when-cross-origin"
          allowfullscreen=""
        ></iframe>`;
    }

    if (
      [/https:\/\/vimeo\.com\//, /https:\/\/player\.vimeo\.com\/video\//].some(
        pattern => pattern.test(embedURL)
      )
    ) {
      const { id } = await getVideoId(embedURL);

      return `
        <iframe
          width="640"
          height="360"
          src="https://player.vimeo.com/video/${id}"
          style="aspect-ratio: 16 / 9; width: 100%; height: auto;"
          title="Vimeo embed"
          frameborder="0"
          allow="autoplay; fullscreen; picture-in-picture"
          allowfullscreen=""
        ></iframe>`;
    }

    if (/https:\/\/codepen.io\//.test(embedURL)) {
      return `
        <iframe
          width="100%"
          height="350"
          src="${embedURL.replace(/\/pen\/|\/full\//, '/embed/')}"
          style="aspect-ratio: 16 / 9; width: 100%; height: auto;"
          title="CodePen embed"
          scrolling="no"
          frameborder="0"
          allowtransparency="true"
          allowfullscreen="true"
        ></iframe>`;
    }

    if (
      [
        /https:\/\/codesandbox\.io\/(s|p)\//,
        /https:\/\/codesandbox.io\/embed\//
      ].some(pattern => pattern.test(embedURL))
    ) {
      return `
        <iframe
          width="100%"
          height="350"
          src="${embedURL.replace('/s/', '/embed/')}"
          style="aspect-ratio: 16 / 9; width: 100%; height: auto;"
          title="CodeSandbox embed"
          style="border:0; border-radius: 4px; overflow: hidden;"
          allow="geolocation; microphone; camera; midi; vr; accelerometer; gyroscope; payment; ambient-light-sensor; encrypted-media; usb"
          sandbox="allow-modals allow-forms allow-popups allow-scripts allow-same-origin"
        ></iframe>`;
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

      return `
        <div class="giphy-wrapper" style="width: 100%; height: 0; padding-bottom: 125%; position: relative;">
          <iframe
            width="100%"
            height="100%"
            title="Giphy embed"
            src="https://giphy.com/embed/${giphyId}"
            style="position: absolute"
            frameBorder="0"
            allowFullScreen=""
          ></iframe>
        </div>`;
    }

    if (/https:\/\/gist\.github\.com\//.test(embedURL)) {
      return `
        <script src="${embedURL}.js"></script>`;
    }

    if (/https:\/\/glitch\.com\/embed\//.test(embedURL)) {
      return `
        <iframe
          width="100%"
          height="500"
          src="${embedURL}"
          style="aspect-ratio: 16 / 9; width: 100%; height: auto;"
          title="Glitch embed"
          allow="geolocation; microphone; camera; midi; vr; accelerometer; gyroscope; payment; ambient-light-sensor; encrypted-media"
          style="border: 0;"
        ></iframe>`;
    }

    if (
      [
        /https?:\/\/soundcloud\.com\//,
        /https:\/\/on\.soundcloud\.com\//,
        /https:\/\/soundcloud\.app\.goog\.gl\//
      ].some(pattern => pattern.test(embedURL))
    ) {
      return `
        <iframe
          width="100%"
          height="400"
          src="https://w.soundcloud.com/player/?url=${embedURL}&visual=true&show_artwork=true"
          style="aspect-ratio: 16 / 9; width: 100%; height: auto;"
          title="SoundCloud embed"
          scrolling="no"
          frameborder="no"
          allow="autoplay"
        ></iframe>`;
    }

    if (/https:\/\/open\.spotify\.com\//.test(embedURL)) {
      const embedPath = new URL(embedURL).pathname;
      const [type, id] = embedPath.split('/').filter(Boolean);

      return `
        <iframe
          width="100%"
          height="${type === 'playlist' ? 352 : 152}"
          src="https://open.spotify.com/embed/${type}/${id}"
          style="${type === 'playlist' ? 'aspect-ratio: 16 / 9; width: 100%; height: auto;' : ''}"
          title="Spotify embed"
          frameborder="0"
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          allowfullscreen=""
        ></iframe>`;
    }

    if (/https:\/\/anchor\.fm\//.test(embedURL)) {
      const podcastPath = new URL(embedURL).pathname;
      const [podcastName, _, podcastSlug] = podcastPath
        .split('/')
        .filter(Boolean);

      // Assume the podcast is an episode and use the same height as the Spotify embed
      // for a single episode
      return `
        <iframe
          width="100%"
          height="152"
          src="https://anchor.fm/${podcastName}/embed/episodes/${podcastSlug}"
          title="Anchor embed"
          frameborder="0"
          scrolling="no"
        ></iframe>`;
    }

    if (/https:\/\/runkit\.com\//.test(embedURL)) {
      const embedPath = new URL(embedURL).pathname;
      const [username, repoHash] = embedPath.split('/').filter(Boolean);

      return `
        <iframe
          width="100%"
          height="350"
          src="https://runkit.com/e/oembed-iframe?target=%2Fusers%2F${username}%2Frepositories%2F${repoHash}%2Fdefault&referrer="
          style="aspect-ratio: 16 / 9; width: 100%; height: auto;"
          title="RunKit embed"
          frameborder="no"
          allow="autoplay"
        ></iframe>`;
    }

    // Attempt to extract oembed data from the URL for other providers
    const oembedRes = await extract(embedURL);
    // Some providers don't return an HTML embed, so check for one and return it if it exists
    if (oembedRes.hasOwnProperty('html')) {
      return oembedRes.html;
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
