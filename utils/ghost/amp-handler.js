const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const { extname } = require("path");
const getImageDimensions = require("../get-image-dimensions");
const translate = require("../translate");
const { htmlSanitizer } = require("../transforms/html-sanitizer");
const { setDefaultAlt } = require("./helpers");

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
    html: "",
    elements: {},
  };
  const html = obj.html;
  const dom = new JSDOM(html);
  const document = dom.window.document;
  const imgEls = [...document.getElementsByTagName("img")];
  const iframeEls = [...document.getElementsByTagName("iframe")];
  const audioEls = [...document.getElementsByTagName("audio")];
  const videoEls = [...document.getElementsByTagName("video")];

  const createAmpAudioOrVideo = (type, originalEl) => {
    const sourceEls = [...originalEl.getElementsByTagName("source")];
    const fallbackDiv = document.createElement("div");
    const fallbackParagraph = document.createElement("p");
    const i18nKey = type.replace("amp-", "");
    const fallbackElType = translate(`fallback.${i18nKey}`);
    let ampEl = document.createElement(type);

    // Set element type for dynamically loading scripts in template
    ampObj.elements[type] = true;

    ampEl = setAttributes(originalEl, ampEl);

    ampEl.setAttribute(
      "src",
      sourceEls[0] ? sourceEls[0].src : originalEl.getAttribute("src")
    );

    fallbackDiv.setAttribute("fallback", "");
    fallbackParagraph.innerHTML = `${translate("fallback.message", {
      element: fallbackElType,
    })}`;
    fallbackDiv.appendChild(fallbackParagraph);
    ampEl.appendChild(fallbackDiv);

    sourceEls.forEach((source) => {
      ampEl.appendChild(source);
    });

    return ampEl;
  };

  await Promise.all(
    // Create <amp-img> and <amp-anim> elements
    imgEls.map(async (img) => {
      const title = obj.title;
      const { width, height } = await getImageDimensions(img.src, title);
      // Special handling for small image sizes
      const layoutType = width < 300 ? "fixed" : "responsive";
      const extension = extname(img.src);
      const targetEl =
        extension.toLowerCase() === ".gif" ? "amp-anim" : "amp-img";
      let ampEl = document.createElement(targetEl);

      // Set element type for dynamically loading scripts in template
      ampObj.elements[targetEl] = true;

      if (!img.alt) setDefaultAlt(img);

      // Copy image attributes to ampEl
      ampEl = setAttributes(img, ampEl);

      // Set required attributes
      ampEl.setAttribute("layout", layoutType);
      ampEl.setAttribute("width", width);
      ampEl.setAttribute("height", height);

      img.replaceWith(ampEl);
    }),

    // Create <amp-iframe> and <amp-youtube> elements
    iframeEls.map((iframe) => {
      // This code is based heavily on the implementation
      // here: https://github.com/jbhannah/amperize
      const youtubeRe = iframe.src.match(
        /^.*(youtu.be\/|youtube(-nocookie)?.com\/(v\/|.*u\/\w\/|embed\/|.*v=))([\w-]{11}).*/
      );
      const targetEl = youtubeRe ? "amp-youtube" : "amp-iframe";
      let ampEl = document.createElement(targetEl);

      // Set element type for dynamically loading scripts in template
      ampObj.elements[targetEl] = true;

      // Copy iframe attributes to ampEl
      ampEl = setAttributes(iframe, ampEl);

      // Make all iframes responsive
      ampEl.setAttribute("layout", "responsive");

      if (youtubeRe) {
        ampEl.setAttribute("data-videoid", youtubeRe[4]);

        ampEl.removeAttribute("src");
        ampEl.removeAttribute("sandbox");
        ampEl.removeAttribute("allowfullscreen");
        ampEl.removeAttribute("allow");
        ampEl.removeAttribute("frameborder");
      } else {
        ampEl.sandbox
          ? ampEl.sandbox
          : ampEl.setAttribute(
              "sandbox",
              "allow-scripts allow-same-origin allow-popups"
            );
      }

      ampEl.setAttribute("frameborder", "0");

      if (
        !ampEl.getAttribute("width") ||
        !ampEl.getAttribute("height") ||
        !ampEl.getAttribute("layout")
      ) {
        ampEl.setAttribute("width", ampEl.width ? ampEl.width : 600);
        ampEl.setAttribute("height", ampEl.height ? ampEl.height : 400);
      }

      iframe.replaceWith(ampEl);
    }),

    // Create <amp-audio> elements
    audioEls.map((audio) => {
      const ampAudio = createAmpAudioOrVideo("amp-audio", audio);

      audio.replaceWith(ampAudio);
    }),

    // Create <amp-video> elements
    videoEls.map((video) => {
      const ampVideo = createAmpAudioOrVideo("amp-video", video);

      video.replaceWith(ampVideo);
    })
  );

  const cleanHtml = htmlSanitizer(dom.window.document.body.innerHTML);

  ampObj.html = cleanHtml;

  return ampObj;
};

module.exports = ampHandler;
