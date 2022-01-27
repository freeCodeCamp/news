document.addEventListener("DOMContentLoaded", () => {
  const title = "{{ post.title | escape }}".replace(/&#39;/g, "%27");
  const twitter = "{{ post.primary_author.twitter }}";
  const url = window.location;
  const thanks =
    `{% t 'social-row.default-tweet', { twitter: post.primary_author.twitter } %}` +
    `%0A%0A${title}%0A%0A${url}`;
  const button = document.getElementById("tweet-btn");
  const windowOpenStr = `window.open(
    '${
      twitter
        ? `https://twitter.com/intent/tweet?text=${thanks}`
        : `https://twitter.com/intent/tweet?text=${title}%0A%0A${url}`
    }',
    'share-twitter',
    'width=550, height=235'
  ); return false;`;

  button.setAttribute("onclick", windowOpenStr);
});
