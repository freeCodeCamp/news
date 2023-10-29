const { cloneDeep } = require('lodash');
const { strapiApiUrl, strapiAccessToken } = require('../../config');
const stripDomain = require('../strip-domain');
const qs = require('qs');

const fetchPosts = async contentType => {
  const options = {
    publicationState: 'live',
    populate: ['tags', 'author', 'feature_image', 'author.profile_image'],
    sort: ['publishedAt:desc'],
    pagination: {
      limit: 10
    }
  };

  const res = await fetch(
    `${strapiApiUrl}/posts?${qs.stringify(options, {
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
  return data.data; // data.meta needs to be used for pagination
};

module.exports = fetchPosts;
