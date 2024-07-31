const originalPostHandler = require('../original-post-handler');
const modifyHTMLContent = require('../modify-html-content');
const getImageDimensions = require('../../utils/get-image-dimensions');
const { stripHTMLTags } = require('../../utils/modify-html-helpers');
const shortenExcerpt = require('../../utils/shorten-excerpt');

const processBatch = async ({
  batch,
  contentType,
  currBatchNo,
  totalBatches
}) => {
  console.log(
    `Processing Hashnode ${contentType} batch ${currBatchNo} of ${totalBatches}...and using ${process.memoryUsage.rss() / 1024 / 1024} MB of memory`
  );

  await Promise.all(
    batch.map(async oldObj => {
      const newObj = {};

      newObj.id = oldObj.id;
      newObj.slug = oldObj.slug;
      newObj.path = `/${oldObj.slug}/`;
      newObj.title = oldObj.title;
      // Set the source of the publication and whether it's a page or post for tracking and later processing
      newObj.source = 'Hashnode';
      const singularContentType = contentType.slice(0, -1);
      newObj.contentType = singularContentType;

      newObj.html = await modifyHTMLContent({
        postContent: oldObj.content.html,
        postTitle: newObj.title,
        source: newObj.source
      });

      // Hashnode pages don't have a brief that we can cast as an excerpt or original_excerpt,
      // so we strip the HTML tags from the body text to generate a brief for SEO and structured data.
      if (!Object.hasOwn(oldObj, 'brief')) {
        const sanitizedBodyText = stripHTMLTags(newObj.html);
        oldObj.brief = shortenExcerpt(sanitizedBodyText);
      }

      // Note: Longer posts include an ellipsis. We can decide how to
      // handle this in the future.
      newObj.original_excerpt = oldObj.brief;
      newObj.excerpt = shortenExcerpt(oldObj.brief);

      if (contentType === 'posts') {
        // Set a default feature image for posts if one doesn't exist
        // Note: We're not handling pages from Hashnode, so there's no
        // need to handle cases where we may not want to have a cover image
        // for a particular page.
        newObj.feature_image = oldObj?.coverImage?.url
          ? oldObj.coverImage.url
          : 'https://cdn.freecodecamp.org/platform/universal/fcc_meta_1920X1080-indigo.png';

        newObj.image_dimensions = {};
        newObj.image_dimensions.feature_image = await getImageDimensions(
          newObj.feature_image,
          `Hashnode ${singularContentType} feature image: ${newObj.title}`
        );

        const newObjAuthor = {};
        newObjAuthor.id = oldObj.author.id;
        newObjAuthor.name = oldObj.author.name;
        newObjAuthor.slug = oldObj.author.username;
        newObjAuthor.bio = oldObj.author.bio.text;
        newObjAuthor.location = oldObj.author.location;
        newObjAuthor.website = oldObj.author.socialMediaLinks.website;
        // Note: Mutate Twitter and Facebook links so they're just the username like
        // on Ghost for now.
        // TODO: Simplify social media links and how they're used throughout the build
        // in the future.
        newObjAuthor.twitter = oldObj.author.socialMediaLinks.twitter
          ? oldObj.author.socialMediaLinks.twitter.replace(
              'https://twitter.com/',
              '@'
            )
          : null;
        newObjAuthor.facebook = oldObj.author.socialMediaLinks.facebook
          ? oldObj.author.socialMediaLinks.facebook.replace(
              'https://www.facebook.com/',
              ''
            )
          : null;
        newObjAuthor.path = `/author/${oldObj.author.username}/`;
        if (oldObj.author.profilePicture) {
          newObjAuthor.profile_image = oldObj.author.profilePicture;
          newObjAuthor.image_dimensions = {};
          newObjAuthor.image_dimensions.profile_image =
            await getImageDimensions(
              newObjAuthor.profile_image,
              `Hashnode author profile image: ${newObjAuthor.name}`
            );
        }
        newObj.primary_author = newObjAuthor;

        newObj.tags = oldObj.tags.map(tag => {
          tag.path = `/tag/${tag.slug}/`;
          // TODO: Setting all tags as public for now. Have to decide how we'll
          // handle private tags.
          tag.visibility = 'public';
          return tag;
        });

        newObj.published_at = oldObj.publishedAt;
        newObj.updated_at = oldObj.updatedAt;
        newObj.reading_time = oldObj.readTimeInMinutes;

        // Note: We only use the SEO description for the original post / translator
        // feature, and don't use it for structured data or SEO for built pages, so
        // it doesn't have to be added to the newObj mimicking a Ghost post.
        if (oldObj?.seo?.description) {
          const originalPostData = await originalPostHandler(
            oldObj.seo.description
          );

          newObj.original_post = originalPostData;
          newObj.html = originalPostData?.introHTML + newObj.html;
        }
      }

      return obj;
    })
  );

  return batch;
};

module.exports = processBatch;
