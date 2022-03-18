const generateAMPObj = require('./generate-amp-obj');
const lazyLoadHandler = require('./lazy-load-handler');
const originalPostHandler = require('./original-post-handler');
const getImageDimensions = require('../../utils/get-image-dimensions');

const {
  Worker,
  isMainThread,
  parentPort,
  workerData,
  threadId
} = require('worker_threads');

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

if (isMainThread) {
  module.exports = (batch, type) =>
    new Promise((resolve, reject) => {
      const worker = new Worker(__filename, {
        workerData: {
          batch,
          type
        }
      });
      worker.on('message', resolve);
      worker.on('error', reject);
      worker.on('exit', code => {
        if (code !== 0)
          reject(new Error(`Worker stopped with exit code ${code}`));
      });
    });
} else {
  (async () => {
    console.log(`${threadId} Starting ${workerData}`);
    const { batch, type } = workerData;

    // Process current batch of posts / pages
    await Promise.all(
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
        await Promise.all(
          obj.tags.map(async tag => {
            if (tag.feature_image) {
              tag.image_dimensions = { ...tag.image_dimensions };
              tag.image_dimensions.feature_image = await getImageDimensions(
                tag.feature_image,
                tag.name
              );
            }
          })
        );

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
    );

    console.log(`${threadId} Ending ${workerData}`);

    // Flatten array of all processed batches before returning
    return parentPort.postMessage(batch);
  })();
}

// const processBatches = async (batches, type) => {
//   const result = [];

//   for (const i in batches) {
//     const currBatch = batches[i];
//     const currBatchNo = Number(i) + 1;
//     const totalBatches = batches.length;

//     if (currBatch.length > 0)
//       console.log(
//         `Processing ${type} batch ${currBatchNo} of ${totalBatches}...`
//       );

//     // Process current batch of posts / pages
//     await Promise.all(
//       currBatch.map(async obj => {
//         // Clean incoming objects
//         obj = removeUnusedProperties(obj);
//         obj.primary_author = removeUnusedProperties(obj.primary_author);
//         obj.tags.map(tag => removeUnusedProperties(tag));

//         // Feature image resolutions for structured data
//         if (obj.feature_image) {
//           obj.image_dimensions = { ...obj.image_dimensions };
//           obj.image_dimensions.feature_image = await getImageDimensions(
//             obj.feature_image,
//             obj.title
//           );
//         }

//         // Author image resolutions for structured data
//         if (obj.primary_author.profile_image) {
//           obj.primary_author.image_dimensions = {
//             ...obj.primary_author.image_dimensions
//           };
//           obj.primary_author.image_dimensions.profile_image =
//             await getImageDimensions(
//               obj.primary_author.profile_image,
//               obj.primary_author.name,
//               true
//             );
//         }

//         if (obj.primary_author.cover_image) {
//           obj.primary_author.image_dimensions = {
//             ...obj.primary_author.image_dimensions
//           };
//           obj.primary_author.image_dimensions.cover_image =
//             await getImageDimensions(
//               obj.primary_author.cover_image,
//               obj.primary_author.name,
//               true
//             );
//         }

//         // Tag image resolutions for structured data
//         obj.tags.map(async tag => {
//           if (tag.feature_image) {
//             tag.image_dimensions = { ...tag.image_dimensions };
//             tag.image_dimensions.feature_image = await getImageDimensions(
//               tag.feature_image,
//               tag.name
//             );
//           }
//         });

//         // Original author / translator feature
//         if (obj.codeinjection_head) obj = await originalPostHandler(obj);

//         // Stash original excerpt and escape for structured data.
//         // Shorten the default excerpt and replace newlines -- the
//         // browser will normalize multiple spaces
//         if (obj.excerpt) {
//           obj.original_excerpt = obj.excerpt;

//           obj.excerpt = obj.excerpt
//             .replace(/\n+/g, ' ')
//             .split(' ')
//             .slice(0, 50)
//             .join(' ');
//         }

//         // Handle AMP processing for posts before modifying the original
//         // HTML and add flags to dynamically import AMP scripts
//         if (type === 'posts' && obj.html) obj.amp = await ampHandler(obj);

//         // Lazy load images and embedded videos
//         if (obj.html) obj.html = await lazyLoadHandler(obj.html, obj.title);

//         return obj;
//       })
//     );

//     result.push(currBatch);
//   }

//   // Flatten array of all processed batches before returning
//   return result.flat();
// };

// module.exports = processBatches;
