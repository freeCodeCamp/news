const ghostContentAPI = require('@tryghost/content-api');
const { URL } = require('url');
const { fetchKeys } = require('./api');
const { locales, computedPath } = require('../../config');
const getImageDimensions = require('../get-image-dimensions');
const translate = require('../translate');

const ghostURLToAPIMap = locales.reduce((obj, currLocale) => {
  const { url, key, version } = fetchKeys(currLocale);

  try {
    obj[url] = {
      api: new ghostContentAPI({ url, key, version }),
      locale_i18n: currLocale
    };
  } catch (err) {
    console.warn(`
      ---------------------------------------------------------------
      Warning: Unable to initialize the Content API for ${currLocale}
      ---------------------------------------------------------------
      Please double check that the correct keys are included in the
      .env file.
      You can ignore this warning if this instance of Ghost is set 
      to private, if you don't need the original / author translator
      feature for this locale, or if a test suite is running.
      ---------------------------------------------------------------
    `);
  }

  return obj;
}, {});

const originalPostHandler = async post => {
  const headAndFootCode = [post.codeinjection_head, post.codeinjection_foot]
    .filter(Boolean)
    .join();
  const originalPostRegex =
    /const\s+fccOriginalPost\s+=\s+("|')(?<url>.*)\1;?/g;
  const match = originalPostRegex.exec(headAndFootCode);

  if (match) {
    try {
      const { origin, pathname } = new URL(match.groups.url);
      let pathSegments = pathname.split('/').filter(str => str);
      const originalPostSlug = pathSegments.pop();
      const originalPostGhostURL = `${origin}/${pathSegments.join('/')}`;
      const { api, locale_i18n } = ghostURLToAPIMap[originalPostGhostURL];
      const originalPost = await api.posts.read({
        include: 'authors',
        slug: originalPostSlug
      });

      if (originalPost.primary_author.profile_image) {
        originalPost.primary_author.image_dimensions = {
          ...originalPost.primary_author.image_dimensions
        };
        originalPost.primary_author.image_dimensions.profile_image =
          await getImageDimensions(originalPost.primary_author.profile_image);
      }

      post.original_post = {
        title: originalPost.title,
        url: originalPost.url,
        published_at: originalPost.published_at,
        primary_author: originalPost.primary_author,
        locale_i18n
      };

      const authorEl = translate(
        'original-author-translator.details.original-article',
        {
          '<0>': '<strong>',
          '</0>': '</strong>',
          title: `<a href="${originalPost.url}" target="_blank" rel="noopener noreferrer">${originalPost.title}</a>`,
          author: `<a href="${originalPost.primary_author.url}" target="_blank" rel="noopener noreferrer">${originalPost.primary_author.name}</a>`,
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
          translator: `<a href="/${computedPath + post.primary_author.path}">${
            post.primary_author.name
          }</a>`,
          interpolation: {
            escapeValue: false
          }
        }
      );

      const introEl = `
        <p>
          ${authorEl}
          <br><br>
          ${translatorEl}
        </p>`;

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
