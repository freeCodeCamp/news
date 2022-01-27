const cleanCSS = require("clean-css");

module.exports = (code) => {
  return new cleanCSS({}).minify(code).styles;
};
