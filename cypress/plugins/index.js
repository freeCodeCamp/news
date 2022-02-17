const { postsPerPage } = require('../../config');

module.exports = (on, config) => {
  config.env.postsPerPage = postsPerPage;

  return config;
};
