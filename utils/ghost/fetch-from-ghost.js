const { sourceApi } = require('./api');
const { setJsonLdImageDimensions } = require('./helpers');
const ampHandler = require('./amp-handler');
const lazyLoadHandler = require('./lazy-load-handler');
const originalPostHandler = require('./original-post-handler');
const { escape } = require('lodash');

const wait = seconds => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(seconds);
    }, seconds * 1000);
  });
};

const fetchFromGhost = async (endpoint, options) => {
  let currPage = 1;
  let lastPage = 5;
  let data = [];

  while (currPage && currPage <= lastPage) {
    const ghostRes = await sourceApi[endpoint].browse({
      ...options,
      page: currPage
    })
    .catch(err => {
      console.error(err);
    });

    lastPage = ghostRes.meta.pagination.pages;
    console.log(`Fetched ${endpoint} page ${currPage} of ${lastPage}...`);
    currPage = ghostRes.meta.pagination.next;

    // Process post / page
    const resolvedData = await Promise.all(
      ghostRes.map(async obj => {
        // Post image resolutions for structured data
        if (obj.feature_image) await setJsonLdImageDimensions(obj, 'feature_image', obj.feature_image);

        // Author image resolutions for structured data
        if (obj.primary_author.profile_image) {
          await setJsonLdImageDimensions(obj.primary_author, 'profile_image', obj.primary_author.profile_image);
        }

        if (obj.primary_author.cover_image) {
          await setJsonLdImageDimensions(obj.primary_author, 'cover_image', obj.primary_author.profile_image);
        }

        obj.tags.map(async tag => {
          if (tag.feature_image) await setJsonLdImageDimensions(tag, 'feature_image', tag.feature_image);
        });
        
        // Original author / translator feature
        if (obj.codeinjection_head) obj = await originalPostHandler(obj);

        // To do: handle this in the JSON LD function
        if (obj.excerpt) obj.excerpt = escape(
          obj.excerpt.replace(/\n+/g, ' ')
            .split(' ')
            .slice(0, 50)
            .join(' ')
          );

        // Short excerpt for RSS feed, etc.
        if (obj.excerpt) obj.short_excerpt = obj.excerpt.replace(/\n+/g, ' ')
          .split(' ')
          .slice(0, 50)
          .join(' ');

        // Handle AMP processing before modifying the original HTML
        // and add flags to dynamically import AMP scripts
        if (endpoint === 'posts' && obj.html) obj.amp = await ampHandler(obj);
        
        // Lazy load images and embedded videos
        if (obj.html) obj.html = await lazyLoadHandler(obj.html, obj.title);

        return obj;
      })
    );

    resolvedData.forEach(obj => data.push(obj));

    await wait(0.1);
  }

  return data;
};

module.exports = fetchFromGhost;
