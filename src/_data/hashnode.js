const { chunk } = require('lodash');
const Piscina = require('piscina');
const { resolve } = require('path');

const fetchFromHashnode = require('../../utils/hashnode/fetch-from-hashnode');

const piscina = new Piscina({
  filename: resolve(__dirname, '../../utils/hashnode/process-batch')
});

module.exports = async () => {
  const batchSize = 5;
  const allPosts = await fetchFromHashnode();

  const posts = await Promise.all(
    chunk(allPosts, batchSize).map((batch, i, arr) =>
      piscina.run({
        batch,
        currBatchNo: Number(i) + 1,
        totalBatches: arr.length
      })
    )
  )
    .then(arr => {
      console.log('Finished processing all posts');
      return arr.flat();
    })
    .catch(err => console.error(err));

  console.log(posts);
  return {
    posts
  };
};
