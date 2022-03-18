const { sourceApi } = require('./api');

const wait = seconds => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(seconds);
    }, seconds * 1000);
  });
};

const fetchFromGhost = async endpoint => {
  let currPage = 1;
  let lastPage = 5;
  let data = [];
  const options = {
    include: ['tags', 'authors'],
    filter: 'status:published',
    limit: 200
  };

  while (currPage && currPage <= lastPage) {
    const ghostRes = await sourceApi[endpoint]
      .browse({
        ...options,
        page: currPage
      })
      .catch(err => {
        console.error(err);
      });

    lastPage = ghostRes.meta.pagination.pages;
    console.log(`Fetched ${endpoint} page ${currPage} of ${lastPage}...`);
    currPage = ghostRes.meta.pagination.next;

    ghostRes.forEach(obj => data.push(obj));
    await wait(0.2);
  }

  return data;
};

module.exports = fetchFromGhost;
