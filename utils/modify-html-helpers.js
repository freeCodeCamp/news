const getVideoId = (...args) =>
  import('get-video-id').then(({ default: getVideoId }) => getVideoId(...args));
const { parse } = require('path');

const embedMarkupMap = {
  youtube: id => `
    <iframe
      width="560"
      height="315"
      src="https://www.youtube.com/embed/${id}"
      style="aspect-ratio: 16 / 9; width: 100%; height: auto;"
      title="YouTube video player"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      referrerpolicy="strict-origin-when-cross-origin"
      allowfullscreen=""
    ></iframe>`,
  vimeo: id => `
    <iframe
      width="640"
      height="360"
      src="https://player.vimeo.com/video/${id}"
      style="aspect-ratio: 16 / 9; width: 100%; height: auto;"
      title="Vimeo embed"
      allow="autoplay; fullscreen; picture-in-picture"
      allowfullscreen=""
    ></iframe>`,
  codepen: url => `
    <iframe
      width="100%"
      height="350"
      src="${url.replace(/\/pen\/|\/full\//, '/embed/')}"
      style="aspect-ratio: 16 / 9; width: 100%; height: auto;"
      title="CodePen embed"
      scrolling="no"
      allowtransparency="true"
      allowfullscreen="true"
    ></iframe>`,
  codesandbox: url => `
    <iframe
      width="100%"
      height="350"
      src="${url.replace('/s/', '/embed/')}"
      style="aspect-ratio: 16 / 9; width: 100%; height: auto;"
      title="CodeSandbox embed"
      style="border:0; border-radius: 4px; overflow: hidden;"
      allow="geolocation; microphone; camera; midi; vr; accelerometer; gyroscope; payment; ambient-light-sensor; encrypted-media; usb"
      sandbox="allow-modals allow-forms allow-popups allow-scripts allow-same-origin"
    ></iframe>`,
  twitter: url => `
    <blockquote class="twitter-tweet">
      <a href="${url}"></a>
    </blockquote>
    <script defer src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>`,
  giphy: id => `
    <div class="giphy-wrapper" style="width: 100%; height: 0; padding-bottom: 125%; position: relative;">
      <iframe
        width="100%"
        height="100%"
        title="Giphy embed"
        src="https://giphy.com/embed/${id}"
        style="position: absolute"
        allowFullScreen=""
      ></iframe>
    </div>`,
  gist: url => `<script src="${url}.js"></script>`,
  glitch: url => `
    <iframe
      width="100%"
      height="500"
      src="${url}"
      style="aspect-ratio: 16 / 9; width: 100%; height: auto;"
      title="Glitch embed"
      allow="geolocation; microphone; camera; midi; vr; accelerometer; gyroscope; payment; ambient-light-sensor; encrypted-media"
      style="border: 0;"
    ></iframe>`,
  soundcloud: url => `
    <iframe
      width="100%"
      height="400"
      src="https://w.soundcloud.com/player/?url=${url}&visual=true&show_artwork=true"
      style="aspect-ratio: 16 / 9; width: 100%; height: auto;"
      title="SoundCloud embed"
      scrolling="no"
      allow="autoplay"
    ></iframe>`,
  spotify: (type, id) => `
    <iframe
      width="100%"
      height="${type === 'playlist' ? 352 : 152}"
      src="https://open.spotify.com/embed/${type}/${id}"
      style="${type === 'playlist' ? 'aspect-ratio: 16 / 9; width: 100%; height: auto;' : ''}"
      title="Spotify embed"
      allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
      allowfullscreen=""
    ></iframe>`,
  anchor: (name, type, slug) => `
    <iframe
      width="100%"
      height="152"
      src="https://anchor.fm/${name}/embed/${type}/${slug}"
      title="Anchor embed"
      scrolling="no"
    ></iframe>`,
  runkit: (username, repoHash) => `
    <iframe
      width="100%"
      height="350"
      src="https://runkit.com/e/oembed-iframe?target=%2Fusers%2F${username}%2Frepositories%2F${repoHash}%2Fdefault&referrer="
      style="aspect-ratio: 16 / 9; width: 100%; height: auto;"
      title="RunKit embed"
      allow="autoplay"
    ></iframe>`
};

const generateHashnodeEmbedMarkup = async embedURL => {
  try {
    if (
      [/https:\/\/.*\.?youtube\.com\//, /https:\/\/youtu\.be\//].some(pattern =>
        pattern.test(embedURL)
      )
    ) {
      const { id } = await getVideoId(embedURL);

      return embedMarkupMap.youtube(id);
    }

    if (
      [/https:\/\/vimeo\.com\//, /https:\/\/player\.vimeo\.com\/video\//].some(
        pattern => pattern.test(embedURL)
      )
    ) {
      const { id } = await getVideoId(embedURL);

      return embedMarkupMap.vimeo(id);
    }

    if (/https:\/\/codepen.io\//.test(embedURL)) {
      return embedMarkupMap.codepen(embedURL);
    }

    if (
      [
        /https:\/\/codesandbox\.io\/(s|p)\//,
        /https:\/\/codesandbox.io\/embed\//
      ].some(pattern => pattern.test(embedURL))
    ) {
      return embedMarkupMap.codesandbox(embedURL);
    }

    if (
      [
        /https:\/\/twitter\.com\/.*\/status\//,
        /https:\/\/.*\.twitter\.com\/.*\/status\//
      ].some(pattern => pattern.test(embedURL))
    ) {
      return embedMarkupMap.twitter(embedURL);
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

      return embedMarkupMap.giphy(giphyId);
    }

    if (/https:\/\/gist\.github\.com\//.test(embedURL)) {
      return embedMarkupMap.gist(embedURL);
    }

    if (/https:\/\/glitch\.com\/embed\//.test(embedURL)) {
      return embedMarkupMap.glitch(embedURL);
    }

    if (
      [
        /https?:\/\/soundcloud\.com\//,
        /https:\/\/on\.soundcloud\.com\//,
        /https:\/\/soundcloud\.app\.goog\.gl\//
      ].some(pattern => pattern.test(embedURL))
    ) {
      return embedMarkupMap.soundcloud(embedURL);
    }

    if (/https:\/\/open\.spotify\.com\//.test(embedURL)) {
      const embedPath = new URL(embedURL).pathname;
      const [type, id] = embedPath.split('/').filter(Boolean);

      return embedMarkupMap.spotify(type, id);
    }

    if (/https:\/\/anchor\.fm\//.test(embedURL)) {
      const podcastPath = new URL(embedURL).pathname;
      const [podcastName, type, podcastSlug] = podcastPath
        .split('/')
        .filter(Boolean);

      return embedMarkupMap.anchor(podcastName, type, podcastSlug);
    }

    if (/https:\/\/runkit\.com\//.test(embedURL)) {
      const embedPath = new URL(embedURL).pathname;
      const [username, repoHash] = embedPath.split('/').filter(Boolean);

      return embedMarkupMap.runkit(username, repoHash);
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
