const { strapiApiUrl, strapiAccessToken } = require('../../config');
const qs = require('qs');

const wait = seconds => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(seconds);
    }, seconds * 1000);
  });
};

const fetchPosts = async () => {
  let currPage = 1;
  let lastPage = 5;
  let data = [];
  const options = {
    publicationState: 'live',
    populate: ['tags', 'author', 'feature_image', 'author.profile_image'],
    sort: ['publishedAt:desc'],
    pagination: {
      pageSize: 100
    }
  };

  while (currPage && currPage <= lastPage) {
    const strapiRes = await fetch(
      `${strapiApiUrl}/posts?${qs.stringify(
        {
          ...options,
          pagination: {
            ...options.pagination,
            page: currPage
          }
        },
        {
          encodeValuesOnly: true
        }
      )}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${strapiAccessToken}`
        }
      }
    ).catch(err => {
      console.error(err);
    });

    const strapiData = await strapiRes.json();
    lastPage = strapiData.meta.pagination.pageCount;
    if (strapiData.data.length > 0)
      console.log(`Fetched posts page ${currPage} of ${lastPage}...`);
    currPage += 1;

    data = data.concat(strapiData.data);

    await wait(0.2);
  }

  return data;
};

module.exports = fetchPosts;
