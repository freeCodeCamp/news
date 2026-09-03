import fetch from 'node-fetch';

import { wait } from '../wait.js';
import { withNetworkRetry } from '../retry-network.js';
import { config } from '../../config/index.js';

const { classCentralAPIKey } = config;

const CLASS_CENTRAL_API_URL = 'https://www.classcentral.com/api/v3/related';

const SOURCE_FILE = 'utils/class-central/api.js';

// Class Central allows 60 requests/minute
const CLASS_CENTRAL_THROTTLE_MS = 1100;

export const fetchRelatedCourses = async content => {
  const res = await withNetworkRetry(
    () =>
      fetch(CLASS_CENTRAL_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${classCentralAPIKey}`
        },
        body: JSON.stringify({ content })
      }),
    {
      label: 'Class Central related-courses fetch',
      target: 'the Class Central /related endpoint',
      file: SOURCE_FILE
    }
  );

  if (!res.ok) {
    throw new Error(
      `Class Central /related responded with ${res.status} ${res.statusText}`
    );
  }

  const { data } = await res.json();

  return {
    courses: data?.courses ?? [],
    subjects: data?.subjects ?? []
  };
};

// Fetches one post at a time, throttled to Class Central's rate limit. A post
// whose fetch fails is yielded with an `error` and skipped, not retried here -
// the next run picks it up.
export async function* fetchRelatedCoursesForPosts(postsToFetch) {
  for (const post of postsToFetch) {
    try {
      const courseData = await fetchRelatedCourses(post.content);
      yield { post, courseData };
    } catch (error) {
      yield { post, error };
    }

    await wait(CLASS_CENTRAL_THROTTLE_MS);
  }
}
