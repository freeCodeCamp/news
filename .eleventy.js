import gracefulFS from 'graceful-fs';
import { EleventyHtmlBasePlugin } from '@11ty/eleventy';
import pluginRSS from '@11ty/eleventy-plugin-rss';

import UpgradeHelper from '@11ty/eleventy-upgrade-help';

import cssMin from './utils/transforms/css-min.js';
import jsMin from './utils/transforms/js-min.js';
import { fullEscaper } from './utils/full-escaper.js';
import { translate } from './utils/translate.js';
import {
  imageShortcode,
  featureImageShortcode
} from './utils/shortcodes/images.js';
import { cacheBusterShortcode } from './utils/shortcodes/cache-buster.js';
import { createJSONLDShortcode } from './utils/shortcodes/create-json-ld.js';
import {
  publishedDateShortcode,
  timeAgoShortcode,
  buildDateFormatterShortcode,
  fullYearShortcode,
  toISOStringShortcode
} from './utils/shortcodes/dates.js';
import { sitePath } from './utils/site-path.js';
import { config } from './config/index.js';

const { readFileSync, readdirSync, writeFileSync } = gracefulFS;
const { currentLocale_i18n, eleventyEnv } = config;

export default function (config) {
  // Minify inline CSS
  config.addFilter('cssMin', cssMin);

  // Minify inline JS
  config.addNunjucksAsyncFilter('jsMin', jsMin);

  // // Empty manifest to load new versions of cached files
  // // for hot reloading
  // config.on('beforeBuild', () => {
  //   manifest = {};
  // });

  config.on('afterBuild', () => {
    // Minify CSS
    const cssDir = './dist/assets/css';
    const cssFiles = readdirSync(cssDir);

    cssFiles.forEach(filename => {
      const fullPath = `${cssDir}/${filename}`;
      const content = readFileSync(fullPath);

      writeFileSync(fullPath, cssMin(content));
    });

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

  config.addPlugin(pluginRSS);

  config.addPlugin(UpgradeHelper);

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

  // Check if the canonical URL should have Google Ad Manager
  config.addFilter('shouldCanonicalHaveGAM', canonical => {
    // Don't add Google Ad Manager to localhost
    if (!canonical || canonical.startsWith('http://localhost:')) {
      return false;
    }
    return true;
  });

  // Don't ignore the same files ignored in the git repo
  config.setUseGitIgnore(false);

  if (eleventyEnv === 'ci') {
    config.addPassthroughCopy({
      './cypress/fixtures/mock-search-hits.json':
        './assets/mock-search-hits.json'
    });
  }

  // Use the new Base plugin to replace the old url filter method
  // so we can deploy in a different directory
  config.addPlugin(EleventyHtmlBasePlugin, {
    baseHref: sitePath
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
}
