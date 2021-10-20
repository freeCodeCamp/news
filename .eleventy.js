require('dotenv').config();

const cssMin = require('./utils/transforms/css-min');
const jsMin = require('./utils/transforms/js-min');
const { readFileSync, readdirSync, writeFileSync, mkdirSync } = require('fs');
const { parse } = require('path');
const pluginRSS = require('@11ty/eleventy-plugin-rss');
const i18next = require('./i18n/config');
const dayjs = require('./utils/dayjs');
const { sourceApiUrl } = require('./utils/ghost/api');
const { escape } = require('lodash');
const fetch = require('node-fetch');
const xml2js = require('xml2js');
const md5 = require('md5');
let manifest = {};

module.exports = function (config) {
  // Minify inline CSS
  config.addFilter('cssMin', cssMin);

  // Minify inline JS
  config.addNunjucksAsyncFilter('jsMin', jsMin);

  // Empty manifest to load new versions of cached files
  // for hot reloading
  config.on('beforeBuild', () => {
    manifest = {};
  });

  // Minify CSS
  config.on('afterBuild', () => {
    const path = './dist/assets/css';
    const cssFiles = readdirSync(path);

    cssFiles.forEach((filename) => {
      const fullPath = `${path}/${filename}`;
      const content = readFileSync(fullPath);

      writeFileSync(fullPath, cssMin(content));
    });
  });

  // RSS and AMP plugins
  config.addPlugin(pluginRSS);

  // Note: Update this and image shortcodes once we
  // sync all Ghost images to an S3 bucket
  const ghostImageRe = /\/content\/images\/\d+\/\d+\//g;

  // Handle images from Ghost and from third-parties
  function imageShortcode(src, cls, alt, sizes, widths, index) {
    const imageUrls = src.match(ghostImageRe)
      ? widths.map((width) =>
          src.replace('/content/images/', `/content/images/size/w${width}/`)
        )
      : [src];

    return `
      <img
        ${index === 0 ? `rel="preload" as="image"` : ''}
        ${cls.includes('lazyload') && index > 0 ? 'data-srcset' : 'srcset'}="${
      imageUrls.length === widths.length
        ? widths.map((width, i) => `${imageUrls[i]} ${width}w`).join()
        : imageUrls[0]
    }"
        sizes="${sizes.replace(/\s+/g, ' ').trim()}"
        ${cls.includes('lazyload') && index > 0 ? 'data-src' : 'src'}="${
      imageUrls[imageUrls.length - 1]
    }"
        class="${index === 0 ? cls.replace('lazyload', '') : cls}"
        alt="${alt}"
        onerror="this.style.display='none'"
      />
    `;
  }

  config.addNunjucksShortcode('image', imageShortcode);

  // Copy images over from Ghost
  function featureImageShortcode(src, alt, sizes, widths) {
    const imageUrls = src.match(ghostImageRe)
      ? widths.map((width) =>
          src.replace('/content/images/', `/content/images/size/w${width}/`)
        )
      : [src];

    return `
      <picture>
        <source
          media="(max-width: 700px)"
          sizes="1px"
          srcset="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7 1w"
        />
        <source 
          media="(min-width: 701px)"
          sizes="${sizes.replace(/\s+/g, ' ').trim()}"
          srcset="${
            imageUrls.length === widths.length
              ? widths.map((width, i) => `${imageUrls[i]} ${width}w`).join()
              : imageUrls[0]
          }"
        />
        <img
          onerror="this.style.display='none'"
          src="${imageUrls[imageUrls.length - 1]}"
          alt="${alt}"
        >
      </picture>
    `;
  }

  config.addNunjucksShortcode('featureImage', featureImageShortcode);

  function cacheBusterShortcode(filePath) {
    // Handle cases where filePath doesn't start with /
    filePath = filePath.startsWith('/') ? filePath : `/${filePath}`;
    const { dir, base, name, ext } = parse(filePath);
    const localFilePath = `./src/_includes${filePath}`;

    if (!manifest[base]) {
      // Create the final directory if it doesn't already exist
      const finalBasePath = `./dist${dir}`;
      mkdirSync(finalBasePath, { recursive: true });

      // Generate 10 char MD5 hash of file content
      // of original filenames --> hashed equivalents
      const content = readFileSync(localFilePath);
      const hash = md5(content).slice(0, 10);
      const hashedFilename = `${name}-${hash}${ext}`;

      // Write hashed version of file and save to manifest
      writeFileSync(`${finalBasePath}/${hashedFilename}`, content);
      manifest[base] = hashedFilename;
    }

    // Return path with hashed filename to template
    return filePath.replace(base, manifest[base]);
  }

  config.addNunjucksShortcode('cacheBuster', cacheBusterShortcode);

  // Date and time shortcodes
  function publishedDateShortcode(dateStr) {
    return dayjs(dateStr).format('LL');
  }

  config.addNunjucksShortcode('publishedDate', publishedDateShortcode);

  function timeAgoShortcode(dateStr) {
    return dayjs().to(dayjs(dateStr));
  }

  config.addNunjucksShortcode('timeAgo', timeAgoShortcode);

  function translateShortcode(key, data) {
    return i18next.t(key, { ...data });
  }

  config.addNunjucksShortcode('t', translateShortcode);

  // Date formatting filter
  config.addFilter('htmlDateString', (dateObj) => {
    return new Date(dateObj).toISOString().split('T')[0];
  });

  // Format dates for RSS feed
  const buildDateFormatterShortcode = (timezone, dateStr) => {
    const dateObj = dateStr ? new Date(dateStr) : new Date();
    return dayjs(dateObj)
      .tz(timezone)
      .locale('en')
      .format('ddd, DD MMM YYYY HH:mm:ss ZZ');
  };

  config.addNunjucksShortcode(
    'buildDateFormatter',
    buildDateFormatterShortcode
  );

  const fullYearShortcode = () =>  dayjs(new Date).format('YYYY');

  config.addNunjucksShortcode('fullYear', fullYearShortcode);

  config.addFilter('commentsEnabled', (tagsArr) => {
    return !tagsArr.map((tag) => tag.name).includes('#disable-comments');
  });

  // This counts on all images, including the site logo, being stored like on Ghost with the
  // same directory structure
  const domainReplacer = (url) => url.replace(sourceApiUrl, process.env.SITE_URL);

  // Mimic Ghost/Handlebars escaping
  // raw: & < > " ' ` =
  // html-escaped: &amp; &lt; &gt; &quot; &#x27; &#x60; &#x3D;
  const fullEscaper = (s) =>
    escape(s)
      .replace(/&#39;/g, '&#x27;')
      .replace(/`/g, '&#x60;')
      .replace(/=/g, '&#x3D;');

  config.addNunjucksShortcode('fullEscaper', fullEscaper);

  async function createJsonLdShortcode(type, site, data) {
    // Main site settings from site object
    const { logo, cover_image, image_dimensions } = site;
    const url = `${site.url}/`;
    const typeMap = {
      index: 'WebSite',
      article: 'Article',
      author: 'Person',
      tag: 'Series',
    };
    const baseData = {
      '@context': 'https://schema.org',
      '@type': typeMap[type],
      publisher: {
        '@type': 'Organization',
        name: 'freeCodeCamp.org',
        url: url,
        logo: {
          '@type': 'ImageObject',
          url: domainReplacer(logo),
          width: image_dimensions.logo.width,
          height: image_dimensions.logo.height,
        },
      },
      image: {
        '@type': 'ImageObject',
        url: domainReplacer(cover_image),
        width: image_dimensions.cover_image.width,
        height: image_dimensions.cover_image.height,
      },
      url: url,
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': url,
      },
    };
    const returnData = { ...baseData };

    const createImageObj = (url, obj) => {
      let { width, height } = obj;

      return {
        '@type': 'ImageObject',
        url,
        width,
        height,
      };
    };

    // Conditionally set other properties based on
    // objects passed to shortcodes
    const createAuthorObj = (primaryAuthor) => {
      const {
        name,
        profile_image,
        image_dimensions,
        website,
        twitter,
        facebook,
      } = primaryAuthor;
      const authorObj = {
        '@type': 'Person',
        name,
        url: domainReplacer(url), // check again later when using slugs throughout template and leaving URLs untouched
        sameAs: [
          website ? fullEscaper(website) : null,
          facebook ? `https://www.facebook.com/${facebook}` : null,
          twitter ? twitter.replace('@', 'https://twitter.com/') : null,
        ].filter((url) => url),
      };

      if (profile_image) {
        authorObj.image = createImageObj(
          profile_image,
          image_dimensions.profile_image
        );
      }

      return authorObj;
    };

    if (type === 'index')
      returnData.description = translateShortcode('meta:description');

    if (type !== 'index' && data) {
      // Remove first slash from path
      if (data.path) returnData.url += data.path.substring(1);

      if (data.description)
        returnData.description = fullEscaper(data.description);

      if (type === 'article') {
        if (data.published_at)
          returnData.datePublished = new Date(data.published_at).toISOString();
        if (data.updated_at)
          returnData.dateModified = new Date(data.updated_at).toISOString();
        if (data.tags && data.tags.length > 1) {
          // Filter out internal Ghost tags
          const keywords = data.tags
            .map((tag) => tag.name)
            .filter((keyword) => !keyword.startsWith('#'));

          returnData.keywords = keywords.length === 1 ? keywords[0] : keywords;
        }
        if (data.excerpt) returnData.description = fullEscaper(data.excerpt);
        if (data.title) returnData.headline = fullEscaper(data.title);

        if (data.feature_image) {
          returnData.image = await createImageObj(
            data.feature_image,
            data.image_dimensions.feature_image
          );
        }

        returnData.author = await createAuthorObj(data.primary_author);
      }

      // Handle images for both types
      if (type === 'tag' || type === 'author') {
        if (data.cover_image) {
          returnData.image = createImageObj(
            data.cover_image,
            data.image_dimensions.cover_image
          );
        } else if (data.feature_image) {
          returnData.image = createImageObj(
            data.feature_image,
            data.image_dimensions.feature_image
          );
        } else {
          delete returnData.image;
        }
      }

      if (type === 'tag') {
        if (data.cover_image)
          returnData.image = createImageObj(
            data.cover_image,
            data.image_dimensions.cover_image
          );
        returnData.name = data.name;
      }

      if (type === 'author') {
        // This schema type is the only one without publisher info
        delete returnData.publisher;
        const authorObj = await createAuthorObj(data);

        returnData.sameAs = authorObj.sameAs;
        returnData.name = fullEscaper(authorObj.name);
      }
    }

    return JSON.stringify(returnData, null, '\t'); // Pretty print for testing
    // return JSON.stringify(returnData);
  }

  config.addNunjucksAsyncShortcode('createJsonLd', createJsonLdShortcode);

  const sitemapFetcherShortcode = async (page) => {
    // will need some sort of map to handle all locales
    const url =
      page === 'index'
        ? `${sourceApiUrl}/sitemap.xml`
        : `${sourceApiUrl}/sitemap-${page}.xml`;

    const ghostXml = await fetch(url)
      .then((res) => res.text())
      .then((res) => res)
      .catch((err) => console.log(err));

    const parser = new xml2js.Parser();
    const ghostXmlObj = await parser
      .parseStringPromise(ghostXml)
      .then((res) => res)
      .catch((err) => console.log(err));

    const target =
      page === 'index'
        ? ghostXmlObj.sitemapindex.sitemap
        : ghostXmlObj.urlset.url;

    const urlSwapper = (url) => url.replace(sourceApiUrl, process.env.SITE_URL);

    let xmlStr = target.reduce((acc, curr) => {
      const wrapper = page === 'index' ? 'sitemap' : 'url';

      acc += `
        <${wrapper}>
        <loc>${urlSwapper(curr.loc[0])}</loc>
        <lastmod>${curr.lastmod[0]}</lastmod>
        ${
          curr['image:image']
            ? `
          <image:image>
            <image:loc>${escape(
              urlSwapper(curr['image:image'][0]['image:loc'][0])
            )}</image:loc>
            <image:caption>${escape(
              curr['image:image'][0]['image:caption'][0]
            )}</image:caption>
          </image:image>`
            : ''
        }
      </${wrapper}>`;

      return acc;
    }, '');

    // xmlStr = xmlStr.replace(/\s+/g, '');

    // To do: minify xml after build
    return xmlStr;
  };

  config.addNunjucksAsyncShortcode('sitemapFetcher', sitemapFetcherShortcode);

  // Don't ignore the same files ignored in the git repo
  config.setUseGitIgnore(false);

  // Display 404 and RSS pages in BrowserSync
  config.setBrowserSyncConfig({
    callbacks: {
      ready: (err, bs) => {
        const content_404 = readFileSync('dist/404.html');
        const content_RSS = readFileSync('dist/rss.xml');

        bs.addMiddleware('*', (req, res) => {
          if (req.url.match(/^\/rss\/?$/)) {
            res.writeHead(302, { 'Content-Type': 'text/xml; charset=UTF-8' });

            // Provides the RSS feed content without redirect
            res.write(content_RSS);
            res.end();
          } else {
            res.writeHead(404, { 'Content-Type': 'text/html; charset=UTF-8' });

            // Provides the 404 content without redirect
            res.write(content_404);
            res.end();
          }
        });
      },
    },
  });

  // Eleventy configuration
  return {
    dir: {
      input: 'src',
      output: 'dist',
    },

    // Files read by Eleventy, add as needed
    templateFormats: ['css', 'njk'],
    htmlTemplateEngine: 'njk',
    markdownTemplateEngine: 'njk',
  };
};
