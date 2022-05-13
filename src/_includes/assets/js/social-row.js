document.addEventListener('DOMContentLoaded', () => {
  const tweetButton = document.getElementById('tweet-btn');
  const url = window.location;
  // Use Nunjucks URL encoding here in case titles have any special characters like backticks
  const title = '{{ post.title | urlencode }}'.replace(/&#39;/g, '%27');
  const twitterHandleOrName = {
    originalPostAuthor: '{{ post.original_post.primary_author.twitter }}'
      ? '{{ post.original_post.primary_author.twitter }}'
      : '{{ post.original_post.primary_author.name }}',
    currentPostAuthor: '{{ post.primary_author.twitter }}' // Author or translator depending on context
      ? '{{ post.primary_author.twitter }}'
      : '{{ post.primary_author.name }}'
  };
  const isTranslation = Boolean('{{ post.original_post }}');
  let thanks;

  if (isTranslation) {
    thanks = encodeURIComponent(`{% t 'social-row.tweets.translation', {
      author: '${twitterHandleOrName.originalPostAuthor}',
      translator: '${twitterHandleOrName.currentPostAuthor}'
    } %}`);
  } else {
    thanks = encodeURIComponent(`{% t 'social-row.tweets.default', {
      author: '${twitterHandleOrName.currentPostAuthor}'
    } %}`);
  }

  const twitterIntentStr = `https://twitter.com/intent/tweet?text=${thanks}%0A%0A${title}%0A%0A${url}`;
  const windowOpenStr = `window.open(
    '${twitterIntentStr}',
    'share-twitter',
    'width=550, height=235'
  ); return false;`;

  tweetButton.setAttribute('onclick', windowOpenStr);
});
