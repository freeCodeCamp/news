import { gql, request } from 'graphql-request';
import { join } from 'path';

import { hashnodeHost } from '../api.js';
import { wait } from '../wait.js';
import { loadJSON } from '../load-json.js';
import { config } from '../../config/index.js';

const { eleventyEnv, currentLocale_i18n, hashnodeAPIURL } = config;

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
    let retries = 3;
    let success = false;

    while (retries > 0 && !success) {
      try {
        const res =
          eleventyEnv === 'ci' && currentLocale_i18n === 'english'
            ? loadJSON(
                join(
                  import.meta.dirname,
                  `../../cypress/fixtures/mock-hashnode-${contentType}.json`
                )
              )
            : await request(hashnodeAPIURL, query, {
                host: hashnodeHost,
                first: 20,
                after
              });

        const resData =
          res.publication[fieldName]?.edges.map(({ node }) => node) || [];
        const pageInfo = res.publication[fieldName]?.pageInfo;
        const totalDocuments =
          res.publication[fieldName]?.totalDocuments ?? null;

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

        if (resData.length > 0) yield { nodes: resData, totalDocuments };

        success = true;
      } catch (error) {
        const status = error.response?.status;
        const isTransient =
          status >= 500 ||
          error.message.includes('ECONNRESET') ||
          error.message.includes('ETIMEDOUT') ||
          error.message.includes('ECONNREFUSED');
        if (isTransient && retries > 1) {
          console.log(
            `Transient error (${status || error.code || 'network'}). Retrying... (${retries - 1} attempts left)`
          );
          retries--;
          await wait(60000); // 60s aligns with Cloudflare retry_after hint on 502s
        } else {
          throw error; // Non-transient, or retries exhausted
        }
      }
    }

    if (!success) {
      console.error('Failed to fetch data after multiple retries');
      break;
    }

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

// StaticPageConnection lacks totalDocuments (verified via introspection against
// gql-beta.hashnode.com 2026-05-18). Walk pageInfo with a minimal selection
// (id only) to count edges. Volume is tiny — a handful of pages — so the extra
// round trips are cheap and let workers log "batch N of M" instead of "of ?".
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
    // Fail-soft: the count is only used to display "batch N of M" in worker
    // logs. A transient probe failure must not crash a 25-minute build. Workers
    // fall back to "batch N of ?" when null.
    console.warn(
      `countHashnodeStaticPages probe failed (${error.response?.status || error.code || error.message}); workers will log "of ?".`
    );
    return null;
  }
};
