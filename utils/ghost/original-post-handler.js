const { URL } = require('url');
const qs = require('qs');
const { allGhostAPIInstances } = require('./api');
const translate = require('../translate');

const originalPostHandler = async post => {
  const headAndFootCode = [post.codeinjection_head, post.codeinjection_foot]
    .filter(Boolean)
    .join();
  const originalPostRegex =
    /const\s+fCCOriginalPost\s+=\s+("|')(?<url>.*)\1;?/gi;
  const match = originalPostRegex.exec(headAndFootCode);

  if (match) {
    let hrefValue = '';
    let linkText = '';

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
      const { strapiUrl, strapiAccessToken, siteURL } =
        allGhostAPIInstances[originalPostLocale];
      const postUrl = `${strapiUrl}/api/posts?${qs.stringify(
        {
          populate: ['tags', 'author', 'feature_image', 'author.profile_image'],
          filters: {
            slug: {
              $eq: originalPostSlug
            }
          }
        },
        {
          encodeValuesOnly: true
        }
      )}`;
      const res = await fetch(postUrl, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${strapiAccessToken}`
        }
      });
      const data = await res.json();
      const unprocessedPost = data.data[0];
      const originalPost = {
        id: unprocessedPost.id,
        ...unprocessedPost.attributes,
        author: {
          id: unprocessedPost.attributes.author.data.id,
          ...unprocessedPost.attributes.author.data.attributes,
          profile_image:
            unprocessedPost.attributes.author.data.attributes.profile_image
              .data !== null
              ? {
                  id: unprocessedPost.attributes.author.data.attributes
                    .profile_image.data.id,
                  ...unprocessedPost.attributes.author.data.attributes
                    .profile_image.data.attributes
                }
              : null
        },
        tags: unprocessedPost.attributes.tags.data.map(tag => ({
          id: tag.id,
          ...tag.attributes
        })),
        feature_image:
          unprocessedPost.attributes.feature_image.data !== null
            ? {
                id: unprocessedPost.attributes.feature_image.data[0].id,
                ...unprocessedPost.attributes.feature_image.data[0].attributes
              }
            : null
      };

      // Convert URLs to final published version
      originalPost.url = `${siteURL}/${originalPostSlug}/`;
      originalPost.author.url = `${siteURL}/author/${originalPost.author.slug}/`;

      if (originalPost.author.profile_image) {
        originalPost.author.image_dimensions = {
          ...originalPost.author.image_dimensions
        };
        originalPost.author.image_dimensions.profile_image = {
          width: originalPost.author.profile_image.width ?? 600,
          height: originalPost.author.profile_image.height ?? 400
        };
        originalPost.author.profile_image =
          strapiUrl + originalPost.author.profile_image.url;
      }

      // Add an `original_post` object to the current post
      post.original_post = {
        title: originalPost.title,
        url: originalPost.url,
        publishedAt: originalPost.publishedAt,
        author: originalPost.author,
        locale_i18n: originalPostLocale
      };

      // Use the title of the original post as link text
      hrefValue = originalPost.url;
      linkText = originalPost.title;
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
      hrefValue = match.groups.url;
      linkText = match.groups.url;
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
    post.body = introHTML + post.body;
  }

  return post;
};

module.exports = originalPostHandler;
