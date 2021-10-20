const { englishApi } = require('./api');

const originalPostHandler = async (post) => {
  const originalPostRegex = /const\s+fccOriginalPost\s+=\s+("|')(?<url>.*)\1;?/g;
  const match = originalPostRegex.exec(post.codeinjection_head);
  
  if (match) {
    const url = match.groups.url;
    const urlArr = url.split('/');
    // handle urls that end with a slash,
    // then urls that don't end in a slash
    const originalPostSlug = urlArr[urlArr.length - 1] ?
      urlArr[urlArr.length - 1] :
      urlArr[urlArr.length - 2];
    const originalPostRes = await englishApi.posts
      .read({
        include: 'authors',
        slug: originalPostSlug
      })
      .catch(err => {
        console.error(err);
      });
    const {
      title,
      published_at,
      primary_author
    } = originalPostRes;

    post.original_post = {
      title,
      published_at,
      url,
      primary_author
    }
  }

  return post;
}

module.exports = originalPostHandler;
