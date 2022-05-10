const Piscina = require('piscina');
const { chunk, cloneDeep } = require('lodash');
const { resolve } = require('path');

const fetchFromGhost = require('../../utils/ghost/fetch-from-ghost');
const { postsPerPage } = require('../../config');

const getUniqueList = (arr, key) => [
  ...new Map(arr.map(item => [item[key], item])).values()
];

const piscina = new Piscina({
  filename: resolve(__dirname, '../../utils/ghost/process-batch')
});

module.exports = async () => {
  // Chunk raw Ghost posts and pages and process them in batches
  // with a pool of workers to create posts and pages global data
  const batchSize = 200;
  const allPosts = await fetchFromGhost('posts');
  const allPages = await fetchFromGhost('pages');
  const posts = await Promise.all(
    chunk(allPosts, batchSize).map((batch, i, arr) =>
      piscina.run({
        batch,
        type: 'posts',
        currBatchNo: Number(i) + 1,
        totalBatches: arr.length
      })
    )
  )
    .then(arr => {
      console.log('Finished processing all posts');
      return arr.flat();
    })
    .catch(err => console.error(err));
  const pages = await Promise.all(
    chunk(allPages, batchSize).map((batch, i, arr) =>
      piscina.run({
        batch,
        type: 'pages',
        currBatchNo: Number(i) + 1,
        totalBatches: arr.length
      })
    )
  )
    .then(arr => {
      console.log('Finished processing all pages');
      return arr.flat();
    })
    .catch(err => console.error(err));

  // Create authors global data for author pages
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
          tags: [post.tags[0]], // Only include the first / primary tag
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

  // Create tags global data for tags pages
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
          tags: [post.tags[0]], // Only include the first / primary tag
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

  // Create popularTags global data to show at the top of tag pages
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

  // Create feeds global data for the main, tags, and authors
  // RSS feeds
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
