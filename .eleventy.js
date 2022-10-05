const {
  readFileSync,
  readdirSync,
  writeFileSync,
  unlinkSync
} = require('graceful-fs');
const pluginRSS = require('@11ty/eleventy-plugin-rss');
const UpgradeHelper = require('@11ty/eleventy-upgrade-help');

const cssMin = require('./utils/transforms/css-min');
const jsMin = require('./utils/transforms/js-min');
const fullEscaper = require('./utils/full-escaper');
const translate = require('./utils/translate');
const {
  imageShortcode,
  featureImageShortcode
} = require('./utils/shortcodes/images');
const cacheBusterShortcode = require('./utils/shortcodes/cache-buster');
const createJSONLDShortcode = require('./utils/shortcodes/create-json-ld');
const {
  publishedDateShortcode,
  timeAgoShortcode,
  buildDateFormatterShortcode,
  fullYearShortcode,
  toISOStringShortcode
} = require('./utils/shortcodes/dates');
const { currentLocale_i18n, eleventyEnv } = require('./config');
const sitePath = require('./utils/site-path');

module.exports = function (config) {
  config.addPlugin(UpgradeHelper);

  // Minify inline CSS
  config.addFilter('cssMin', cssMin);

  // Minify inline JS
  config.addNunjucksAsyncFilter('jsMin', jsMin);

  // Empty manifest to load new versions of cached files
  // for hot reloading
  config.on('beforeBuild', () => {
    manifest = {};
  });

  config.on('afterBuild', () => {
    // Minify CSS
    const cssDir = './dist/assets/css';
    const cssFiles = readdirSync(cssDir);

    cssFiles.forEach(filename => {
      const fullPath = `${cssDir}/${filename}`;
      const content = readFileSync(fullPath);

      writeFileSync(fullPath, cssMin(content));
    });

    // Remove ads.txt from Chinese build
    if (currentLocale_i18n === 'chinese') unlinkSync('./dist/ads.txt');

    // Write translated locales for the current build language to the assets directory
    // as a workaround to display those strings in search-results.js instead of with the
    // translation shortcode
    const currLocaleTranslationsPath = `./config/i18n/locales/${currentLocale_i18n}/translations.json`;
    const translationsObj = JSON.parse(
      readFileSync(currLocaleTranslationsPath, { encoding: 'utf-8' })
    );
    const translatedLocales =
      translationsObj['original-author-translator'].locales;

    writeFileSync(
      './dist/assets/translated-locales.json',
      JSON.stringify(translatedLocales)
    );
  });

  // RSS and AMP plugins
  config.addPlugin(pluginRSS);

  config.addNunjucksShortcode('image', imageShortcode);

  config.addNunjucksShortcode('featureImage', featureImageShortcode);

  config.addNunjucksShortcode('cacheBuster', cacheBusterShortcode);

  config.addNunjucksShortcode('t', translate);

  config.addNunjucksShortcode('fullEscaper', fullEscaper);

  config.addNunjucksAsyncShortcode('createJSONLD', createJSONLDShortcode);

  // Date and time shortcodes and filters
  config.addNunjucksShortcode('publishedDate', publishedDateShortcode);

  config.addNunjucksShortcode('timeAgo', timeAgoShortcode);

  config.addNunjucksShortcode(
    'buildDateFormatter',
    buildDateFormatterShortcode
  );

  config.addNunjucksShortcode('fullYear', fullYearShortcode);

  config.addNunjucksShortcode('toISOString', toISOStringShortcode);

  // Check for next page before showing 'Load More Articles' button
  config.addFilter('nextPageExists', href => {
    const nextPageRegExp = /\/\d+\/$/g;
    return nextPageRegExp.test(href);
  });

  // Don't ignore the same files ignored in the git repo
  config.setUseGitIgnore(false);

  if (eleventyEnv === 'ci') {
    config.addPassthroughCopy({
      './cypress/fixtures/mock-search-hits.json':
        './assets/mock-search-hits.json'
    });
  }

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
      startPath: sitePath
    }
  });

  // Eleventy configuration
  return {
    dir: {
      input: 'src',
      output: 'dist'
    },

    // Files read by Eleventy, add as needed
    templateFormats: ['css', 'njk'],
    htmlTemplateEngine: 'njk',
    markdownTemplateEngine: 'njk',
    pathPrefix: sitePath
  };
};
