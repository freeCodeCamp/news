const NodeCache = require('node-cache');

const cache = new NodeCache();

const getCache = key => cache.get(key);

const setCache = (key, data) => cache.set(key, data);

module.exports = {
  getCache,
  setCache
};
