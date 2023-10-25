const { cloneDeep } = require('lodash');
const { strapiApiUrl, strapiAccessToken } = require('../../config');
const stripDomain = require('../strip-domain');
const qs = require('qs');

const fetchFromStrapi = async contentType => {
  if (contentType === 'posts') {
    const options = {
      publicationState: 'live',
      populate: ['tags', 'author', 'feature_image'],
      pagination: {
        limit: 25
      }
    };

    const res = await fetch(
      `${strapiApiUrl}/${contentType}?${qs.stringify(options, {
        encodeValuesOnly: true
      })}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${strapiAccessToken}`
        }
      }
    ).catch(err => {
      console.error(err);
    });

    const data = await res.json();

    const newPosts = data.data.map(post => {
      const postId = post.id;
      post = cloneDeep(post.attributes);
      // console.log(post);
      delete post.attributes;
      post.path = '/' + post.slug;
      post.id = postId;
      post.feature_image =
        'http://localhost:1337' + post.feature_image.data[0].attributes.url;
      return post;
    });

    return newPosts;
  }
  if (contentType === 'tags') {
  }
  if (contentType === 'authors') {
  }
};

module.exports = fetchFromStrapi;
