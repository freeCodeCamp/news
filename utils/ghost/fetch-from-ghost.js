import { ghostAPI } from '../api.js';
import { wait } from '../wait.js';
import { annotate } from '../gh-annotations.js';
import { withNetworkRetry } from '../retry-network.js';
import { config } from '../../config/index.js';

const SOURCE_FILE = 'utils/ghost/fetch-from-ghost.js';
const GHOST_TARGET = `the ${config.currentLocale_ghost} Ghost content API`;

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

  while (currPage && currPage <= lastPage) {
    const ghostRes = await withNetworkRetry(
      () =>
        ghostAPI[endpoint].browse({
          ...options,
          page: currPage
        }),
      {
        label: `Ghost ${endpoint} fetch`,
        target:
          currPage === 1
            ? `page ${currPage} from ${GHOST_TARGET}`
            : `page ${currPage} of ${lastPage} from ${GHOST_TARGET}`,
        file: SOURCE_FILE
      }
    );

    if (!Array.isArray(ghostRes) || !ghostRes.meta?.pagination) {
      const summary = `Ghost ${endpoint} fetch returned no usable pagination on page ${currPage} from ${GHOST_TARGET}. The request itself succeeded, so check the content API version and any proxy that may rewrite the response body.`;

      annotate({
        level: 'error',
        title: `Ghost ${endpoint} fetch returned no data`,
        file: SOURCE_FILE,
        message: summary
      });

      throw new Error(summary);
    }

    lastPage = ghostRes.meta.pagination.pages;
    if (ghostRes.length > 0)
      console.log(
        `Fetched Ghost ${endpoint} page ${currPage} of ${lastPage}...and using ${process.memoryUsage.rss() / 1024 / 1024} MB of memory`
      );
    currPage = ghostRes.meta.pagination.next;

    ghostRes.forEach(obj => data.push(obj));
    await wait(200);
  }

  return data;
};
