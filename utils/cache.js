import NodeCache from 'node-cache';

const cache = new NodeCache();

export const getCache = key => cache.get(key);

export const setCache = (key, data) => cache.set(key, data);
