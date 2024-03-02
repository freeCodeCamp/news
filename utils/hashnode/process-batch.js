const getImageDimensions = require('../../utils/get-image-dimensions');

const processBatch = async ({ batch, currBatchNo, totalBatches }) => {
  console.log(
    `Processing hashnode posts batch ${currBatchNo} of ${totalBatches}...`
  );

  // Process current batch of posts / pages
  await Promise.all(
    batch.map(async obj => {
      if (obj.coverImage) {
        obj.feature_image = obj.coverImage.url;
        obj.image_dimensions = { ...obj.image_dimensions };
        obj.image_dimensions.feature_image = await getImageDimensions(
          obj.feature_image,
          obj.title
        );
      }

      if (obj.author.profilePicture) {
        obj.primary_author = {
          profile_image: obj.author.profilePicture
        };
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

      obj.primary_author = {
        ...obj.primary_author,
        name: obj.author.name
      };
      obj.published_at = obj.publishedAt;
      obj.updated_at = obj.updatedAt;
      obj.path = `/${obj.slug}/`;

      return obj;
    })
  );

  return batch;
};

module.exports = processBatch;
