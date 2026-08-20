import { formatAnnotation } from '../../utils/gh-annotations.js';
import {
  extractFailureSummary,
  fitToAnnotationLimit,
  formatStepSummary
} from './annotate-build-log.js';

const eleventyLog = `Fetched Hashnode posts 660... and using 2350.4 MB of memory
[11ty] Problem writing Eleventy templates:
[11ty] Wrote 0 files in 20.28 seconds (v3.1.2)
[11ty] fetch failed (via TypeError)
[11ty] Eleventy Fatal Error (CLI):
[11ty] fetch failed (via TypeError)
[11ty] Original error stack trace: TypeError: fetch failed
 ELIFECYCLE  Command failed with exit code 1.
`;

describe('Build log failure extraction:', () => {
  test('Prefers the Eleventy error block over surrounding noise', () => {
    const summary = extractFailureSummary(eleventyLog);

    expect(summary).toContain('[11ty] Problem writing Eleventy templates:');
    expect(summary).toContain('[11ty] Eleventy Fatal Error (CLI):');
    expect(summary).not.toContain('Fetched Hashnode posts 660');
  });

  test('Falls back to the tail of the log when no Eleventy block exists', () => {
    const log = Array.from({ length: 60 }, (_, i) => `line ${i + 1}`).join(
      '\n'
    );
    const summary = extractFailureSummary(log, { tailLines: 5 });

    expect(summary).toBe('line 56\nline 57\nline 58\nline 59\nline 60');
  });

  test('Drops blank lines from the fallback tail', () => {
    const summary = extractFailureSummary('a\n\n\nb\n\n', { tailLines: 5 });

    expect(summary).toBe('a\nb');
  });

  test('Truncates a summary that exceeds the annotation budget', () => {
    const log = `[11ty] Problem writing Eleventy templates:\n${'x'.repeat(9000)}`;
    const summary = extractFailureSummary(log, { maxLength: 200 });

    expect(summary.length).toBeLessThanOrEqual(200);
    expect(summary).toContain('truncated');
  });

  test('Keeps the marker line when the block outgrows the tail window', () => {
    const log = [
      '[11ty] Problem with ./src/x.njk',
      ...Array.from({ length: 50 }, (_, i) => `detail ${i}`)
    ].join('\n');
    const summary = extractFailureSummary(log, { tailLines: 5 });

    expect(summary.split('\n')[0]).toBe('[11ty] Problem with ./src/x.njk');
    expect(summary).toContain('detail 49');
  });

  test('Keeps the tail when an early marker is followed by a long run', () => {
    const log = [
      '[11ty] Problem with ./src/a.njk',
      ...Array.from({ length: 80 }, (_, i) => `noise ${i}`),
      '[11ty] Eleventy Fatal Error (CLI):',
      '[11ty] terminated (via TypeError)'
    ].join('\n');
    const summary = extractFailureSummary(log, { tailLines: 5 });

    expect(summary).toContain('[11ty] Eleventy Fatal Error (CLI):');
    expect(summary).toContain('[11ty] terminated (via TypeError)');
    expect(summary.split('\n')).toHaveLength(6);
  });

  test('Reports an empty log rather than returning an empty string', () => {
    expect(extractFailureSummary('   \n\n')).toBe(
      'The build produced no output to report.'
    );
  });
});

describe('Step summary rendering:', () => {
  test('Wraps the summary in a fenced block', () => {
    expect(formatStepSummary('boom')).toBe(
      '## Build failed\n\n```\nboom\n```\n\n'
    );
  });

  test('Widens the fence so log backticks cannot escape it', () => {
    const summary = '```\n![x](https://evil.example/t.png)\n```';
    const rendered = formatStepSummary(summary);

    expect(rendered).toContain('````\n```\n');
    expect(rendered.endsWith('````\n\n')).toBe(true);
    expect(rendered.split('````')).toHaveLength(3);
  });
});

describe('Annotation length budget:', () => {
  const options = { level: 'error', title: 'Build site failed' };

  test('Leaves a short summary untouched', () => {
    expect(fitToAnnotationLimit('boom', options)).toBe('boom');
  });

  test('Keeps the escaped workflow command inside the runner limit', () => {
    const dense = '%'.repeat(5000);
    const fitted = fitToAnnotationLimit(dense, options);

    expect(fitted).toContain('truncated');
    expect(fitted.length).toBeLessThan(dense.length);
    expect(
      formatAnnotation({ ...options, message: fitted }).length
    ).toBeLessThanOrEqual(4096);
  });

  test('Returns nothing when the fixed overhead alone exceeds the limit', () => {
    expect(
      fitToAnnotationLimit('x'.repeat(500), {
        level: 'error',
        title: 'T'.repeat(5000)
      })
    ).toBe('');
  });

  test('Accounts for the title and file properties', () => {
    const plain = 'x'.repeat(5000);
    const withFile = fitToAnnotationLimit(plain, {
      ...options,
      file: 'utils/hashnode/fetch-from-hashnode.js'
    });

    expect(withFile.length).toBeLessThan(
      fitToAnnotationLimit(plain, options).length
    );
  });
});
