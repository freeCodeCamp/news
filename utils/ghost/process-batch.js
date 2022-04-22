const generateAMPObj = require('./generate-amp-obj');
const lazyLoadHandler = require('./lazy-load-handler');
const originalPostHandler = require('./original-post-handler');
const getImageDimensions = require('../../utils/get-image-dimensions');
const errorLogger = require('../../utils/error-logger');
const { sourceApiUrl } = require('../../utils/ghost/api');
const { siteURL } = require('../../config');

const removeUnusedKeys = obj => {
  const keysToRemove = [
    'uuid',
    'comment_id',
    'featured',
    'custom_excerpt',
    'custom_template',
    'canonical_url',
    'email_recipient_filter',
    'authors',
    'primary_tag',
    'access',
    'send_email_when_published',
    'og_image',
    'og_title',
    'og_description',
    'twitter_image',
    'twitter_title',
    'twitter_description',
    'meta_title',
    'meta_description',
    'email_subject',
    'accent_color'
  ];

  for (const key in obj) {
    if (keysToRemove.includes(key)) delete obj[key];
  }

  return obj;
};

// Strip Ghost domain from urls
const stripDomain = url => {
  return url.replace(sourceApiUrl, '');
};

const processBatch = async ({ batch, type, currBatchNo, totalBatches }) => {
  console.log(`Processing ${type} batch ${currBatchNo} of ${totalBatches}...`);

  // Process current batch of posts / pages
  await Promise.all(
    batch.map(async obj => {
      // Clean incoming objects
      obj = removeUnusedKeys(obj);
      obj.primary_author = removeUnusedKeys(obj.primary_author);
      obj.tags.map(tag => removeUnusedKeys(tag));

      // Feature image resolutions for structured data
      if (obj.feature_image) {
        obj.image_dimensions = { ...obj.image_dimensions };
        obj.image_dimensions.feature_image = await getImageDimensions(
          obj.feature_image,
          obj.title
        );
      }

      // Author image resolutions for structured data
      if (obj.primary_author.profile_image) {
        obj.primary_author.image_dimensions = {
          ...obj.primary_author.image_dimensions
        };
        obj.primary_author.image_dimensions.profile_image =
          await getImageDimensions(
            obj.primary_author.profile_image,
            obj.primary_author.name,
            true
          );
      }

      if (obj.primary_author.cover_image) {
        obj.primary_author.image_dimensions = {
          ...obj.primary_author.image_dimensions
        };
        obj.primary_author.image_dimensions.cover_image =
          await getImageDimensions(
            obj.primary_author.cover_image,
            obj.primary_author.name,
            true
          );
      }

      // Tag image resolutions for structured data
      obj.tags.map(async tag => {
        if (tag.feature_image) {
          tag.image_dimensions = { ...tag.image_dimensions };
          tag.image_dimensions.feature_image = await getImageDimensions(
            tag.feature_image,
            tag.name
          );
        }
      });

      // General cleanup and prep -- attach path to post / page
      // objects, convert dates, and fix pages that should exist
      obj.path = stripDomain(obj.url);
      obj.primary_author.path = stripDomain(obj.primary_author.url);
      obj.tags.forEach(tag => {
        // Log and fix tag pages that point to 404 due to a Ghost error
        if (tag.url.endsWith('/404/') && tag.visibility === 'public') {
          errorLogger({ type: 'tag', name: tag.name });
          tag.url = `${siteURL}/tag/${tag.slug}/`;
        }

        tag.path = stripDomain(tag.url);
      });

      // Log and fix author pages that point to 404 due to a Ghost error
      if (obj.primary_author.url.endsWith('/404/')) {
        errorLogger({ type: 'author', name: obj.primary_author.name });
        obj.primary_author.url = `${siteURL}/author/${obj.primary_author.slug}/`;
      }

      obj.primary_author.path = stripDomain(obj.primary_author.url);

      // Convert publish date into a Date object
      obj.published_at = new Date(obj.published_at);

      // Original author / translator feature
      if (obj.codeinjection_head) obj = await originalPostHandler(obj);

      // Stash original excerpt and escape for structured data.
      // Shorten the default excerpt and replace newlines -- the
      // browser will normalize multiple spaces
      if (obj.excerpt) {
        obj.original_excerpt = obj.excerpt;

        obj.excerpt = obj.excerpt
          .replace(/\n+/g, ' ')
          .split(' ')
          .slice(0, 50)
          .join(' ');
      }

      // Lazy load images and embedded videos -- will also set the width, height,
      // and add a default alt attribute to images if one doesn't exist
      if (obj.html) obj.html = await lazyLoadHandler(obj.html, obj.title);

      // Generate an object that contains AMP HTML and flags to conditionally include
      // AMP scripts in the amp.njk template. Only do this for posts.
      if (type === 'posts' && obj.html) obj.amp = await generateAMPObj(obj);

      return obj;
    })
  );

  return batch;
};

module.exports = processBatch;
