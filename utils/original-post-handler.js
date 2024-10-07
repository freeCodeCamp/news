const { URL } = require('url');
const fetch = require('node-fetch');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;
const { getCache, setCache } = require('./cache');
const getImageDimensions = require('./get-image-dimensions');
const translate = require('./translate');
const fullEscaper = require('./full-escaper');

const originalPostHandler = async (originalPostFlag, translatedPostTitle) => {
  let hrefValue;
  let linkText;
  let originalPostObj = {};
  const originalPostRegex =
    /(const\s+)?fCCOriginalPost\s+=\s+("|')(?<url>.*)\2;?/gi;
  const match = originalPostRegex.exec(originalPostFlag);

  try {
    if (match) {
      const originalPostURLObj = new URL(match.groups.url);
      // Set hrefValue and linkText to the original post URL by default
      hrefValue = originalPostURLObj.href;
      linkText = originalPostURLObj.href;
      // Currently, postPathSegments is length 2 for English and Chinese
      // ( ['news', 'slug'] ), and length 3 for other locales
      // ( ['locale', 'news', 'slug'] )
      const postPathSegments = originalPostURLObj.pathname
        .split('/')
        .filter(str => str);
      // Assume the original post is in English until the Chinese subdomain-to-subpath
      // transfer is complete. Note: This means that Chinese original posts that are
      // translated into English will not work until Chinese is moved to a subpath
      const originalPostLocale =
        postPathSegments.length === 2 ? 'english' : postPathSegments[0];
      const originalPostRes = await fetch(originalPostURLObj.href);
      const originalPostHTML = await originalPostRes.text();
      const originalPostDom = new JSDOM(originalPostHTML);
      const document = originalPostDom.window.document;
      const originalPostDate = document.querySelector(
        '.post-full-meta-date'
      ).dateTime;
      const originalPostTitle = fullEscaper(
        document.querySelector('.post-full-title').textContent.trim()
      );
      // Get the original author's data
      let originalAuthorObj = {};
      const originalAuthorRelativePath =
        document.querySelector('.author-card .author-card-name a')?.href ||
        `/${postPathSegments.slice(0, postPathSegments.length - 1).join('/')}/author/freecodecamp/`;
      const originalAuthorSlug = originalAuthorRelativePath
        .split('/')
        .filter(Boolean)
        .pop();
      // Check if the original author data is cached
      const cachedOriginalAuthor = getCache(originalAuthorSlug);
      if (cachedOriginalAuthor) {
        originalAuthorObj = cachedOriginalAuthor;
      } else {
        // Fetch the original author's page and get the author's bio
        // and fall back to freeCodeCamp.org if author info isn't found
        // because it should be an unclaimed migrated post
        const originalAuthorImageSrc =
          document.querySelector('.author-card img')?.src ||
          'https://cdn.freecodecamp.org/platform/universal/freecodecamp-org-gravatar.jpeg';
        const originalAuthorName =
          document
            .querySelector('.author-card .author-card-name')
            ?.textContent.trim() || 'freeCodeCamp.org';
        const originalAuthorURL = `${originalPostURLObj.origin}${originalAuthorRelativePath}`;
        const originalAuthorPageRes = await fetch(originalAuthorURL);
        const originalAuthorPageHTML = await originalAuthorPageRes.text();
        const originalAuthorPageDom = new JSDOM(originalAuthorPageHTML);
        const originalAuthorPageDocument =
          originalAuthorPageDom.window.document;
        const originalAuthorBio =
          originalAuthorPageDocument
            .querySelector('.author-bio')
            ?.textContent.trim() || null;
        originalAuthorObj = {
          name: originalAuthorName,
          profile_image: originalAuthorImageSrc,
          url: originalAuthorURL,
          bio: originalAuthorBio,
          image_dimensions: {
            profile_image: {
              ...(await getImageDimensions(originalAuthorImageSrc))
            }
          }
        };
        // Cache the original author data
        setCache(originalAuthorSlug, originalAuthorObj);
      }

      originalPostObj = {
        url: originalPostURLObj.href,
        published_at: originalPostDate,
        title: originalPostTitle,
        primary_author: originalAuthorObj ?? {},
        locale_i18n: originalPostLocale
      };

      // Use the title of the original post as link text
      linkText = originalPostTitle;
    }
  } catch (err) {
    console.warn(`
      ---------------------------------------------------------------
      Warning: Unable to fetch the post at
      "${match.groups.url}" in the post titled
      "${translatedPostTitle}".
      ---------------------------------------------------------------
      Please ensure that the Ghost instance is live and that the
      post has not been deleted.
      ---------------------------------------------------------------
      `);
  }

  // Intro HTML for the original post if there were no errors
  if (hrefValue) {
    const originalArticleDetailsMarkup = translate(
      'original-author-translator.details.original-article',
      {
        '<0>': '<strong>',
        '</0>': '</strong>',
        title: `<a href="${hrefValue}" target="_blank" rel="noopener noreferrer" data-test-label="original-article-link">${linkText}</a>`,
        interpolation: {
          escapeValue: false
        }
      }
    );

    const introHTML = `
      <p data-test-label="translation-intro">
        ${originalArticleDetailsMarkup}
      </p>`;

    // Append introHTML to the original post object
    originalPostObj.introHTML = introHTML;

    return originalPostObj;
  }
};

module.exports = originalPostHandler;
