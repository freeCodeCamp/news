const modifyGhostHTML = require('./modify-ghost-html');
const originalPostHandler = require('./original-post-handler');
const errorLogger = require('../../utils/error-logger');
const { siteURL, strapiUrl } = require('../../config');
const stripDomain = require('../../utils/strip-domain');

const removeUnusedKeys = obj => {
  // TODO: Confirm again if any other fields need to be removed
  const keysToRemove = [
    'ghost_id',
    'username',
    'provider',
    'confirmed',
    'blocked',
    'status',
    'last_seen'
  ];

  for (const key in obj) {
    if (keysToRemove.includes(key)) delete obj[key];
  }

  return obj;
};

const processBatch = async ({ batch, type, currBatchNo, totalBatches }) => {
  console.log('siteUrl', siteURL);
  console.log(`Processing ${type} batch ${currBatchNo} of ${totalBatches}...`);

  // Process current batch of posts / pages
  const newBatch = [];
  for (const oldPost of batch) {
    let newPost = {
      id: oldPost.id,
      ...oldPost.attributes,
      author: {
        id: oldPost.attributes.author.data.id,
        ...oldPost.attributes.author.data.attributes,
        profile_image: {
          id: oldPost.attributes.author.data.attributes.profile_image.data.id,
          ...oldPost.attributes.author.data.attributes.profile_image.data
            .attributes
        }
      },
      tags: oldPost.attributes.tags.data.map(tag => ({
        id: tag.id,
        ...tag.attributes
      })),
      feature_image:
        oldPost.attributes.feature_image.data.length > 0
          ? {
              id: oldPost.attributes.feature_image.data[0].id,
              ...oldPost.attributes.feature_image.data[0].attributes
            }
          : null
    };

    // Clean incoming objects
    newPost = removeUnusedKeys(newPost);
    newPost.author = removeUnusedKeys(newPost.author);
    newPost.tags.map(tag => removeUnusedKeys(tag));

    // Feature image resolutions for structured data
    if (newPost.feature_image) {
      newPost.image_dimensions = { ...newPost.image_dimensions };
      newPost.image_dimensions.feature_image = {
        width: newPost.feature_image.width ?? 600,
        height: newPost.feature_image.height ?? 400
      };
      newPost.feature_image = strapiUrl + newPost.feature_image.url;
    }

    // Author image resolutions for structured data
    if (newPost.author.profile_image) {
      newPost.author.image_dimensions = {
        ...newPost.author.image_dimensions
      };
      newPost.author.image_dimensions.profile_image = {
        width: newPost.author.profile_image.width ?? 600,
        height: newPost.author.profile_image.height ?? 400
      };
      newPost.author.profile_image =
        strapiUrl + newPost.author.profile_image.url;
    }

    // if (newPost.author.cover_image) {
    //   newPost.author.image_dimensions = {
    //     ...newPost.author.image_dimensions
    //   };
    //   newPost.author.image_dimensions.cover_image = {
    //     width: newPost.author.cover_image.width ?? 600,
    //     height: newPost.author.cover_image.height ?? 400
    //   };
    //   newPost.author.cover_image = strapiUrl + newPost.author.cover_image.url;
    // }

    // Tag image resolutions for structured data
    // await Promise.all(
    //   newPost.tags.map(async tag => {
    //     if (tag.feature_image) {
    //       tag.image_dimensions = { ...tag.image_dimensions };
    //       tag.image_dimensions.feature_image = await getImageDimensions(
    //         tag.feature_image,
    //         tag.name,
    //         true
    //       );
    //     }
    //   })
    // );

    // General cleanup and prep -- attach path to post / page
    // objects, convert dates, and fix pages that should exist
    newPost.url = `${siteURL}/${newPost.slug}/`;
    newPost.path = `/${newPost.slug}/`;
    newPost.tags.forEach(tag => {
      // Log and fix tag pages that point to 404 due to a Ghost error
      tag.url = `${siteURL}/tag/${tag.slug}/`;
      tag.path = `/tag/${tag.slug}/`;
    });

    // Log and fix author pages that point to 404 due to a Ghost error
    newPost.author.url = `${siteURL}/author/${newPost.author.slug}/`;
    newPost.author.path = `/author/${newPost.author.slug}/`;

    // Convert publish date into a Date object
    newPost.publishedAt = new Date(newPost.publishedAt);

    // Original author / translator feature
    // if (newPost.codeinjection_head || newPost.codeinjection_foot)
    //   newPost = await originalPostHandler(newPost);

    // Stash original excerpt and escape for structured data.
    // Shorten the default excerpt and replace newlines -- the
    // browser will normalize multiple spaces
    // if (oldPost.excerpt) {
    //   oldPost.original_excerpt = oldPost.excerpt;

    //   oldPost.excerpt = oldPost.excerpt
    //     .replace(/\n+/g, ' ')
    //     .split(' ')
    //     .slice(0, 50)
    //     .join(' ');
    // }

    // Enable lazy loading of images and embedded videos, set width, height, and add a default
    // alt attribute to images if one doesn't exist.
    // Also, append Google ads to post body and generate bottom banner ad if ads are enabled.
    if (newPost.body) newPost = await modifyGhostHTML(newPost);

    newBatch.push(newPost);
  }

  return newBatch;
};

module.exports = processBatch;
