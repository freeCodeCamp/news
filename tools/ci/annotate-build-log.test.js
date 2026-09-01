import { jest } from '@jest/globals';
import {
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync
} from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

import { formatAnnotation } from '../../utils/gh-annotations.js';
import {
  extractFailureSummary,
  fitToAnnotationLimit,
  formatStepSummary,
  run
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
      '[11ty] Uncaught exception:',
      ...Array.from({ length: 50 }, (_, i) => `detail ${i}`)
    ].join('\n');
    const summary = extractFailureSummary(log, { tailLines: 5 });

    expect(summary.split('\n')[0]).toBe('[11ty] Uncaught exception:');
    expect(summary).toContain('detail 49');
  });

  test('Drops stack frames so the error text survives a deep trace', () => {
    const frames = count =>
      Array.from(
        { length: count },
        (_, i) =>
          `[11ty]     at frame${i} (/node_modules/undici/lib/x.js:${i}:1)`
      );
    const log = [
      '[11ty] Problem writing Eleventy templates:',
      '[11ty] fetch failed (via TypeError)',
      ...frames(28),
      '[11ty] Eleventy Fatal Error (CLI):',
      '[11ty] Original error stack trace: TypeError: fetch failed',
      ...frames(45),
      ' ELIFECYCLE  Command failed with exit code 1.'
    ].join('\n');
    const summary = extractFailureSummary(log);

    expect(summary).toContain('[11ty] Eleventy Fatal Error (CLI):');
    expect(summary).toContain('[11ty] fetch failed (via TypeError)');
    expect(summary).toContain('Original error stack trace');
    expect(summary).not.toContain('at frame');
  });

  test('Drops a bare stack frame that carries no Eleventy prefix', () => {
    const log = [
      '[11ty] Eleventy Fatal Error (CLI):',
      '[11ty] boom',
      ...Array.from(
        { length: 40 },
        (_, i) => `    at Object.run (/app/tools/x.js:${i}:9)`
      )
    ].join('\n');
    const summary = extractFailureSummary(log);

    expect(summary).toContain('[11ty] boom');
    expect(summary).not.toContain('at Object.run');
  });

  test('Recognises the CLI unhandled-rejection marker', () => {
    const log = [
      ...Array.from({ length: 40 }, (_, i) => `before ${i}`),
      '[11ty] Unhandled rejection in promise:',
      '[11ty] terminated (via TypeError)',
      ...Array.from({ length: 40 }, (_, i) => `after ${i}`)
    ].join('\n');
    const summary = extractFailureSummary(log, { tailLines: 5 });

    expect(summary.split('\n')[0]).toBe(
      '[11ty] Unhandled rejection in promise:'
    );
    expect(summary).not.toContain('before 39');
  });

  test('Keeps the tail when an early marker is followed by a long run', () => {
    const log = [
      '[11ty] Problem writing Eleventy templates:',
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

describe('Command entrypoint:', () => {
  let workDir;
  let logPath;
  let summaryPath;
  let logSpy;
  const originalActions = process.env.GITHUB_ACTIONS;

  beforeEach(() => {
    process.env.GITHUB_ACTIONS = 'true';
    workDir = mkdtempSync(join(tmpdir(), 'annotate-build-log-'));
    logPath = join(workDir, 'build.log');
    summaryPath = join(workDir, 'summary.md');
    writeFileSync(
      logPath,
      '[11ty] Eleventy Fatal Error (CLI):\n[11ty] fetch failed (via TypeError)\n'
    );
    logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    rmSync(workDir, { recursive: true, force: true });
    logSpy?.mockRestore();
    if (originalActions === undefined) delete process.env.GITHUB_ACTIONS;
    else process.env.GITHUB_ACTIONS = originalActions;
  });

  test('Annotates at error level and writes the step summary', () => {
    run([logPath, 'Build site (english)'], {
      GITHUB_STEP_SUMMARY: summaryPath
    });

    expect(logSpy.mock.calls[0][0]).toContain(
      '::error title=Build site (english) failed::'
    );
    expect(readFileSync(summaryPath, 'utf8')).toContain(
      '[11ty] Eleventy Fatal Error (CLI):'
    );
  });

  test('Suppresses the step summary at warning level', () => {
    run([logPath, 'Build site (attempt 1 of 2)', 'warning'], {
      GITHUB_STEP_SUMMARY: summaryPath
    });

    expect(logSpy.mock.calls[0][0]).toContain('::warning title=');
    expect(() => readFileSync(summaryPath, 'utf8')).toThrow(/ENOENT/);
  });

  test('Falls back to error level when the level is unknown', () => {
    run([logPath, 'Build site', 'debug'], {});

    expect(logSpy.mock.calls[0][0]).toContain('::error title=');
  });

  test('Reports a missing log file instead of throwing', () => {
    run([join(workDir, 'absent.log'), 'Build site'], {
      GITHUB_STEP_SUMMARY: summaryPath
    });

    expect(logSpy.mock.calls[0][0]).toContain('no build log was found at');
    expect(() => readFileSync(summaryPath, 'utf8')).toThrow(/ENOENT/);
  });

  test('Reports a missing path argument instead of throwing', () => {
    run([], {});

    expect(logSpy.mock.calls[0][0]).toContain('<missing path>');
  });

  test('Writes no summary when no step summary path is set', () => {
    run([logPath, 'Build site'], {});

    expect(logSpy.mock.calls[0][0]).toContain('::error title=');
    expect(readdirSync(workDir)).toEqual(['build.log']);
  });
});
