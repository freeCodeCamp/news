const getImageDimensions = require('../../utils/get-image-dimensions');
const modifyHashnodeHTML = require('./modify-hashnode-html');

const processBatch = async ({ batch, currBatchNo, totalBatches }) => {
  console.log(
    `Processing hashnode posts batch ${currBatchNo} of ${totalBatches}...`
  );

  // Process current batch of posts / pages
  const newBatch = [];
  for (const oldPost of batch) {
    let newPost = {};

    newPost.id = oldPost.id;
    newPost.slug = oldPost.slug;
    newPost.title = oldPost.title;
    newPost.subtitle = oldPost.subtitle;
    newPost.reading_time = oldPost.readTimeInMinutes;

    if (oldPost.coverImage) {
      newPost.feature_image = oldPost.coverImage.url;
      newPost.image_dimensions = {};
      newPost.image_dimensions.feature_image = await getImageDimensions(
        newPost.feature_image,
        newPost.title
      );
    }

    const newPostAuthor = {};
    newPostAuthor.id = oldPost.author.id;
    newPostAuthor.name = oldPost.author.name;
    newPostAuthor.username = oldPost.author.username;
    newPostAuthor.bio = oldPost.author.bio.text;
    newPostAuthor.path = `/author/${oldPost.author.username}/`;
    newPostAuthor.twitter = oldPost.author.socialMediaLinks.twitter;
    newPostAuthor.facebook = oldPost.author.socialMediaLinks.facebook;
    if (oldPost.author.profilePicture) {
      newPostAuthor.profile_image = oldPost.author.profilePicture;
      newPostAuthor.image_dimensions = {};
      newPostAuthor.image_dimensions.profile_image = await getImageDimensions(
        newPostAuthor.profile_image,
        newPostAuthor.name,
        true
      );
    }
    newPost.primary_author = newPostAuthor;

    newPost.published_at = oldPost.publishedAt;
    newPost.updated_at = oldPost.updatedAt;
    newPost.path = `/${oldPost.slug}/`;
    newPost.html = oldPost.content.html;

    newPost = await modifyHashnodeHTML(newPost);

    newBatch.push(newPost);
  }

  return newBatch;
};

module.exports = processBatch;
