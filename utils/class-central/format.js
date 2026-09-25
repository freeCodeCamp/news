// Display helpers for Class Central courses - attempt to normalize
// effort strings, instructor names, and counts before they reach the ad template

const EFFORT_UNITS = { week: 'w', day: 'd', hour: 'h', minute: 'm' };

// "1 day 6 hours 36 minutes" -> "1d 6h", "13 hours" -> "13h",
// "7 weeks, 1 hour a week" -> "7w" (a cadence, not a total)
export const abbreviateEffort = effort => {
  if (!effort) return '';

  const parts = [...effort.matchAll(/(\d+)\s*(week|day|hour|minute)s?/gi)];
  if (!parts.length) return '';

  const isCadence = /a week|per week|\/\s*week/i.test(effort);

  return parts
    .slice(0, isCadence ? 1 : 2)
    .map(([, amount, unit]) => `${amount}${EFFORT_UNITS[unit.toLowerCase()]}`)
    .join(' ');
};

// "Scott Duffy  • 1,500,000+ Students" -> "Scott Duffy",
// "Ankit Mistry : 266,000+ Students and Ajay Gadhave" -> "Ankit Mistry"
export const cleanInstructor = instructor => {
  if (!instructor) return '';
  return instructor.split(/\s[•|:]\s/)[0].trim();
};

export const formatCount = count =>
  typeof count === 'number' ? count.toLocaleString('en-US') : '';
