const { URL } = require('url');
const fetch = require('node-fetch');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;
const getImageDimensions = require('../get-image-dimensions');
const translate = require('../translate');

const originalPostHandler = async post => {
  const headAndFootCode = [post.codeinjection_head, post.codeinjection_foot]
    .filter(Boolean)
    .join();
  const originalPostRegex =
    /const\s+fCCOriginalPost\s+=\s+("|')(?<url>.*)\1;?/gi;
  const match = originalPostRegex.exec(headAndFootCode);

  if (match) {
    const originalPostURLObj = new URL(match.groups.url);
    // Set hrefValue and linkText to the original post URL by default
    let hrefValue = originalPostURLObj.href;
    let linkText = originalPostURLObj.href;

    try {
      // Currently, pathSegments is length 2 for English and Chinese
      // ( ['news', 'slug'] ), and length 3 for other locales
      // ( ['locale', 'news', 'slug'] )
      const pathSegments = originalPostURLObj.pathname
        .split('/')
        .filter(str => str);
      // Assume the original post is in English until the Chinese subdomain-to-subpath
      // transfer is complete. Note: This means that Chinese original posts that are
      // translated into English will not work until Chinese is moved to a subpath
      const originalPostLocale =
        pathSegments.length === 2 ? 'english' : pathSegments[0];
      const originalPostRes = await fetch(originalPostURLObj.href);
      const originalPostHTML = await originalPostRes.text();
      const originalPostDom = new JSDOM(originalPostHTML);
      const document = originalPostDom.window.document;
      const originalPostDate = document.querySelector(
        '.post-full-meta-date'
      ).dateTime;
      const originalPostTitle = document
        .querySelector('.post-full-title')
        .textContent.trim();
      const originalAuthorImageSrc =
        document.querySelector('.author-card img').src;
      const originalAuthorName = document
        .querySelector('.author-card .author-card-name')
        .textContent.trim();
      const originalAuthorRelativePath = document.querySelector(
        '.author-card .author-card-name a'
      ).href;
      const originalAuthorURL = `${originalPostURLObj.origin}${originalAuthorRelativePath}`;
      const originalAuthorPageRes = await fetch(originalAuthorURL);
      const originalAuthorPageHTML = await originalAuthorPageRes.text();
      const originalAuthorPageDom = new JSDOM(originalAuthorPageHTML);
      const originalAuthorPageDocument = originalAuthorPageDom.window.document;
      const originalAuthorBio = originalAuthorPageDocument
        .querySelector('.author-bio')
        .textContent.trim();
      const originalPostObj = {
        url: originalPostURLObj.href,
        published_at: originalPostDate,
        title: originalPostTitle,
        primary_author: {
          name: originalAuthorName,
          profile_image: originalAuthorImageSrc,
          url: originalAuthorURL,
          bio: originalAuthorBio || null,
          image_dimensions: {
            profile_image: {
              ...(await getImageDimensions(originalAuthorImageSrc))
            }
          }
        },
        locale_i18n: originalPostLocale
      };

      // Add an `original_post` object to the current post
      post.original_post = originalPostObj;

      // Use the title of the original post as link text
      linkText = originalPostTitle;
    } catch (err) {
      console.warn(`
      ---------------------------------------------------------------
      Warning: Unable to fetch the post at
      ${match.groups.url}
      ---------------------------------------------------------------
      Please ensure that the Ghost instance is live and that the
      post has not been deleted.
      ---------------------------------------------------------------
      `);
    }

    const originalArticleHTML = translate(
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
        ${originalArticleHTML}
      </p>`;

    // Append details about the original article
    // to the beginning of the translated article
    post.html = introHTML + post.html;
  }

  return post;
};

module.exports = originalPostHandler;
