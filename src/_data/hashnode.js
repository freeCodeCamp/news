module.exports = async () => {
  const { request, gql } = require('graphql-request');

  const postFieldsFragment = gql`
    fragment PostFields on Post {
      title
      author {
        username
        name
        profilePicture
      }
      brief
      slug
      publishedAt
      readTimeInMinutes
      coverImage {
        url
      }
    }
  `;

  const getUserArticlesQuery = gql`
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

  const data = await request('https://gql.hashnode.com', getUserArticlesQuery, {
    host: 'fcc.hashnode.dev',
    first: 10
    // after: pageCursor // This is where you would use the cursor
  });

  const posts = data?.publication?.posts?.edges.map(({ node }) => node) || [];

  const pageInfo = data?.publication?.posts?.pageInfo || {
    endCursor: '',
    hasNextPage: false
  };

  return {
    posts,
    pageInfo
  };
};
