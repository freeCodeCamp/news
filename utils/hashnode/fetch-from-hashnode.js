const { gql, request } = require('graphql-request');

const { sourceHashnodeHost } = require('../ghost/api');

const wait = seconds => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(seconds);
    }, seconds * 1000);
  });
};

const fetchFromHashnode = async () => {
  const postFieldsFragment = gql`
    fragment PostFields on Post {
      id
      slug
      title
      subtitle
      author {
        id
        username
        name
        bio {
          text
        }
        profilePicture
        socialMediaLinks {
          twitter
          facebook
        }
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

  const res = await request(process.env.HASHNODE_API_URL, query, {
    host: sourceHashnodeHost,
    first: 10
  });

  // console.log(res);
  const posts = res?.publication?.posts?.edges.map(({ node }) => node) || [];

  await wait(0.2);

  return posts;
};

module.exports = fetchFromHashnode;
