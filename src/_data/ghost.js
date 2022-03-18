const { chunk, cloneDeep } = require('lodash');

const fetchFromGhost = require('../../utils/ghost/fetch-from-ghost');
const processBatches = require('../../utils/ghost/process-batches');
const errorLogger = require('../../utils/error-logger');

const { sourceApiUrl } = require('../../utils/ghost/api');
const { siteURL, postsPerPage } = require('../../config');

// Strip Ghost domain from urls
const stripDomain = url => {
  return url.replace(sourceApiUrl, '');
};

const getUniqueList = (arr, key) => [
  ...new Map(arr.map(item => [item[key], item])).values()
];

module.exports = async () => {
  // Chunk to process in larger batches
  const batchSize = 50;
  const allPosts = await fetchFromGhost('posts');
  const allPages = await fetchFromGhost('pages');
  // const processedPosts = await processBatches(
  //   chunk(allPosts, batchSize),
  //   'posts'
  // );
  // const processedPages = await processBatches(
  //   chunk(allPages, batchSize),
  //   'pages'
  // );
  const processedPosts = await Promise.all(
    chunk(allPosts, batchSize).map(batch => processBatches(batch, 'posts'))
  ).then(arr => arr.flat());
  const processedPages = await Promise.all(
    chunk(allPages, batchSize).map(batch => processBatches(batch, 'pages'))
  ).then(arr => arr.flat());

  const posts = processedPosts.map(post => {
    post.path = stripDomain(post.url);
    post.primary_author.path = stripDomain(post.primary_author.url);
    post.tags.forEach(tag => {
      // Log and fix tag pages that point to 404 due to a Ghost error
      if (tag.url.endsWith('/404/') && tag.visibility === 'public') {
        errorLogger({ type: 'tag', name: tag.name });
        tag.url = `${siteURL}/tag/${tag.slug}/`;
      }

      tag.path = stripDomain(tag.url);
    });

    // Log and fix author pages that point to 404 due to a Ghost error
    if (post.primary_author.url.endsWith('/404/')) {
      errorLogger({ type: 'author', name: post.primary_author.name });
      post.primary_author.url = `${siteURL}/author/${post.primary_author.slug}/`;
    }

    post.primary_author.path = stripDomain(post.primary_author.url);

    // Convert publish date into a Date object
    post.published_at = new Date(post.published_at);

    return post;
  });

  const pages = processedPages.map(page => {
    page.path = stripDomain(page.url);
    page.primary_author.path = stripDomain(page.primary_author.url);

    // Convert publish date into a Date object
    page.published_at = new Date(page.published_at);

    return page;
  });

  const authors = [];
  const primaryAuthors = getUniqueList(
    posts.map(post => post.primary_author),
    'id'
  );
  primaryAuthors.forEach(author => {
    // Attach posts to their respective author
    const currAuthorPosts = posts
      .filter(post => post.primary_author.id === author.id)
      .map(post => {
        return {
          title: post.title,
          slug: post.slug,
          path: post.path,
          url: post.url,
          feature_image: post.feature_image,
          published_at: post.published_at,
          primary_author: post.primary_author,
          tags: [post.tags[0]],
          image_dimensions: { ...post.image_dimensions }
        };
      });

    if (currAuthorPosts.length) author.posts = currAuthorPosts;

    const paginatedCurrAuthorPosts = chunk(currAuthorPosts, postsPerPage);

    paginatedCurrAuthorPosts.forEach((arr, i) => {
      // For each entry in paginatedCurrAuthorPosts, add the author object
      // with some extra data for custom pagination
      authors.push({
        ...author,
        page: i,
        posts: arr,
        count: {
          posts: currAuthorPosts.length
        }
      });
    });
  });

  const tags = [];
  const visibleTags = posts.reduce((arr, post) => {
    return [...arr, ...post.tags.filter(tag => tag.visibility === 'public')];
  }, []);
  const allTags = getUniqueList(visibleTags, 'id');
  allTags.forEach(tag => {
    // Attach posts to their respective tag
    const currTagPosts = posts
      .filter(post => post.tags.map(postTag => postTag.slug).includes(tag.slug))
      .map(post => {
        return {
          title: post.title,
          slug: post.slug,
          path: post.path,
          url: post.url,
          feature_image: post.feature_image,
          published_at: post.published_at,
          primary_author: post.primary_author,
          tags: [post.tags[0]],
          image_dimensions: { ...post.image_dimensions }
        };
      });
    // Save post count to tag object to help determine popular tags
    tag.count = {
      posts: currTagPosts.length
    };

    const paginatedCurrTagPosts = chunk(currTagPosts, postsPerPage);

    paginatedCurrTagPosts.forEach((arr, i) => {
      // For each entry in paginatedCurrTagPosts, add the tag object
      // with some extra data for custom pagination
      tags.push({
        ...tag,
        page: i,
        posts: arr,
        count: {
          posts: currTagPosts.length
        }
      });
    });
  });

  const popularTags = [...allTags]
    .sort(
      (a, b) =>
        b.count.posts - a.count.posts ||
        a.name
          .toLowerCase()
          .localeCompare(b.name.toLowerCase(), 'en', { sensitivity: 'base' })
    )
    .slice(0, 15);

  const getCollectionFeeds = collection =>
    collection
      // Filter out paginated authors / tags if they exist
      .filter(obj => (obj.page ? obj.page === 0 : obj))
      .map(obj => {
        const feedObj = cloneDeep(obj);
        // The main feed shows the last 10 posts. Tag and author
        // pages show the last 15 posts
        const feedPostLimit = feedObj.path === '/' ? 10 : 15;

        feedObj.posts = feedObj.posts.slice(0, feedPostLimit).map(post => {
          // Append the feature image to the post content
          if (post.feature_image)
            post.html =
              `<img src="${post.feature_image}" alt="${post.title}">` +
              post.html;

          return post;
        });

        return feedObj;
      });

  const feeds = [
    // Create custom collection for main RSS feed
    getCollectionFeeds([
      {
        path: '/',
        posts
      }
    ]),
    getCollectionFeeds(authors),
    getCollectionFeeds(tags)
  ].flat();

  return {
    posts,
    pages,
    authors,
    tags,
    popularTags,
    feeds
  };
};
