const { gql, request } = require('graphql-request');
const { hashnodeHost } = require('../api');
const {
  eleventyEnv,
  currentLocale_i18n,
  hashnodeAPIURL
} = require('../../config');
const wait = require('../wait');

const fetchFromHashnode = async contentType => {
  if (!hashnodeHost) return [];
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
      seo {
        description
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
    let retries = 3;
    let success = false;

    while (retries > 0 && !success) {
      try {
        const res =
          eleventyEnv === 'ci' && currentLocale_i18n === 'english'
            ? require(
                `../../cypress/fixtures/mock-hashnode-${contentType}.json`
              )
            : await request(hashnodeAPIURL, query, {
                host: hashnodeHost,
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
        if (process.env.HASHNODE_DEBUG_MODE_FIRST_PAGE_ONLY) {
          console.log(
            'HASHNODE_DEBUG_MODE_FIRST_PAGE_ONLY is active. Fetching only the first page.'
          );
        }

        hasNextPage =
          pageInfo.hasNextPage &&
          !process.env.HASHNODE_DEBUG_MODE_FIRST_PAGE_ONLY;

        data.push(...resData);

        success = true;
      } catch (error) {
        if (error.message.includes('ECONNRESET') && retries > 1) {
          console.log(
            `Connection reset error. Retrying... (${retries - 1} attempts left)`
          );
          retries--;
          await wait(10000); // Wait for 10 seconds before retrying
        } else {
          throw error; // If it's not a connection reset or no more retries, rethrow the error
        }
      }
    }

    if (!success) {
      console.error('Failed to fetch data after multiple retries');
      break;
    }

    await wait(200);
  }

  return data;
};

module.exports = fetchFromHashnode;
