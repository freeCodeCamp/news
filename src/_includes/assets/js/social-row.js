document.addEventListener('DOMContentLoaded', () => {
  const tweetButton = document.getElementById('tweet-btn');
  const url = window.location;
  // Use Nunjucks URL encoding here in case titles have any special characters like backticks
  const title = '{{ post.title | urlencode }}'.replace(/&#39;/g, '%27');
  const twitterHandles = {
    originalPostAuthor: '{{ post.original_post.primary_author.twitterHandle }}',
    currentPostAuthor: '{{ post.primary_author.twitterHandle }}' // Author or translator depending on context
  };
  const isTranslation = Boolean('{{ post.original_post }}');
  let thanks;

  // Customize the tweet message only in cases where the (original post) author
  // or translator has a Twitter handle
  if (
    isTranslation &&
    (twitterHandles.originalPostAuthor || twitterHandles.currentPostAuthor)
  ) {
    const names = {
      originalPostAuthor: '{{ post.original_post.primary_author.name }}',
      currentPostAuthor: '{{ post.primary_author.name }}'
    };

    // Use either an X /Twitter handle or name in the post text
    thanks = encodeURIComponent(`{% t 'social-row.tweets.translation', {
      author: '${
        twitterHandles.originalPostAuthor
          ? twitterHandles.originalPostAuthor
          : names.originalPostAuthor
      }',
      translator: '${
        twitterHandles.currentPostAuthor
          ? twitterHandles.currentPostAuthor
          : names.currentPostAuthor
      }'
    } %}`);
  } else if (!isTranslation && twitterHandles.currentPostAuthor) {
    // An original post on a source Ghost instance
    // Only customize the post text if the author has an X / Twitter handle
    thanks = encodeURIComponent(`{% t 'social-row.tweets.default', {
      author: '${twitterHandles.currentPostAuthor}'
    } %}`);
  }

  const twitterIntentStr = thanks
    ? `https://x.com/intent/post?text=${thanks}%0A%0A${title}%0A%0A${url}`
    : `https://x.com/intent/post?text=${title}%0A%0A${url}`;

  const windowOpenStr = `window.open(
    '${twitterIntentStr}',
    'share-twitter',
    'width=550, height=235'
  ); return false;`;

  tweetButton.setAttribute('onclick', windowOpenStr);
});
