const ghostContentAPI = require('@tryghost/content-api');
const { URL } = require('url');
const { fetchKeys } = require('./api');
const { locales } = require('../../config');
const { setImageDimensionObj } = require('./helpers');

const ghostURLToAPIMap = locales.reduce((obj, currLocale) => {
  const { url, key, version } = fetchKeys(currLocale);

  try {
    obj[url] = {
      api: new ghostContentAPI({ url, key, version }),
      locale_i18n: currLocale
    }
  } catch(err) {
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

const originalPostHandler = async (post) => {
  const originalPostRegex = /const\s+fccOriginalPost\s+=\s+("|')(?<url>.*)\1;?/g;
  const match = originalPostRegex.exec(post.codeinjection_head);
  
  if (match) {
    try {
      const { origin, pathname } = new URL(match.groups.url);
      let pathSegments = pathname.split('/').filter((str) => str);
      const originalPostSlug = pathSegments.pop();
      const originalPostGhostURL = `${origin}/${pathSegments.join('/')}`;
      const { api, locale_i18n } = ghostURLToAPIMap[originalPostGhostURL];
      const originalPostRes = await api.posts
        .read({
          include: 'authors',
          slug: originalPostSlug
        });
      
      const {
        title,
        published_at,
        primary_author,
        url
      } = originalPostRes;

      if (originalPostRes.primary_author.profile_image) {
        await setImageDimensionObj(originalPostRes.primary_author, 'profile_image', originalPostRes.primary_author.profile_image);
      }

      post.original_post = {
        title,
        url,
        published_at,
        primary_author,
        locale_i18n
      }
    } catch(err) {
      console.warn(err);
    }
  }

  return post;
}

module.exports = originalPostHandler;
