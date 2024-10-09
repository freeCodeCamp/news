const fullEscaper = require('../full-escaper');
const translate = require('../translate');
const { siteURL } = require('../../config');

const createImageObj = (url, imageDimensions) => {
  const width = imageDimensions?.width ? imageDimensions?.width : 1920;
  const height = imageDimensions?.height ? imageDimensions?.height : 1080;

  return {
    '@type': 'ImageObject',
    url,
    width,
    height
  };
};

const createAuthorObj = primaryAuthor => {
  const {
    name,
    profile_image,
    image_dimensions,
    website,
    twitterHandle,
    facebook,
    path // in `/author/username/` format
  } = primaryAuthor;
  const authorPath = path.replace(/^\//, '');
  const authorObj = {
    '@type': 'Person',
    name,
    url: siteURL + authorPath,
    sameAs: [
      website ? fullEscaper(website) : null,
      facebook ? `https://www.facebook.com/${facebook}` : null,
      twitterHandle ? twitterHandle.replace('@', 'https://x.com/') : null
    ].filter(url => url)
  };

  if (profile_image) {
    authorObj.image = createImageObj(
      profile_image,
      image_dimensions.profile_image
    );
  }

  return authorObj;
};

async function createJSONLDShortcode(type, site, data) {
  // Main site settings from site object
  const { logo, cover_image, image_dimensions } = site;
  const url = `${siteURL}`;
  const typeMap = {
    index: 'WebSite',
    article: 'Article',
    author: 'Person',
    tag: 'Series'
  };
  const baseData = {
    '@context': 'https://schema.org',
    '@type': typeMap[type],
    publisher: {
      '@type': 'Organization',
      name: 'freeCodeCamp.org',
      url: url,
      logo: createImageObj(logo, image_dimensions.logo)
    },
    image: createImageObj(cover_image, image_dimensions.cover_image),
    url: url,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url
    }
  };
  const returnData = { ...baseData };

  // Conditionally set other properties based on
  // objects passed to shortcodes
  if (type === 'index')
    returnData.description = translate('meta-tags:description');

  if (type !== 'index' && data) {
    // Remove first slash from path
    if (data.path) returnData.url += data.path.substring(1);

    if (data.description)
      returnData.description = fullEscaper(data.description);

    if (type === 'article') {
      if (data.published_at)
        returnData.datePublished = new Date(data.published_at).toISOString();
      if (data.updated_at)
        returnData.dateModified = new Date(data.updated_at).toISOString();
      if (data.tags) {
        // Filter out internal Ghost tags
        const keywordString = data.tags
          .map(tag => tag.name)
          .filter(keyword => !keyword.startsWith('#'))
          .join(', ');

        returnData.keywords = keywordString;
      }
      if (data.original_excerpt)
        returnData.description = fullEscaper(data.original_excerpt);
      if (data.title) returnData.headline = fullEscaper(data.title);

      if (data.feature_image) {
        returnData.image = createImageObj(
          data.feature_image,
          data.image_dimensions.feature_image
        );
      }

      if (data.primary_author)
        returnData.author = createAuthorObj(data.primary_author);
    }

    // Handle images for both types
    if (type === 'tag' || type === 'author') {
      if (data.cover_image) {
        returnData.image = createImageObj(
          data.cover_image,
          data.image_dimensions.cover_image
        );
      } else if (data.feature_image) {
        returnData.image = createImageObj(
          data.feature_image,
          data.image_dimensions.feature_image
        );
      } else {
        delete returnData.image;
      }
    }

    if (type === 'tag') {
      if (data.cover_image)
        returnData.image = createImageObj(
          data.cover_image,
          data.image_dimensions.cover_image
        );
      returnData.name = data.name;
    }

    if (type === 'author') {
      // This schema type is the only one without publisher info
      delete returnData.publisher;
      const authorObj = createAuthorObj(data);

      returnData.sameAs = authorObj.sameAs;
      returnData.name = fullEscaper(authorObj.name);
      if (data.bio) returnData.description = data.bio;
    }
  }

  return JSON.stringify(returnData, null, '\t'); // Pretty print for testing
  // return JSON.stringify(returnData);
}

module.exports = createJSONLDShortcode;
