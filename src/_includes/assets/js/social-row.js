document.addEventListener("DOMContentLoaded", () => {
  const title = "{{ post.title | urlencode }}".replace(/&#39;/g, "%27");
  const twitter = "{{ post.primary_author.twitter }}";
  const url = window.location;
  const escapedDefaultTweet =
    "{% set defaultTweet %}{% t 'social-row.default-tweet', { twitter: post.primary_author.twitter } %}{% endset %}{{ defaultTweet | urlencode }}";
  const thanks = `${escapedDefaultTweet}%0A%0A${title}%0A%0A${url}`;
  const button = document.getElementById("tweet-btn");
  const twitterIntentStr = twitter
    ? `https://twitter.com/intent/tweet?text=${thanks}`
    : `https://twitter.com/intent/tweet?text=${title}%0A%0A${url}`;
  const windowOpenStr = `window.open(
    '${twitterIntentStr}',
    'share-twitter',
    'width=550, height=235'
  ); return false;`;

  button.setAttribute("onclick", windowOpenStr);
});
