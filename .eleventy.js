const { readFileSync, readdirSync, writeFileSync } = require('fs');
const pluginRSS = require('@11ty/eleventy-plugin-rss');
const cssMin = require('./utils/transforms/css-min');
const jsMin = require('./utils/transforms/js-min');
const fullEscaper = require('./utils/full-escaper');
const translate = require('./utils/translate');
const { imageShortcode, featureImageShortcode } = require('./utils/shortcodes/images');
const cacheBusterShortcode = require('./utils/shortcodes/cache-buster');
const sitemapFetcherShortcode = require('./utils/shortcodes/sitemap-fetcher');
const createJsonLdShortcode = require('./utils/shortcodes/create-json-ld');
const {
  publishedDateShortcode,
  timeAgoShortcode,
  buildDateFormatterShortcode,
  fullYearShortcode
} = require('./utils/shortcodes/dates');
const sitePath = require('./utils/site-path');

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

  config.addNunjucksShortcode('image', imageShortcode);

  config.addNunjucksShortcode('featureImage', featureImageShortcode);

  config.addNunjucksShortcode('cacheBuster', cacheBusterShortcode);

  config.addNunjucksShortcode('t', translate);

  config.addNunjucksShortcode('fullEscaper', fullEscaper);

  config.addNunjucksAsyncShortcode('createJsonLd', createJsonLdShortcode);

  config.addNunjucksAsyncShortcode('sitemapFetcher', sitemapFetcherShortcode);

  // Date and time shortcodes and filters
  config.addNunjucksShortcode('publishedDate', publishedDateShortcode);

  config.addNunjucksShortcode('timeAgo', timeAgoShortcode);

  config.addNunjucksShortcode(
    'buildDateFormatter',
    buildDateFormatterShortcode
  );

  config.addNunjucksShortcode('fullYear', fullYearShortcode);

  config.addFilter('htmlDateString', (dateObj) => {
    return new Date(dateObj).toISOString().split('T')[0];
  });

  // Selectively show comments section
  config.addFilter('commentsEnabled', (tagsArr) => {
    return !tagsArr.map((tag) => tag.name).includes('#disable-comments');
  });

  // Check for next page before showing 'Load More Articles' button
  config.addFilter('nextPageExists', (href) => {
    const nextPageRegExp = /\/\d+\/$/g;
    return nextPageRegExp.test(href);
  })

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
      startPath: sitePath,
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
    pathPrefix: sitePath
  };
};
