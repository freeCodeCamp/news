const modifyHTMLContent = require('../modify-html-content');
const getImageDimensions = require('../../utils/get-image-dimensions');

const processBatch = async ({ batch, currBatchNo, totalBatches }) => {
  console.log(
    `Processing Hashnode posts batch ${currBatchNo} of ${totalBatches}...`
  );

  // Process current batch of posts
  const newBatch = [];
  for (const oldPost of batch) {
    const newPost = {};

    newPost.id = oldPost.id;
    newPost.slug = oldPost.slug;
    newPost.title = oldPost.title;
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
    newPostAuthor.slug = oldPost.author.username;
    newPostAuthor.bio = oldPost.author.bio.text;
    newPostAuthor.location = oldPost.author.location;
    newPostAuthor.website = oldPost.author.socialMediaLinks.website;
    // Note: Mutate Twitter and Facebook links so they're just the username like
    // on Ghost for now.
    // TODO: Simplify social media links and how they're used throughout the build
    // in the future.
    newPostAuthor.twitter = oldPost.author.socialMediaLinks.twitter
      ? oldPost.author.socialMediaLinks.twitter.replace(
          'https://twitter.com/',
          '@'
        )
      : null;
    newPostAuthor.facebook = oldPost.author.socialMediaLinks.facebook
      ? oldPost.author.socialMediaLinks.facebook.replace(
          'https://www.facebook.com/',
          ''
        )
      : null;
    newPostAuthor.path = `/author/${oldPost.author.username}/`;
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

    newPost.tags = oldPost.tags.map(tag => {
      tag.path = `/tag/${tag.slug}/`;
      // TODO: Setting all tags as public for now. Have to decide how we'll
      // handle private tags.
      tag.visibility = 'public';
      return tag;
    });

    newPost.published_at = oldPost.publishedAt;
    newPost.updated_at = oldPost.updatedAt;
    newPost.path = `/${oldPost.slug}/`;
    newPost.html = await modifyHTMLContent({
      postContent: oldPost.content.html,
      postTitle: newPost.title
    });

    // Note: Longer posts include an ellipsis. We can decide how to
    // handle this in the future.
    if (oldPost.brief) {
      newPost.original_excerpt = oldPost.brief;

      newPost.excerpt = oldPost.brief
        .replace(/\n+/g, ' ')
        .split(' ')
        .slice(0, 50)
        .join(' ');
    }

    newPost.source = 'Hashnode';

    newBatch.push(newPost);
  }

  return newBatch;
};

module.exports = processBatch;
