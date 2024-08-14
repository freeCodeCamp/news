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
    batch.map(async obj => {
      obj.path = `/${obj.slug}/`;
      // Set the source of the publication and whether it's a page or post for tracking and later processing
      obj.source = 'Hashnode';
      const singularContentType = contentType.slice(0, -1);
      obj.contentType = singularContentType;

      obj.html = await modifyHTMLContent({
        postContent: obj.content.html,
        postTitle: obj.title,
        source: obj.source
      });
      delete obj.content;

      // Hashnode pages don't have a brief that we can cast as an excerpt or original_excerpt,
      // so we strip the HTML tags from the body text to generate a brief for SEO and structured data.
      if (!Object.hasOwn(obj, 'brief')) {
        const sanitizedBodyText = stripHTMLTags(obj.html);
        obj.brief = shortenExcerpt(sanitizedBodyText);
      }

      // Note: Longer posts include an ellipsis. We can decide how to
      // handle this in the future.
      obj.original_excerpt = obj.brief;
      obj.excerpt = shortenExcerpt(obj.brief);
      delete obj.brief;

      if (contentType === 'posts') {
        // Set a default feature image for posts if one doesn't exist
        // Note: We're not handling pages from Hashnode, so there's no
        // need to handle cases where we may not want to have a cover image
        // for a particular page.
        obj.feature_image = obj?.coverImage?.url
          ? obj.coverImage.url
          : 'https://cdn.freecodecamp.org/platform/universal/fcc_meta_1920X1080-indigo.png';
        delete obj.coverImage;

        obj.image_dimensions = {
          feature_image: await getImageDimensions(
            obj.feature_image,
            `Hashnode ${singularContentType} feature image: ${obj.title}`
          )
        };

        if (obj?.author) {
          obj.primary_author = {
            id: obj.author.id,
            name: obj.author.name,
            slug: obj.author.username,
            path: `/author/${obj.author.username}/`,
            bio: obj.author.bio.text,
            location: obj.author.location,
            website: obj.author.socialMediaLinks.website,
            // Note: Mutate Twitter and Facebook links so they're just the username like
            // on Ghost for now.
            // TODO: Simplify social media links and how they're used throughout the build
            // in the future.
            twitter: obj.author.socialMediaLinks.twitter
              ? obj.author.socialMediaLinks.twitter.replace(
                  'https://twitter.com/',
                  '@'
                )
              : null,
            facebook: obj.author.socialMediaLinks.facebook
              ? obj.author.socialMediaLinks.facebook.replace(
                  'https://www.facebook.com/',
                  ''
                )
              : null
          };

          if (obj.author.profilePicture) {
            obj.primary_author.profile_image = obj.author.profilePicture;
            obj.primary_author.image_dimensions = {
              profile_image: await getImageDimensions(
                obj.primary_author.profile_image,
                `Hashnode author profile image: ${obj.name}`
              )
            };
          }

          delete obj.author;
        }

        obj.tags = obj.tags.map(tag => {
          tag.path = `/tag/${tag.slug}/`;
          // TODO: Setting all tags as public for now. Have to decide how we'll
          // handle private tags.
          tag.visibility = 'public';
          return tag;
        });

        obj.published_at = obj.publishedAt;
        obj.updated_at = obj.updatedAt ? obj.updatedAt : obj.publishedAt;
        obj.reading_time = obj.readTimeInMinutes;
        delete obj.publishedAt;
        delete obj.updatedAt;
        delete obj.readTimeInMinutes;

        // Note: We only use the SEO description for the original post / translator
        // feature, and don't use it for structured data or SEO for built pages, so
        // it doesn't have to included in the final returned object.
        if (obj?.seo?.description) {
          const originalPostData = await originalPostHandler(
            obj.seo.description,
            obj.title
          );

          if (originalPostData) {
            obj.original_post = originalPostData;
            obj.html = originalPostData.introHTML + obj.html;
          }

          delete obj.seo;
        }
      }

      return obj;
    })
  );

  return batch;
};

module.exports = processBatch;
