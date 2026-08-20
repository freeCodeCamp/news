import { gql, request } from 'graphql-request';
import { join } from 'path';

import { hashnodeHost } from '../api.js';
import { wait } from '../wait.js';
import { loadJSON } from '../load-json.js';
import { annotate } from '../gh-annotations.js';
import { describeNetworkError } from '../network-error.js';
import { withNetworkRetry } from '../retry-network.js';
import { config } from '../../config/index.js';

const { eleventyEnv, currentLocale_i18n, hashnodeAPIURL } = config;

const SOURCE_FILE = 'utils/hashnode/fetch-from-hashnode.js';
const HASHNODE_TARGET = `${hashnodeAPIURL} (publication host "${hashnodeHost}")`;

export async function* fetchFromHashnodePages(contentType) {
  if (!hashnodeHost) return;
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
          instagram
          youtube
          github
          stackoverflow
          linkedin
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
    ${contentType === 'posts' ? postFieldsFragment : staticPageFieldsFragment}
    query DataFromPublication($host: String!, $first: Int!, $after: String) {
      publication(host: $host) {
        id
        ${fieldName}(first: $first, after: $after) {
          ${contentType === 'posts' ? 'totalDocuments' : ''}
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

  let after = '';
  let hasNextPage = true;

  while (hasNextPage) {
    const pageLabel = after
      ? `the page after cursor "${after}"`
      : 'the first page';

    const res = await withNetworkRetry(
      () =>
        eleventyEnv === 'ci' && currentLocale_i18n === 'english'
          ? loadJSON(
              join(
                import.meta.dirname,
                `../../cypress/fixtures/mock-hashnode-${contentType}.json`
              )
            )
          : request(hashnodeAPIURL, query, {
              host: hashnodeHost,
              first: 20,
              after
            }),
      {
        label: `Hashnode ${contentType} fetch`,
        target: `${pageLabel} from ${HASHNODE_TARGET}`,
        file: SOURCE_FILE
      }
    );

    const connection = res.publication?.[fieldName];
    const pageInfo = connection?.pageInfo;

    if (!pageInfo) {
      const summary = `Hashnode ${contentType} fetch returned no usable "${fieldName}" connection on ${pageLabel} from ${HASHNODE_TARGET}. Check that the publication host exists and that the API schema is unchanged.`;

      annotate({
        level: 'error',
        title: `Hashnode ${contentType} fetch returned no data`,
        file: SOURCE_FILE,
        message: summary
      });

      throw new Error(summary);
    }

    const resData = connection.edges?.map(({ node }) => node) || [];
    const totalDocuments = connection.totalDocuments ?? null;

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
      pageInfo.hasNextPage && !process.env.HASHNODE_DEBUG_MODE_FIRST_PAGE_ONLY;

    if (resData.length > 0) yield { nodes: resData, totalDocuments };

    await wait(200);
  }
}

export const fetchFromHashnode = async contentType => {
  const all = [];
  for await (const { nodes } of fetchFromHashnodePages(contentType)) {
    all.push(...nodes);
  }
  return all;
};

export const countHashnodeStaticPages = async () => {
  if (!hashnodeHost) return null;

  if (eleventyEnv === 'ci' && currentLocale_i18n === 'english') {
    const fixture = loadJSON(
      join(
        import.meta.dirname,
        '../../cypress/fixtures/mock-hashnode-pages.json'
      )
    );
    return fixture.publication?.staticPages?.edges?.length ?? 0;
  }

  const query = gql`
    query CountStaticPages($host: String!, $first: Int!, $after: String) {
      publication(host: $host) {
        staticPages(first: $first, after: $after) {
          edges {
            node {
              id
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

  let count = 0;
  let after = '';
  let hasNextPage = true;
  try {
    while (hasNextPage) {
      const res = await request(hashnodeAPIURL, query, {
        host: hashnodeHost,
        first: 20,
        after
      });
      const conn = res.publication?.staticPages;
      if (!conn) break;
      count += conn.edges.length;
      after = conn.pageInfo.endCursor;
      hasNextPage = conn.pageInfo.hasNextPage;
    }
    return count;
  } catch (error) {
    // Fail-soft: probe is cosmetic; null falls back to "of ?" in worker logs.
    annotate({
      level: 'warning',
      title: 'Hashnode static page count probe failed',
      file: SOURCE_FILE,
      message: `Could not count Hashnode static pages from ${HASHNODE_TARGET}. ${describeNetworkError(error)}. The build continues and worker logs show "batch N of ?".`
    });
    return null;
  }
};
