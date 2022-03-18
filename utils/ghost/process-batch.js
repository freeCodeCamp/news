const { setImageDimensionObj } = require('./helpers');
const generateAMPObj = require('./generate-amp-obj');
const lazyLoadHandler = require('./lazy-load-handler');
const originalPostHandler = require('./original-post-handler');
const getImageDimensions = require('../../utils/get-image-dimensions');

const removeUnusedProperties = obj => {
  const propsToRemove = [
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

  for (const prop in obj) {
    if (propsToRemove.includes(prop)) delete obj[prop];
  }

  return obj;
};

const processBatch = async (batch, type, currBatchNo, totalBatches) => {
  if (batch.length > 0)
    console.log(
      `Processing ${type} batch ${currBatchNo} of ${totalBatches}...`
    );

  // Process post / page
  const processedData = await Promise.all(
    batch.map(async obj => {
      // Clean incoming objects
      obj = removeUnusedProperties(obj);
      obj.primary_author = removeUnusedProperties(obj.primary_author);
      obj.tags.map(tag => removeUnusedProperties(tag));

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
      if (context === 'posts' && obj.html) obj.amp = await generateAMPObj(obj);

      return obj;
    })
  ).then(batch => {
    if (batch.length > 0)
      console.log(
        `Finished processing ${type} batch ${currBatchNo} of ${totalBatches}...`
      );

    return batch;
  });

  return processedData;
};

module.exports = processBatch;
