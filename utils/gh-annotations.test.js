import { jest } from '@jest/globals';
import {
  formatAnnotation,
  annotate,
  isAnnotationLevel
} from './gh-annotations.js';

describe('GitHub annotation helpers:', () => {
  describe('formatAnnotation', () => {
    test('Builds a bare workflow command', () => {
      expect(formatAnnotation({ level: 'error', message: 'Boom' })).toBe(
        '::error::Boom'
      );
    });

    test('Escapes newlines and percent signs in the message', () => {
      expect(
        formatAnnotation({ level: 'warning', message: 'a\r\nb 50% c' })
      ).toBe('::warning::a%0D%0Ab 50%25 c');
    });

    test('Escapes colons and commas in property values', () => {
      expect(
        formatAnnotation({
          level: 'error',
          title: 'Fetch failed: Hashnode, posts',
          message: 'Boom'
        })
      ).toBe('::error title=Fetch failed%3A Hashnode%2C posts::Boom');
    });

    test('Includes the file property after the title', () => {
      expect(
        formatAnnotation({
          level: 'error',
          title: 'Bad',
          file: 'utils/a.js',
          message: 'Boom'
        })
      ).toBe('::error title=Bad,file=utils/a.js::Boom');
    });

    test('Rejects an unknown level', () => {
      expect(() => formatAnnotation({ level: 'debug', message: 'x' })).toThrow(
        /level/
      );
    });

    test('A message cannot open a second workflow command', () => {
      const command = formatAnnotation({
        level: 'error',
        title: 'Build site failed',
        message: '[11ty] boom\n::error::injected\n::notice::also injected'
      });

      expect(command.split('\n')).toHaveLength(1);
      expect(command.startsWith('::error title=Build site failed::')).toBe(
        true
      );
      expect(command).toContain('%0A::error::injected');
    });

    test('A title cannot open a second workflow command', () => {
      const command = formatAnnotation({
        level: 'error',
        title: 'boom\n::error::injected',
        message: 'x'
      });

      expect(command.split('\n')).toHaveLength(1);
      expect(command).toContain('title=boom%0A%3A%3Aerror%3A%3Ainjected');
    });

    test('A carriage return alone cannot start a new line', () => {
      const command = formatAnnotation({
        level: 'warning',
        message: 'a\r::error::injected'
      });

      expect(command).toBe('::warning::a%0D::error::injected');
      expect(command.split(/\r|\n/)).toHaveLength(1);
    });
  });

  describe('isAnnotationLevel', () => {
    test('Accepts the three workflow command levels', () => {
      ['error', 'warning', 'notice'].forEach(level =>
        expect(isAnnotationLevel(level)).toBe(true)
      );
    });

    test('Rejects anything else', () => {
      [undefined, null, '', 'debug', 'ERROR'].forEach(level =>
        expect(isAnnotationLevel(level)).toBe(false)
      );
    });
  });

  describe('annotate', () => {
    const originalEnv = process.env.GITHUB_ACTIONS;
    let logSpy;

    beforeEach(() => {
      logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    });

    afterEach(() => {
      logSpy.mockRestore();
      if (originalEnv === undefined) delete process.env.GITHUB_ACTIONS;
      else process.env.GITHUB_ACTIONS = originalEnv;
    });

    test('Emits a workflow command inside GitHub Actions', () => {
      process.env.GITHUB_ACTIONS = 'true';
      annotate({ level: 'error', title: 'T', message: 'Boom' });
      expect(logSpy).toHaveBeenCalledWith('::error title=T::Boom');
    });

    test('Emits readable text outside GitHub Actions', () => {
      delete process.env.GITHUB_ACTIONS;
      annotate({ level: 'error', title: 'T', message: 'Boom' });
      expect(logSpy).toHaveBeenCalledWith('ERROR: T: Boom');
    });

    test('Rejects an unknown level in both environments', () => {
      process.env.GITHUB_ACTIONS = 'true';
      expect(() => annotate({ level: 'fatal', message: 'x' })).toThrow(/level/);

      delete process.env.GITHUB_ACTIONS;
      expect(() => annotate({ level: 'fatal', message: 'x' })).toThrow(/level/);
    });
  });
});
