const postsPerPage = process.env.POSTS_PER_PAGE;
const { api, enApi, apiUrl } = require('../../utils/ghost-api');
const getImageDimensions = require('../../utils/image-dimensions');
const { escape, chunk, cloneDeep } = require('lodash');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;
const Amperize = require('amperize');
const sanitizeHtml = require('sanitize-html');
const i18next = require('../../i18n/config');

// Image dimension maps
const featureImageDimensions = {};
const authorImageDimensions = {};
const postImageDimensions = {};

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
      // Note: will need to modify this when we move Ghost instances
      if (image.src.includes(apiUrl) || image.src.match(/freecodecamp\.org.*\/news/)) {

        if (!postImageDimensions[image.src]) {
          const { width, height } = await getImageDimensions(image.src, title);

          postImageDimensions[image.src] = { width, height };
        }

        const { width, height } = postImageDimensions[image.src];
      
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

  // The jsdom parser wraps the incomplete HTML from the Ghost
  // API with HTML, head, and body elements, so return whatever
  // is within the new body element it added
  return dom.window.document.body.innerHTML;
}

const setAttributes = (source, target) => {
  const attributes = source.getAttributeNames();

  attributes.forEach(attr => {
    target.setAttribute(attr, source.getAttribute(attr));
  });

  return target;
}

const ampHandler = async (html) => {
  const dom = new JSDOM(html);
  const document = dom.window.document;
  const imageFigures = [...document.querySelectorAll('figure.kg-image-card')];
  // const iframes = [...document.querySelectorAll('figure.kg-embed-card iframe')];

  await Promise.all(
    imageFigures.map(async figure => {
      const image = figure.getElementsByTagName('img')[0];
      let ampImage = document.createElement('amp-img');
      
      ampImage = setAttributes(image, ampImage);

      // To do: set width and height

      image.replaceWith(ampImage);
    })
  );

  return dom.window.document.body.innerHTML;
}

// const allowedAMPTags = ['html', 'body', 'article', 'section', 'nav', 'aside', 'h1', 'h2',
//   'h3', 'h4', 'h5', 'h6', 'header', 'footer', 'address', 'p', 'hr',
//   'pre', 'blockquote', 'ol', 'ul', 'li', 'dl', 'dt', 'dd', 'figure',
//   'figcaption', 'div', 'main', 'a', 'em', 'strong', 'small', 's', 'cite',
//   'q', 'dfn', 'abbr', 'data', 'time', 'code', 'var', 'samp', 'kbd', 'sub',
//   'sup', 'i', 'b', 'u', 'mark', 'ruby', 'rb', 'rt', 'rtc', 'rp', 'bdi',
//   'bdo', 'span', 'br', 'wbr', 'ins', 'del', 'source', 'track', 'svg', 'g',
//   'path', 'glyph', 'glyphref', 'marker', 'view', 'circle', 'line', 'polygon',
//   'polyline', 'rect', 'text', 'textpath', 'tref', 'tspan', 'clippath',
//   'filter', 'lineargradient', 'radialgradient', 'mask', 'pattern', 'vkern',
//   'hkern', 'defs', 'stop', 'use', 'foreignobject', 'symbol', 'desc', 'title',
//   'table', 'caption', 'colgroup', 'col', 'tbody', 'thead', 'tfoot', 'tr', 'td',
//   'th', 'button', 'noscript', 'acronym', 'center', 'dir', 'hgroup', 'listing',
//   'multicol', 'nextid', 'nobr', 'spacer', 'strike', 'tt', 'xmp', 'amp-img',
//   'amp-video', 'amp-ad', 'amp-embed', 'amp-anim', 'amp-iframe', 'amp-youtube',
//   'amp-pixel', 'amp-audio', 'O:P'];

// const allowedAMPAttributes = {
//   '*': ['itemid', 'itemprop', 'itemref', 'itemscope', 'itemtype', 'accesskey', 'class', 'dir', 'draggable',
//       'id', 'lang', 'tabindex', 'title', 'translate', 'aria-*', 'role', 'placeholder', 'fallback', 'lightbox',
//       'overflow', 'amp-access', 'amp-access-*', 'i-amp-access-id', 'data-*'],
//   h1: ['align'],
//   h2: ['align'],
//   h3: ['align'],
//   h4: ['align'],
//   h5: ['align'],
//   h6: ['align'],
//   p: ['align'],
//   blockquote: ['align'],
//   ol: ['reversed', 'start', 'type'],
//   li: ['value'],
//   div: ['align'],
//   a: ['href', 'hreflang', 'rel', 'role', 'tabindex', 'target', 'download', 'media', 'type', 'border', 'name'],
//   time: ['datetime'],
//   bdo: ['dir'],
//   ins: ['datetime'],
//   del: ['datetime'],
//   source: ['src', 'srcset', 'sizes', 'media', 'type', 'kind', 'label', 'srclang'],
//   track: ['src', 'default', 'kind', 'label', 'srclang'],
//   svg: ['*'],
//   g: ['*'],
//   glyph: ['*'],
//   glyphref: ['*'],
//   marker: ['*'],
//   path: ['*'],
//   view: ['*'],
//   circle: ['*'],
//   line: ['*'],
//   polygon: ['*'],
//   polyline: ['*'],
//   rect: ['*'],
//   text: ['*'],
//   textpath: ['*'],
//   tref: ['*'],
//   tspan: ['*'],
//   clippath: ['*'],
//   filter: ['*'],
//   hkern: ['*'],
//   lineargradient: ['*'],
//   mask: ['*'],
//   pattern: ['*'],
//   radialgradient: ['*'],
//   stop: ['*'],
//   vkern: ['*'],
//   defs: ['*'],
//   symbol: ['*'],
//   use: ['*'],
//   foreignobject: ['*'],
//   desc: ['*'],
//   title: ['*'],
//   table: ['sortable', 'align', 'border', 'bgcolor', 'cellpadding', 'cellspacing', 'width'],
//   colgroup: ['span'],
//   col: ['span'],
//   tr: ['align', 'bgcolor', 'height', 'valign'],
//   td: ['align', 'bgcolor', 'height', 'valign', 'colspan', 'headers', 'rowspan'],
//   th: ['align', 'bgcolor', 'height', 'valign', 'colspan', 'headers', 'rowspan', 'abbr', 'scope', 'sorted'],
//   button: ['disabled', 'name', 'role', 'tabindex', 'type', 'value', 'formtarget'],
//   // built ins
//   'amp-img': ['media', 'noloading', 'alt', 'attribution', 'placeholder', 'src', 'srcset', 'width', 'height', 'layout'],
//   'amp-pixel': ['src'],
//   'amp-video': ['src', 'srcset', 'media', 'noloading', 'width', 'height', 'layout', 'alt', 'attribution',
//       'autoplay', 'controls', 'loop', 'muted', 'poster', 'preload'],
//   'amp-embed': ['media', 'noloading', 'width', 'height', 'layout', 'type', 'data-*', 'json'],
//   'amp-ad': ['media', 'noloading', 'width', 'height', 'layout', 'type', 'data-*', 'json'],
//   // extended components we support
//   'amp-anim': ['media', 'noloading', 'alt', 'attribution', 'placeholder', 'src', 'srcset', 'width', 'height', 'layout'],
//   'amp-audio': ['src', 'width', 'height', 'autoplay', 'loop', 'muted', 'controls'],
//   'amp-iframe': ['src', 'srcdoc', 'width', 'height', 'layout', 'frameborder', 'allowfullscreen', 'allowtransparency',
//       'sandbox', 'referrerpolicy'],
//   'amp-youtube': ['src', 'width', 'height', 'layout', 'frameborder', 'autoplay', 'loop', 'data-videoid', 'data-live-channelid']
// };

// const getAmpHtml = async (html) => {
//   const amperize = new Amperize();

//   return new Promise((resolve) => {
//     amperize.parse(html, (err, res) => {
//       if (err) {
//         console.log(err);
  
//         // Return original HTML
//         return resolve(html);
//       }

//       return resolve(res);
//     });
//   });
// }

// const ampHandler = async (html) => {
//   const ampHtml = await getAmpHtml(html);
//   // Further sanitization
//   const dom = new JSDOM(ampHtml);
//   const document = dom.window.document;
//   const videoEls = [...document.getElementsByTagName('video')];
//   const audioEls = [...document.getElementsByTagName('audio')];

//   await Promise.all(
//     videoEls.map(videoEl => {
//       const sourceEls = [...videoEl.getElementsByTagName('source')];

//       sourceEls.forEach(sourceEl => videoEl.removeChild(sourceEl));
//     }),

//     audioEls.map(audioEl => {
//       const sourceEls = [...audioEl.getElementsByTagName('source')];

//       sourceEls.forEach(sourceEl => audioEl.removeChild(sourceEl));
//     })
//   );

//   // // Return body of sanitized AMP HTML
//   // return dom.window.document.body.innerHTML;

//   const cleanHtml = sanitizeHtml(dom.window.document.body.innerHTML, {
//     allowedTags: allowedAMPTags,
//     allowedAttributes: allowedAMPAttributes,
//     selfClosing: ['source', 'track', 'br']
//   });

//   return cleanHtml;
// }


const fetchFromGhost = async (endpoint, options) => {
  let currPage = 1;
  let lastPage = 5;
  let data = [];

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

        // Short excerpt for RSS feed, etc.
        if (obj.excerpt) obj.short_excerpt = obj.excerpt.replace(/\n+/g, ' ')
          .split(' ')
          .slice(0, 50)
          .join(' ');

        // Handle AMP processing before modifying the original HTML
        if (obj.html) obj.amp_html = await ampHandler(obj.html);
        
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
  const limit = 100;
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

  const getCollectionFeeds = collection => cloneDeep(collection)
    .map(obj => {
      // The main feed shows the last 10 posts. Tag and author
      // pages show the last 15 posts
      const feedPostLimit = obj.path === '/' ? 10 : 15;
      const allPosts = obj.posts.flat();

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
