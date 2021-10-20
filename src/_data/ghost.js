const postsPerPage = process.env.POSTS_PER_PAGE;
const { sourceApi, sourceApiUrl, englishApi } = require('../../utils/ghost-api');
const { getImageDimensions } = require('../../utils/image-dimensions');
const { ampHandler } = require('../../utils/amp-handler');
const { escape, chunk, cloneDeep } = require('lodash');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;
const i18next = require('../../i18n/config');
const { writeFileSync, unlinkSync } = require('fs');
const fourOhFourLogName = '404-errors.log';
const fourOhFourReportedErrors = [];
const siteUrl = process.env.SITE_URL;

const wait = seconds => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(seconds);
    }, seconds * 1000);
  });
};

// Strip Ghost domain from urls
const stripDomain = url => url.replace(sourceApiUrl, '');

const getUniqueList = (arr, key) => [...new Map(arr.map(item => [item[key], item])).values()];

const jsonLdImageDimensionHandler = async (targetObj, targetKey, imageUrl) => {
  // Set image_dimensions to existing object or undefined
  targetObj.image_dimensions = { ...targetObj.image_dimensions };

  const { width, height } = await getImageDimensions(imageUrl, targetObj.title);

  targetObj.image_dimensions[targetKey] = { width, height };
}

const originalPostHandler = async (post) => {
  const originalPostRegex = /const\s+fccOriginalPost\s+=\s+("|')(?<url>.*)\1;?/g;
  const match = originalPostRegex.exec(post.codeinjection_head);
  
  if (match) {
    const url = match.groups.url;
    const urlArr = url.split('/');
    // handle urls that end with a slash,
    // then urls that don't end in a slash
    const originalPostSlug = urlArr[urlArr.length - 1] ?
      urlArr[urlArr.length - 1] :
      urlArr[urlArr.length - 2];
    const originalPostRes = await englishApi.posts
      .read({
        include: 'authors',
        slug: originalPostSlug
      })
      .catch(err => {
        console.error(err);
      });
    const {
      title,
      published_at,
      primary_author
    } = originalPostRes;

    post.original_post = {
      title,
      published_at,
      url,
      primary_author
    }
  }

  return post;
}

const lazyLoadHandler = async (html, title) => {
  const dom = new JSDOM(html);
  const document = dom.window.document;
  const images = [...document.querySelectorAll('img.kg-image')];
  const iframes = [...document.querySelectorAll('figure.kg-embed-card iframe')];

  await Promise.all(
    images.map(async image => {
      // To do: swap out the image URLs here once we have them auto synced
      // with an S3 bucket
      const { width, height } = await getImageDimensions(image.src, title);
    
      image.setAttribute('width', width);
      image.setAttribute('height', height);

      // lazysizes
      image.setAttribute('data-srcset', image.srcset);
      image.setAttribute('data-src', image.src);
      image.removeAttribute('src');
      image.className = `${image.className} lazyload`;
    }),

    iframes.map(async iframe => {
      iframe.setAttribute('title', `${i18next.t('embed-title')}`);

      // To do: consider adding a low quality facade image via src
      // lazysizes
      iframe.setAttribute('data-src', iframe.src);
      iframe.removeAttribute('src');
      iframe.className = `${iframe.className} lazyload`;
    })
  );

  // The jsdom parser wraps the incomplete HTML from the Ghost
  // API with HTML, head, and body elements, so return whatever
  // is within the new body element it added
  return dom.window.document.body.innerHTML;
}

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

    // Get image dimensions and append to post / page
    const resolvedData = await Promise.all(
      ghostRes.map(async obj => {
        // Post image resolutions for structured data
        if (obj.feature_image) await jsonLdImageDimensionHandler(obj, 'feature_image', obj.feature_image);

        // Author image resolutions for structured data
        if (obj.primary_author.profile_image) {
          await jsonLdImageDimensionHandler(obj.primary_author, 'profile_image', obj.primary_author.profile_image);
        }

        if (obj.primary_author.cover_image) {
          await jsonLdImageDimensionHandler(obj.primary_author, 'cover_image', obj.primary_author.profile_image);
        }

        obj.tags.map(async tag => {
          if (tag.feature_image) await jsonLdImageDimensionHandler(tag, 'feature_image', tag.feature_image);
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
        if (endpoint === 'posts' && obj.html) obj = await ampHandler(obj);
        
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

const fourOhFourLogger = ({ type, name }) => {
  if (!fourOhFourReportedErrors.includes(name)) {
    const str = `${type}: ${name}\n`;

    fourOhFourReportedErrors.push(name);
    return writeFileSync(fourOhFourLogName, str, { flag: 'a+' });
  }
}

module.exports = async () => {
  const limit = 200;
  const ghostPosts = await fetchFromGhost('posts', {
    include: ['tags', 'authors'],
    filter: 'status:published',
    limit
  });
  const ghostPages = await fetchFromGhost('pages', {
    include: ['tags', 'authors'],
    filter: 'status:published',
    limit
  });

  // Remove 404 error log from previous build, if it exists
  try {
    unlinkSync(fourOhFourLogName);
  } catch (err) {
    console.log("Error log doesn't exist...");
  }

  const posts = ghostPosts.map(post => {
    post.path = stripDomain(post.url);
    post.primary_author.path = stripDomain(post.primary_author.url);
    post.tags.forEach(tag => {
      // Log and fix tag pages that point to 404 due to a Ghost error
      if (tag.url.endsWith('/404/') && tag.visibility === 'public') {
        fourOhFourLogger({ type: 'tag', name: tag.name });
        tag.url = `${siteUrl}/${tag.slug}/`;
      }

      tag.path = stripDomain(tag.url);
    });
    if (post.primary_tag) post.primary_tag.path = stripDomain(post.primary_tag.url);
    post.authors.forEach(author => {
      // Log and fix author pages that point to 404 due to a Ghost error
      if (author.url.endsWith('/404/')) {
        fourOhFourLogger({ type: 'author', name: author.name });
        author.url = `${siteUrl}/${author.slug}/`;
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
