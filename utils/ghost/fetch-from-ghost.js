const { sourceApi } = require('./api');
const processGhostResponse = require('./process-ghost-response');

const wait = seconds => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(seconds);
    }, seconds * 1000);
  });
};

const fetchFromGhost = async (endpoint, options) => {
  let currPage = 1;
  let lastPage = 5;
  let data = [];

  while (currPage && currPage <= lastPage) {
    const ghostRes = await sourceApi[endpoint].browse({
      ...options,
      page: currPage
    })
    .catch(err => {
      console.error(err);
    });

    lastPage = ghostRes.meta.pagination.pages;
    console.log(`Fetched ${endpoint} page ${currPage} of ${lastPage}...`);
    currPage = ghostRes.meta.pagination.next;

    const resolvedData = await processGhostResponse(ghostRes, endpoint);
    resolvedData.forEach(post => data.push(post));

    await wait(0.1);
  }

  return data;
};

module.exports = fetchFromGhost;
