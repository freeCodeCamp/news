const { gql, request } = require('graphql-request');
const { sourceHashnodeHost } = require('../ghost/api');
const { eleventyEnv, currentLocale_i18n } = require('../../config');
const wait = require('../wait');

const fetchFromHashnode = async () => {
  if (!sourceHashnodeHost) return [];

  const postFieldsFragment = gql`
    fragment PostFields on Post {
      id
      slug
      title
      author {
        id
        username
        name
        bio {
          text
        }
        profilePicture
        socialMediaLinks {
          website
          twitter
          facebook
        }
        location
      }
      tags {
        id
        name
        slug
      }
      coverImage {
        url
      }
      brief
      readTimeInMinutes
      content {
        html
      }
      publishedAt
      updatedAt
    }
  `;

  const query = gql`
    ${postFieldsFragment}
    query PostsByPublication($host: String!, $first: Int!, $after: String) {
      publication(host: $host) {
        id
        posts(first: $first, after: $after) {
          edges {
            node {
              ...PostFields
            }
          }
          pageInfo {
            endCursor
            hasNextPage
          }
        }
      }
    }
  `;

  const allPosts = [];
  let after = '';
  let hasNextPage = true;

  while (hasNextPage) {
    const res =
      eleventyEnv === 'ci' && currentLocale_i18n === 'english'
        ? require('../../cypress/fixtures/mock-hashnode-posts.json')
        : await request(process.env.HASHNODE_API_URL, query, {
            host: sourceHashnodeHost,
            first: 20,
            after
          });

    const resPosts = res.publication.posts?.edges.map(({ node }) => node) || [];
    const pageInfo = res.publication.posts.pageInfo;

    if (resPosts.length > 0)
      console.log(`Fetched Hashnode page ${pageInfo.endCursor}...`);

    after = pageInfo.endCursor;
    hasNextPage = pageInfo.hasNextPage;

    allPosts.push(...resPosts);

    await wait(0.2);
  }

  return allPosts;
};

module.exports = fetchFromHashnode;
