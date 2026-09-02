import fetch from 'node-fetch';

import { wait } from '../wait.js';
import { withNetworkRetry } from '../retry-network.js';
import { config } from '../../config/index.js';

const { classCentralAPIKey } = config;

const CLASS_CENTRAL_API_URL = 'https://www.classcentral.com/api/v3/related';

const SOURCE_FILE = 'utils/class-central/api.js';

// Class Central allows 60 requests/minute
export const CLASS_CENTRAL_THROTTLE_MS = 1100;

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

// A failed post is reported via onError and skipped, not retried here, and
// the next run picks it up
export const fetchRelatedCoursesForAll = async (
  entries,
  { onResult, onError }
) => {
  for (const entry of entries) {
    try {
      const result = await fetchRelatedCourses(entry.content);
      onResult(entry, result);
    } catch (error) {
      onError(entry, error);
    }

    await wait(CLASS_CENTRAL_THROTTLE_MS);
  }
};
