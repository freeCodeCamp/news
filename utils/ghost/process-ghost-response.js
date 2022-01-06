const { setImageDimensionObj } = require('./helpers');
const ampHandler = require('./amp-handler');
const lazyLoadHandler = require('./lazy-load-handler');
const originalPostHandler = require('./original-post-handler');

const processGhostResponse = async (ghostRes, context) => {
  // Process post / page
  const processedData = await Promise.all(
    ghostRes.map(async obj => {
      // Post image resolutions for structured data
      if (obj.feature_image) await setImageDimensionObj(obj, 'feature_image', obj.feature_image);

      // Author image resolutions for structured data
      if (obj.primary_author.profile_image) {
        await setImageDimensionObj(obj.primary_author, 'profile_image', obj.primary_author.profile_image);
      }

      if (obj.primary_author.cover_image) {
        await setImageDimensionObj(obj.primary_author, 'cover_image', obj.primary_author.cover_image);
      }

      obj.tags.map(async tag => {
        if (tag.feature_image) await setImageDimensionObj(tag, 'feature_image', tag.feature_image);
      });
      
      // Original author / translator feature
      if (obj.codeinjection_head) obj = await originalPostHandler(obj);

      // Stash original excerpt and escape for structured data.
      // Shorten the default excerpt and replace newlines -- the
      // browser will normalize multiple spaces
      if (obj.excerpt) {
        obj.original_excerpt = obj.excerpt;

        obj.excerpt = obj.excerpt.replace(/\n+/g, ' ')
          .split(' ')
          .slice(0, 50)
          .join(' ');
      }

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
