const { setJsonLdImageDimensions } = require('./helpers');
const ampHandler = require('./amp-handler');
const lazyLoadHandler = require('./lazy-load-handler');
const originalPostHandler = require('./original-post-handler');
const { escape } = require('lodash');

const processGhostResponse = async (ghostRes, context) => {
  // Process post / page
  const processedData = await Promise.all(
    ghostRes.map(async obj => {
      // Post image resolutions for structured data
      if (obj.feature_image) await setJsonLdImageDimensions(obj, 'feature_image', obj.feature_image);

      // Author image resolutions for structured data
      if (obj.primary_author.profile_image) {
        await setJsonLdImageDimensions(obj.primary_author, 'profile_image', obj.primary_author.profile_image);
      }

      if (obj.primary_author.cover_image) {
        await setJsonLdImageDimensions(obj.primary_author, 'cover_image', obj.primary_author.profile_image);
      }

      obj.tags.map(async tag => {
        if (tag.feature_image) await setJsonLdImageDimensions(tag, 'feature_image', tag.feature_image);
      });
      
      // Original author / translator feature
      if (obj.codeinjection_head) obj = await originalPostHandler(obj);

      // To do: handle this in the JSON LD function
      if (obj.excerpt) obj.excerpt = escape(
        obj.excerpt.replace(/\n+/g, ' ')
          .split(' ')
          .slice(0, 50)
          .join(' ')
        );

      // Short excerpt for RSS feed, etc.
      if (obj.excerpt) obj.short_excerpt = obj.excerpt.replace(/\n+/g, ' ')
        .split(' ')
        .slice(0, 50)
        .join(' ');

      // Handle AMP processing for posts before modifying the original
      // HTML and add flags to dynamically import AMP scripts
      if (context === 'posts' && obj.html) obj.amp = await ampHandler(obj);
      
      // Lazy load images and embedded videos
      if (obj.html) obj.html = await lazyLoadHandler(obj.html, obj.title);

      return obj;
    })
  );

  return processedData;
}

module.exports = processGhostResponse;
