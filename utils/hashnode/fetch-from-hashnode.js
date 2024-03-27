const { gql, request } = require('graphql-request');
const { sourceHashnodeHost } = require('../ghost/api');
const wait = require('../wait');

const fetchFromHashnode = async endpoint => {
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
  const postsQuery = gql`
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

  const pageFieldsFragment = `fragment PageFields on StaticPage {
    id
    slug
    title
    content {
      html
    }
  }`;
  const pagesQuery = gql`
    ${pageFieldsFragment}
    query PagesByPublication($host: String!, $first: Int!, $after: String) {
      publication(host: $host) {
        id
        staticPages(first: $first, after: $after) {
          edges {
            node {
              ...PageFields
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

  const data = [];
  const query = endpoint === 'posts' ? postsQuery : pagesQuery;
  let after = '';
  let hasNextPage = true;

  while (hasNextPage) {
    const res = await request(process.env.HASHNODE_API_URL, query, {
      host: sourceHashnodeHost,
      first: 20,
      after
    });

    const resData =
      res.publication[
        endpoint === 'posts' ? 'posts' : 'staticPages'
      ]?.edges.map(({ node }) => node) || [];
    const pageInfo =
      res.publication[endpoint === 'posts' ? 'posts' : 'staticPages'].pageInfo;

    if (resData.length > 0)
      console.log(`Fetched Hashnode ${endpoint} ${pageInfo.endCursor}...`);

    after = pageInfo.endCursor;
    hasNextPage = pageInfo.hasNextPage;

    data.push(...resData);

    await wait(200);
  }

  return data;
};

module.exports = fetchFromHashnode;
