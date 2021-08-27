const minifyHtml = require('@minify-html/js');

module.exports = (content, outputPath) => {
  if (outputPath && outputPath.endsWith('.html')) {
    try {
      const cfg = minifyHtml.createConfiguration({
        keep_closing_tags: true,
        keep_spaces_between_attributes: true
      });
      const minified = minifyHtml.minify(content, cfg);

      return minified;
    } catch (err) {
      console.log(err);
    }
  }

  return content;
}
