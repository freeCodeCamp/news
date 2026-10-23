// Split a post's sponsored courses into sidebar rails

// One rail per 5 minutes of reading time, leaving room for ads between rails
export const READING_MINUTES_PER_RAIL = 5;
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
