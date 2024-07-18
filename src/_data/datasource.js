const Piscina = require('piscina');
const { chunk, cloneDeep } = require('lodash');
const { resolve, basename } = require('path');

const fetchFromGhost = require('../../utils/ghost/fetch-from-ghost');
const fetchFromHashnode = require('../../utils/hashnode/fetch-from-hashnode');
const { postsPerPage, siteURL } = require('../../config');
const pingEditorialTeam = require('../../utils/ping-editorial-team');

const getUniqueList = (arr, key) => [
  ...new Map(arr.map(item => [item[key], item])).values()
];

const piscinaGhost = new Piscina({
  filename: resolve(__dirname, '../../utils/ghost/process-batch')
});
const piscinaHashnode = new Piscina({
  filename: resolve(__dirname, '../../utils/hashnode/process-batch')
});

module.exports = async () => {
  // Chunk raw Ghost posts and pages and process them in batches
  // with a pool of workers to create posts and pages global data
  const batchSize = 200;
  const allGhostPosts = await fetchFromGhost('posts');
  const allHashnodePosts = await fetchFromHashnode('posts');
  const allGhostPages = await fetchFromGhost('pages');
  const allHashnodePages = await fetchFromHashnode('pages');

  const ghostPosts = await Promise.all(
    chunk(allGhostPosts, batchSize).map((batch, i, arr) =>
      piscinaGhost.run({
        batch,
        contentType: 'posts',
        currBatchNo: Number(i) + 1,
        totalBatches: arr.length
      })
    )
  )
    .then(arr => {
      console.log('Finished processing all Ghost posts');
      return arr.flat();
    })
    .catch(err => console.error(err));
  const hashnodePosts = await Promise.all(
    chunk(allHashnodePosts, batchSize).map((batch, i, arr) =>
      piscinaHashnode.run({
        batch,
        contentType: 'posts',
        currBatchNo: Number(i) + 1,
        totalBatches: arr.length
      })
    )
  )
    .then(arr => {
      console.log('Finished processing all Hashnode posts');
      return arr.flat();
    })
    .catch(err => console.error(err));

  const ghostPages = await Promise.all(
    chunk(allGhostPages, batchSize).map((batch, i, arr) =>
      piscinaGhost.run({
        batch,
        contentType: 'pages',
        currBatchNo: Number(i) + 1,
        totalBatches: arr.length
      })
    )
  )
    .then(arr => {
      console.log('Finished processing all Ghost pages');
      return arr.flat();
    })
    .catch(err => console.error(err));
  const hashnodePages = await Promise.all(
    chunk(allHashnodePages, batchSize).map((batch, i, arr) =>
      piscinaHashnode.run({
        batch,
        contentType: 'pages',
        currBatchNo: Number(i) + 1,
        totalBatches: arr.length
      })
    )
  ).then(arr => {
    console.log('Finished processing all Hashnode pages');
    return arr.flat();
  });

  // Check for duplicate post / page slugs between Ghost and Hashnode,
  // use the first instance of the post, and log the duplicates. Also, because
  // Hashnode pages don't have a published_at date, they will always be marked as
  // duplicates if they share a slug with an existing Ghost page.
  const duplicates = [];
  const filterDuplicates = arr => {
    return arr
      .sort((a, b) => new Date(a?.published_at) - new Date(b?.published_at)) // Sort by published date in ascending order
      .filter((obj, i, arr) => {
        if (arr.findIndex(o => o.slug === obj.slug) !== i) {
          duplicates.push(obj);
          return false;
        }
        return true;
      })
      .reverse(); // Reverse the order to show the most recent posts / pages first
  };

  const posts = filterDuplicates([...ghostPosts, ...hashnodePosts]);
  const pages = filterDuplicates([...ghostPages, ...hashnodePages]);
  if (duplicates.length) pingEditorialTeam(duplicates);

  // Create authors global data for author pages
  const authors = [];
  const primaryAuthors = getUniqueList(
    posts.map(post => post.primary_author),
    'slug'
  );
  primaryAuthors.forEach(author => {
    // Attach posts to their respective author
    const currAuthorPosts = posts
      .filter(post => post.primary_author.slug === author.slug)
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
          image_dimensions: { ...post.image_dimensions },
          original_post: post?.original_post
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
  const allTags = getUniqueList(visibleTags, 'slug');
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
          image_dimensions: { ...post.image_dimensions },
          original_post: post?.original_post
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

  const generateSitemapObject = (collection, type) => {
    return {
      path: `sitemap-${type}.xml`,
      entries: cloneDeep(collection).map(obj => {
        const objPath = obj.path.replace(/^\//, '');
        const pageObj = {
          loc: siteURL + objPath
        };
        // Append lastmod if obj is a post or page with an updated_at property
        if (obj.updated_at)
          pageObj.lastmod = new Date(obj.updated_at).toISOString();

        // Handle images depending on the type of collection
        let imageKey;
        if ((type === 'posts' || 'pages' || 'tags') && obj.feature_image)
          imageKey = 'feature_image';
        if (type === 'authors') {
          if (obj.profile_image) imageKey = 'profile_image';
          if (obj.cover_image) imageKey = 'cover_image'; // Prefer cover_image over profile_image for authors
        }

        if (obj[imageKey]) {
          pageObj.image = {
            loc: obj[imageKey],
            caption: basename(obj[imageKey])
          };
        }

        return pageObj;
      })
    };
  };

  const sitemaps = [
    generateSitemapObject(pages, 'pages'),
    generateSitemapObject(posts, 'posts'),
    generateSitemapObject(primaryAuthors, 'authors'),
    generateSitemapObject(allTags, 'tags')
  ];

  // Add custom object for the landing page to the beginning of the pages sitemap collection entries array
  sitemaps[0].entries = [
    {
      loc: `${siteURL}`,
      // Published pages aren't shown on the landing page, so use the most recently updated post
      // for lastmod
      lastmod: sitemaps[1].entries[0].lastmod
    },
    ...sitemaps[0].entries
  ];

  // Sort sitemap entries
  sitemaps.forEach(sitemap =>
    sitemap.entries.sort((a, b) => {
      // Sort lastmod (posts and pages) in descending order
      // and loc (authors and tags) in ascending / alphabetical order
      if (a?.lastmod && b?.lastmod) {
        return new Date(b.lastmod) - new Date(a.lastmod);
      } else {
        if (a.loc < b.loc) return -1;
        if (a.loc > b.loc) return 1;
        return 0;
      }
    })
  );

  // Add a sitemap index object to the sitemaps array and use some data from the existing pages, posts,
  // authors, and tags sitemaps as entries to use in the template
  sitemaps.unshift({
    path: 'sitemap.xml',
    entries: sitemaps.map(obj => {
      const sitemapObj = {
        loc: `${siteURL}${obj.path}`
      };
      if (obj.entries[0].lastmod) sitemapObj.lastmod = obj.entries[0].lastmod;

      return sitemapObj;
    })
  });

  return {
    posts,
    pages,
    authors,
    tags,
    popularTags,
    feeds,
    sitemaps
  };
};
