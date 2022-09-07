const { URL } = require('url');
const { allGhostAPIInstances } = require('./api');
const { computedPath } = require('../../config');
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
    try {
      const { pathname } = new URL(match.groups.url);
      // Currently, pathSegments is length 2 for English and Chinese
      // ( ['news', 'slug'] ), and length 3 for other locales
      // ( ['locale', 'news', 'slug'] )
      let pathSegments = pathname.split('/').filter(str => str);
      // Assume the original post is in English until the Chinese subdomain-to-subpath
      // transfer is complete. Note: This means that Chinese original posts that are
      // translated into English will not work until Chinese is moved to a subpath
      // To do: Remove this when refactoring to use JSDOM to get info from the
      // cached version of the page rather than from the Ghost API
      const originalPostLocale =
        pathSegments.length === 2 ? 'english' : pathSegments[0];
      const originalPostSlug = pathSegments[pathSegments.length - 1];
      const { api, siteURL } = allGhostAPIInstances[originalPostLocale];
      const originalPost = await api.posts.read({
        include: 'authors',
        slug: originalPostSlug
      });

      // Convert URLs to final published version
      originalPost.url = `${siteURL}/${originalPostSlug}/`;
      originalPost.primary_author.url = `${siteURL}/author/${originalPost.primary_author.slug}/`;

      if (originalPost.primary_author.profile_image) {
        originalPost.primary_author.image_dimensions = {
          ...originalPost.primary_author.image_dimensions
        };
        originalPost.primary_author.image_dimensions.profile_image =
          await getImageDimensions(originalPost.primary_author.profile_image);
      }

      // Add an `original_post` object to the current post
      post.original_post = {
        title: originalPost.title,
        url: originalPost.url,
        published_at: originalPost.published_at,
        primary_author: originalPost.primary_author
      };

      const authorEl = translate(
        'original-author-translator.details.original-article',
        {
          '<0>': '<strong>',
          '</0>': '</strong>',
          title: `<a href="${originalPost.url}" target="_blank" rel="noopener noreferrer" data-test-label="original-article">${originalPost.title}</a>`,
          author: `<a href="${originalPost.primary_author.url}" target="_blank" rel="noopener noreferrer" data-test-label="profile-link">${originalPost.primary_author.name}</a>`,
          interpolation: {
            escapeValue: false
          }
        }
      );

      const translatorEl = translate(
        'original-author-translator.details.translated-by',
        {
          '<0>': '<strong>',
          '</0>': '</strong>',
          translator: `<a href="/${
            computedPath + post.primary_author.path
          }" data-test-label="profile-link">${post.primary_author.name}</a>`,
          interpolation: {
            escapeValue: false
          }
        }
      );

      const introEl = `
        <p>
          <span data-test-label="author-intro">
            ${authorEl}
          </span>
          <br><br>
          <span data-test-label="translator-intro">
            ${translatorEl}
          </span>
        </p>`;

      // Append details about the original article / author and translator
      // to the beginning of the article
      post.html = introEl + post.html;
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
  }

  return post;
};

module.exports = originalPostHandler;
