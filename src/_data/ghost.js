const { chunk, cloneDeep } = require('lodash');

const fetchFromGhost = require('../../utils/ghost/fetch-from-ghost');
const processGhostResponse = require('../../utils/ghost/process-ghost-response');
const errorLogger = require('../../utils/error-logger');

const { sourceApiUrl } = require('../../utils/ghost/api');
const { siteURL, postsPerPage } = require('../../config');

// Strip Ghost domain from urls
const stripDomain = url => {
  // To do: figure out a better way to strip out everything
  // up to and including /news
  const toReplace = process.env.ELEVENTY_ENV === 'ci' ?
    'https://www.freecodecamp.org/news' :
    sourceApiUrl;

  return url.replace(toReplace, '');
};

const getUniqueList = (arr, key) => [...new Map(arr.map(item => [item[key], item])).values()];

module.exports = async () => {
  const limit = 200;
  let ghostPosts, ghostPages;

  if (process.env.ELEVENTY_ENV === 'ci') {
    const testPosts = require('../../cypress/seed-data/posts.json');
    const testPages = require('../../cypress/seed-data/pages.json');

    ghostPosts = await processGhostResponse(testPosts, 'posts');
    ghostPages = await processGhostResponse(testPages);
  } else {
    ghostPosts = await fetchFromGhost('posts', {
      include: ['tags', 'authors'],
      filter: 'status:published',
      limit
    });
    ghostPages = await fetchFromGhost('pages', {
      include: ['tags', 'authors'],
      filter: 'status:published',
      limit
    });
  }

  const posts = ghostPosts.map(post => {
    post.path = stripDomain(post.url);
    post.primary_author.path = stripDomain(post.primary_author.url);
    post.tags.forEach(tag => {
      // Log and fix tag pages that point to 404 due to a Ghost error
      if (tag.url.endsWith('/404/') && tag.visibility === 'public') {
        errorLogger({ type: 'tag', name: tag.name });
        console.log(tag.url);
        tag.url = `${siteURL}/tag/${tag.slug}/`;
        console.log(tag.url);
      }

      tag.path = stripDomain(tag.url);
    });
    if (post.primary_tag) post.primary_tag.path = stripDomain(post.primary_tag.url);
    post.authors.forEach(author => {
      // Log and fix author pages that point to 404 due to a Ghost error
      if (author.url.endsWith('/404/')) {
        errorLogger({ type: 'author', name: author.name });
        author.url = `${siteURL}/author/${author.slug}/`;
      }

      author.path = stripDomain(author.url);
    });

    // Convert publish date into a Date object
    post.published_at = new Date(post.published_at);

    return post;
  });

  const pages = ghostPages.map(page => {
    page.path = stripDomain(page.url);
    // Convert publish date into a Date object
    page.published_at = new Date(page.published_at);

    return page;
  });

  const authors = [];
  const primaryAuthors = getUniqueList(posts.map(post => post.primary_author), 'id')
    .filter((tag) => tag.path !== '/404/'); // Filter out possible 404 errors returned by Ghost API
  primaryAuthors.forEach(author => {
    // Attach posts to their respective author
    const currAuthorPosts = posts.filter(post => post.primary_author.id === author.id);

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
    return [
      ...arr,
      ...post.tags.filter(tag => tag.visibility === 'public')
    ]
  }, []);
  const allTags = getUniqueList(visibleTags, 'id');
  allTags.forEach(tag => {
    // Attach posts to their respective tag
    const currTagPosts = posts.filter(post => post.tags.map(postTag => postTag.slug).includes(tag.slug));
    // Save post count to tag object to help determine popular tags
    tag.count = {
      posts: currTagPosts.length
    }

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

  const popularTags = [...allTags].sort((a, b) => 
    b.count.posts - a.count.posts ||
    a.name.toLowerCase().localeCompare(b.name.toLowerCase(), 'en', { sensitivity: 'base' }
  )).slice(0, 15);

  const getCollectionFeeds = collection => collection
    // Filter out paginated authors / tags if they exist
    .filter(obj => obj.page ? obj.page === 0 : obj)
    .map(obj => {
      // The main feed shows the last 10 posts. Tag and author
      // pages show the last 15 posts
      const feedPostLimit = obj.path === '/' ? 10 : 15;
      const allPosts = cloneDeep(obj.posts);

      obj.posts = allPosts.slice(0, feedPostLimit)
        .map(post => {
          // Append the feature image to the post content
          if (post.feature_image) post.html = `<img src="${post.feature_image}" alt="${post.title}">` + post.html;

          return post;
        });

      return obj;
    });

  const feeds = [
    // Create custom collection for main RSS feed
    getCollectionFeeds([
      {
        path: '/',
        posts: [...posts]
      }
    ]),
    getCollectionFeeds([...authors]),
    getCollectionFeeds([...tags])
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
