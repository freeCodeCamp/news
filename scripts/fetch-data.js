import { fetchFromHashnode } from '../utils/hashnode/fetch-from-hashnode.js';
import { fetchFromGhost } from '../utils/ghost/fetch-from-ghost.js';

try {
  console.log('Downloading trending data...');
  await import('../tools/download-trending.js');
  console.log('Trending data downloaded.');

  console.log('Fetching data from Hashnode and Ghost...');

  const hashnodePosts = await fetchFromHashnode('posts');
  const hashnodePages = await fetchFromHashnode('pages');
  const ghostPosts = await fetchFromGhost('posts');
  const ghostPages = await fetchFromGhost('pages');

  console.log(
    [
      'Fetch summary:',
      `  Hashnode posts: ${hashnodePosts.length}`,
      `  Hashnode pages: ${hashnodePages.length}`,
      `  Ghost posts:    ${ghostPosts.length}`,
      `  Ghost pages:    ${ghostPages.length}`
    ].join('\n')
  );
} catch (err) {
  console.error('fetch-data failed:', err);
  process.exit(1);
}
