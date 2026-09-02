import { getRelatedCoursesContent, hashContent } from './content.js';

describe('Class Central content helpers:', () => {
  describe('getRelatedCoursesContent', () => {
    test('Returns the raw HTML unchanged when it fits within the length limit', () => {
      const html = '<p>Learn <strong>JavaScript</strong> the fun way.</p>';

      expect(getRelatedCoursesContent({ content: { html } })).toBe(html);
    });

    test('Returns null when the content is under 20 characters', () => {
      expect(
        getRelatedCoursesContent({ content: { html: '<p>Too short</p>' } })
      ).toBeNull();
    });

    test('Returns null when html is missing', () => {
      expect(getRelatedCoursesContent({})).toBeNull();
    });

    test('Combines the head and tail of long content, weighted 70/30', () => {
      const intro = '<p>INTRO</p>' + 'a'.repeat(30000);
      const conclusion = 'b'.repeat(30000) + '<p>CONCLUSION</p>';
      const html = `${intro}${conclusion}`;

      const result = getRelatedCoursesContent({ content: { html } });

      expect(result.length).toBeLessThanOrEqual(20000);
      expect(result).toContain('INTRO');
      expect(result).toContain('CONCLUSION');
    });

    test('Never cuts a trimmed section in the middle of a tag', () => {
      const html = `<p>${'a'.repeat(30000)}<em>middle</em>${'b'.repeat(30000)}</p>`;

      const [head, tail] = getRelatedCoursesContent({
        content: { html }
      }).split('\n');

      expect(head.endsWith('>')).toBe(true);
      expect(tail.startsWith('<')).toBe(true);
    });
  });

  describe('hashContent', () => {
    test('Returns the same hash for the same content', () => {
      expect(hashContent('hello world')).toBe(hashContent('hello world'));
    });

    test('Returns a different hash for different content', () => {
      expect(hashContent('hello world')).not.toBe(hashContent('hello there'));
    });
  });
});
