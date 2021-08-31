const postsPerPage = process.env.POSTS_PER_PAGE;
const { api, enApi, apiUrl } = require('../../utils/ghost-api');
const getImageDimensions = require('../../utils/image-dimensions');
const { escape, chunk } = require('lodash');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;
const i18next = require('../../i18n/config');

const wait = seconds => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(seconds);
    }, seconds * 1000);
  });
};

// Strip Ghost domain from urls
const stripDomain = url => url.replace(apiUrl, '');

const getUniqueList = (arr, key) => [...new Map(arr.map(item => [item[key], item])).values()];

const imageDimensionHandler = async (targetObj, imageKey, mapObj, mapKey) => {
  // Check map for existing dimensions
  if (mapObj[mapKey] && mapObj[mapKey][imageKey]) {
    targetObj.image_dimensions = mapObj[mapKey];
  } else {
    // Get dimensions and append to targetObj and map
    targetObj.image_dimensions = {...targetObj.image_dimensions};
    mapObj[mapKey] = {...mapObj[mapKey]};

    const { width, height } = await getImageDimensions(targetObj[imageKey], targetObj.title);

    targetObj.image_dimensions[imageKey] = { width, height };
    mapObj[mapKey][imageKey] = { width, height };
  }
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
    const originalPostRes = await enApi.posts
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

      // Add explicit width and height only for non-hotlinked images
      if (image.src.includes(apiUrl)) {
        const { width, height } = await getImageDimensions(image.src, title);
      
        image.setAttribute('width', width);
        image.setAttribute('height', height);
      }

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

  return dom.serialize();
}

const fetchFromGhost = async (endpoint, options) => {
  let currPage = 1;
  let lastPage = 5;
  let data = [];
  const featureImageDimensions = {};
  const authorImageDimensions = {};

  while (currPage && currPage <= lastPage) {
    const ghostRes = await api[endpoint].browse({
      ...options,
      page: currPage
    })
    .catch(err => {
      console.error(err);
    });

    // Get image dimensions and append to post / page
    const resolvedData = await Promise.all(
      ghostRes.map(async obj => {
        // Post image resolutions for structured data
        if (obj.feature_image) await imageDimensionHandler(obj, 'feature_image', featureImageDimensions, obj.feature_image);

        // Author image resolutions for structured data
        if (obj.primary_author.profile_image) {
          await imageDimensionHandler(obj.primary_author, 'profile_image', authorImageDimensions, obj.primary_author.slug);
        }

        if (obj.primary_author.cover_image) {
          await imageDimensionHandler(obj.primary_author, 'cover_image', authorImageDimensions, obj.primary_author.slug);
        }

        obj.tags.map(async tag => {
          if (tag.feature_image) await imageDimensionHandler(tag, 'feature_image', featureImageDimensions, tag.feature_image);
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
        
        // Lazy load images and embedded videos
        if (obj.html) obj.html = await lazyLoadHandler(obj.html, obj.title);

        return obj;
      })
    );

    resolvedData.forEach(obj => data.push(obj));

    lastPage = ghostRes.meta.pagination.pages;
    console.log(`Fetched ${endpoint} page ${currPage} of ${lastPage}...`);
    currPage = ghostRes.meta.pagination.next;

    await wait(0.1);
  }

  return data;
};

module.exports = async () => {
  const ghostPosts = await fetchFromGhost('posts', {
    include: ['tags', 'authors'],
    filter: 'status:published',
    limit: 100
  });
  const ghostPages = await fetchFromGhost('pages', {
    include: ['tags', 'authors'],
    filter: 'status:published',
    limit: 100
  });

  const posts = ghostPosts.map(post => {
    post.path = stripDomain(post.url);
    post.primary_author.path = stripDomain(post.primary_author.url);
    post.tags.map(tag => (tag.path = stripDomain(tag.url)));
    if (post.primary_tag) post.primary_tag.path = stripDomain(post.primary_tag.url);
    post.authors.forEach(author => author.path = stripDomain(author.url));

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
  const primaryAuthors = getUniqueList(posts.map(post => post.primary_author), 'id');
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

  return {
    posts,
    pages,
    authors,
    tags,
    popularTags
  };
};
