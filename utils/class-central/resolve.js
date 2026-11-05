import { abbreviateEffort, cleanInstructor, formatCount } from './format.js';

// Posts reference courses by id and subjects by slug to keep the cache small.
// Look them up here and add the display-ready fields the sponsored course ad templates.
// Skip references the cache doesn't have, so one bad entry doesn't drop every post's courses
export const resolvePosts = ({ posts, courses, subjects }) => {
  const missingCourseIds = new Set();

  const resolved = Object.fromEntries(
    Object.entries(posts).map(([id, entry]) => [
      id,
      {
        ...entry,
        courses: entry.courseIds.flatMap(courseId => {
          const course = courses[courseId];
          if (!course) {
            missingCourseIds.add(courseId);
            return [];
          }
          return [
            {
              ...course,
              effortShort: abbreviateEffort(course.effort),
              instructorName: cleanInstructor(course.instructors),
              ratingCount: formatCount(course.rating?.provider?.count)
            }
          ];
        }),
        subjects: entry.subjectSlugs.map(slug => subjects[slug]).filter(Boolean)
      }
    ])
  );

  if (missingCourseIds.size) {
    console.warn(
      `Class Central cache references unknown courses, skipping them: ${[...missingCourseIds].join(', ')}`
    );
  }

  return resolved;
};
