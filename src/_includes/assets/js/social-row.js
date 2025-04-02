document.addEventListener('DOMContentLoaded', () => {
  const shareButton = document.getElementById('tweet-btn');
  const url = window.location;
  // Use Nunjucks URL encoding here in case titles have any special characters like backticks
  const title = '{{ post.title | urlencode }}'.replace(/&#39;/g, '%27');
  const blueskyHandles = {
    originalPostAuthor:
      '{{ post.original_post.primary_author.bluesky_handle }}',
    currentPostAuthor: '{{ post.primary_author.bluesky_handle }}' // Author or translator depending on context
  };
  const isTranslation = Boolean('{{ post.original_post }}');
  let thanks;

  // Customize the tweet message only in cases where the (original post) author
  // or translator has a Bluesky handle
  if (
    isTranslation &&
    (blueskyHandles.originalPostAuthor || blueskyHandles.currentPostAuthor)
  ) {
    const names = {
      originalPostAuthor: '{{ post.original_post.primary_author.name }}',
      currentPostAuthor: '{{ post.primary_author.name }}'
    };

    // Use either a Bluesky handle or name in the post text
    thanks = encodeURIComponent(`{% t 'social-row.tweets.translation', {
      author: '${
        blueskyHandles.originalPostAuthor
          ? blueskyHandles.originalPostAuthor
          : names.originalPostAuthor
      }',
      translator: '${
        blueskyHandles.currentPostAuthor
          ? blueskyHandles.currentPostAuthor
          : names.currentPostAuthor
      }'
    } %}`);
  } else if (!isTranslation && blueskyHandles.currentPostAuthor) {
    // An original post on a source Ghost instance
    // Only customize the post text if the author has an Bluesky handle
    thanks = encodeURIComponent(`{% t 'social-row.tweets.default', {
      author: '${blueskyHandles.currentPostAuthor}'
    } %}`);
  }

  const blueSkyIntentStr = thanks
    ? `https://bsky.app/intent/compose?text=${thanks}%0A%0A${title}%0A%0A${url}`
    : `https://bsky.app/intent/compose?text=${title}%0A%0A${url}`;

  const windowOpenStr = `window.open(
    '${blueSkyIntentStr}',
    'share-bluesky',
    'width=550, height=235'
  ); return false;`;

  shareButton.setAttribute('onclick', windowOpenStr);
});
