const { URL } = require('url');
const { allGhostAPIInstances } = require('./api');
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
    let href_value = '';
    let link_text = '';

    try {
      const { pathname } = new URL(match.groups.url);
      // Currently, pathSegments is length 2 for English and Chinese
      // ( ['news', 'slug'] ), and length 3 for other locales
      // ( ['locale', 'news', 'slug'] )
      let pathSegments = pathname.split('/').filter(str => str);
      // Assume the original post is in English until the Chinese subdomain-to-subpath
      // transfer is complete. Note: This means that Chinese original posts that are
      // translated into English will not work until Chinese is moved to a subpath
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
        primary_author: originalPost.primary_author,
        locale_i18n: originalPostLocale
      };

      // Use the title of the original post as link text
      href_value = originalPost.url;
      link_text = originalPost.title;
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

      // Use URL in the script tag as link text
      href_value = match.groups.url;
      link_text = match.groups.url;
    }

    const originalArticleHTML = translate(
      'original-author-translator.details.original-article',
      {
        '<0>': '<strong>',
        '</0>': '</strong>',
        title: `<a href="${href_value}" target="_blank" rel="noopener noreferrer" data-test-label="original-article-link">${link_text}</a>`,
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
