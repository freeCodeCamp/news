// Lay out Class Central course rails and Google ads in the post sidebar

// One rail per 4 minutes of reading time, leaving room for ads between rails
export const READING_MINUTES_PER_RAIL = 4;
export const COURSES_PER_RAIL = 4;

export const getRailCount = readingTime =>
  Math.max(1, Math.floor((readingTime || 0) / READING_MINUTES_PER_RAIL));

// Cycle through the courses four per rail, e.g. with a-g: abcd, efga, bcde
export const getRailCourses = (ccData, readingTime) => {
  const courses = ccData?.courses;
  if (!courses?.length) return [];

  const perRail = Math.min(COURSES_PER_RAIL, courses.length);

  return Array.from({ length: getRailCount(readingTime) }, (_, rail) =>
    Array.from(
      { length: perRail },
      (_, i) => courses[(rail * perRail + i) % courses.length]
    )
  );
};

// Include 2 ads by default for all articles. Then add 1 ad for every 2 mins of
// reading time if reading time <= 4 mins. Else, add 1 ad for every 1 min of
// reading time. Only used by AdSense (dev/CI) - GAM fills each segment by height.
// Remove once AdSense and GAM are consolidated
export const getSidebarAdCount = readingTime => {
  const minutes = readingTime || 0;
  return Math.floor((minutes <= 4 ? minutes / 2 : minutes) + 2);
};

// Split the sidebar into one equal-height segment per rail. Each rail takes
// the place of one ad, and the remaining ads are spread across the segments,
// with any extras going to the earliest ones
export const getSidebarSegments = (ccData, readingTime) => {
  const rails = getRailCourses(ccData, readingTime);
  const segmentCount = rails.length || 1;
  const adCount = Math.max(0, getSidebarAdCount(readingTime) - rails.length);

  return Array.from({ length: segmentCount }, (_, i) => ({
    courses: rails[i],
    adCount:
      Math.floor(adCount / segmentCount) + (i < adCount % segmentCount ? 1 : 0)
  }));
};
