import { resolve } from 'path';
import { ghostAPI } from '../api.js';
import { readCache, writeCache } from '../disk-cache.js';
import { wait } from '../wait.js';

const CACHE_TTL = 12 * 60 * 60 * 1000;

export const fetchFromGhost = async endpoint => {
  let currPage = 1;
  let lastPage = 5;
  let data = [];
  const options = {
    include: ['tags', 'authors'],
    filter: 'status:published',
    limit: 200
  };

  if (process.env.DO_NOT_FETCH_FROM_GHOST) {
    console.log(
      'DO_NOT_FETCH_FROM_GHOST is active. This is likely because Ghost is not available for this environment.'
    );
    return [];
  }

  const cacheFilePath = resolve(
    import.meta.dirname,
    '../../.cache',
    `ghost-${endpoint}.json`
  );
  const cached = readCache(cacheFilePath, CACHE_TTL);
  if (cached) {
    console.log(`Using cached Ghost ${endpoint} data`);
    return cached;
  }

  while (currPage && currPage <= lastPage) {
    const ghostRes = await ghostAPI[endpoint]
      .browse({
        ...options,
        page: currPage
      })
      .catch(err => {
        console.error(err);
      });

    lastPage = ghostRes.meta.pagination.pages;
    if (ghostRes.length > 0)
      console.log(
        `Fetched Ghost ${endpoint} page ${currPage} of ${lastPage}...and using ${process.memoryUsage.rss() / 1024 / 1024} MB of memory`
      );
    currPage = ghostRes.meta.pagination.next;

    ghostRes.forEach(obj => data.push(obj));
    await wait(200);
  }

  if (data.length > 0) {
    writeCache(cacheFilePath, data);
  }

  return data;
};
