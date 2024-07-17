const { gql, request } = require('graphql-request');
const { sourceHashnodeHost } = require('../ghost/api');
const { eleventyEnv, currentLocale_i18n } = require('../../config');
const wait = require('../wait');

const fetchFromHashnode = async contentType => {
  if (!sourceHashnodeHost) return [];
  const fieldName = contentType === 'posts' ? 'posts' : 'staticPages';

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

  const staticPageFieldsFragment = gql`
    fragment StaticPageFields on StaticPage {
      id
      slug
      title
      content {
        html
        markdown
      }
    }
  `;

  const query = gql`
    ${postFieldsFragment}
    ${staticPageFieldsFragment}
    query DataFromPublication($host: String!, $first: Int!, $after: String) {
      publication(host: $host) {
        id
        ${fieldName}(first: $first, after: $after) {
          edges {
            node {
              ...${contentType === 'posts' ? 'PostFields' : 'StaticPageFields'}
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
  let after = '';
  let hasNextPage = true;

  while (hasNextPage) {
    // const res =
    //   eleventyEnv === 'ci' && currentLocale_i18n === 'english'
    //     ? require('../../cypress/fixtures/mock-hashnode-posts.json')
    //     : await request(process.env.HASHNODE_API_URL, query, {
    //         host: sourceHashnodeHost,
    //         first: 20,
    //         after
    //       });

    const res = await request(process.env.HASHNODE_API_URL, query, {
      host: sourceHashnodeHost,
      first: 20,
      after
    });

    const resData =
      res.publication[fieldName]?.edges.map(({ node }) => node) || [];
    const pageInfo = res.publication[fieldName]?.pageInfo;

    if (resData.length > 0)
      console.log(
        `Fetched Hashnode ${contentType} ${pageInfo.endCursor}... and using ${process.memoryUsage.rss() / 1024 / 1024} MB of memory`
      );

    after = pageInfo.endCursor;
    hasNextPage = pageInfo.hasNextPage;

    data.push(...resData);

    await wait(200);
  }

  return data;
};

module.exports = fetchFromHashnode;
