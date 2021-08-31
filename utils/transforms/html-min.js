// const minifyHtml = require('@minify-html/js');

// module.exports = (content, outputPath) => {
//  // Eleventy 1.0+: use this.inputPath and this.outputPath instead
//   if (outputPath && outputPath.endsWith('.html')) {
//     try {
//       const cfg = minifyHtml.createConfiguration({
//         keep_closing_tags: true,
//         keep_spaces_between_attributes: true
//       });
//       const minified = minifyHtml.minify(content, cfg);

//       return minified;
//     } catch (err) {
//       console.log(err);
//     }
//   }

//   return content;
// }

const htmlmin = require('html-minifier');

module.exports = (content, outputPath) => {
  // Eleventy 1.0+: use this.inputPath and this.outputPath instead
  if (outputPath && outputPath.endsWith('.html')) {
    try {
      const minified = htmlmin.minify(content, {
        useShortDoctype: true,
        removeComments: true,
        collapseWhitespace: true,
        minifyCSS: true
      });

      return minified;
    } catch (err) {
      console.log(err);
    }
  }

  return content;
};
