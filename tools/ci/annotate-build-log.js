import gracefulFS from 'graceful-fs';
import { realpathSync } from 'fs';
import { pathToFileURL } from 'url';

import {
  annotate,
  formatAnnotation,
  isAnnotationLevel
} from '../../utils/gh-annotations.js';

const { appendFileSync, existsSync, readFileSync } = gracefulFS;

const ELEVENTY_ERROR_MARKERS = [
  '[11ty] Problem writing Eleventy templates:',
  '[11ty] Eleventy Fatal Error (CLI):',
  '[11ty] Unhandled rejection in promise:',
  '[11ty] Uncaught exception:'
];

const STACK_FRAME = /^(?:\[11ty\]\s+)?\s*at\s+\S/;

const DEFAULT_TAIL_LINES = 30;
const DEFAULT_MAX_LENGTH = 20000;
const EMPTY_LOG_SUMMARY = 'The build produced no output to report.';
const TRUNCATION_NOTICE = '\n... (truncated, see the full step log)';

// Runner limit for one annotation message: https://github.com/actions/runner/blob/main/src/Runner.Worker/ExecutionContext.cs
const ANNOTATION_LIMIT = 4096;

const truncate = (text, maxLength) => {
  if (text.length <= maxLength) return text;

  return `${text.slice(0, Math.max(0, maxLength - TRUNCATION_NOTICE.length))}${TRUNCATION_NOTICE}`;
};

export const extractFailureSummary = (
  logText,
  { tailLines = DEFAULT_TAIL_LINES, maxLength = DEFAULT_MAX_LENGTH } = {}
) => {
  const lines = String(logText).split('\n');
  const firstMarker = lines.findIndex(line =>
    ELEVENTY_ERROR_MARKERS.some(marker => line.includes(marker))
  );

  const selected = (firstMarker === -1 ? lines : lines.slice(firstMarker))
    .map(line => line.trimEnd())
    .filter(line => line && !STACK_FRAME.test(line))
    .slice(-tailLines);

  if (!selected.length) return EMPTY_LOG_SUMMARY;

  const markerLine = firstMarker === -1 ? null : lines[firstMarker].trimEnd();
  if (markerLine && selected[0] !== markerLine) selected.unshift(markerLine);

  return truncate(selected.join('\n'), maxLength);
};

export const fitToAnnotationLimit = (
  summary,
  { level, title, file },
  limit = ANNOTATION_LIMIT
) => {
  const fits = message =>
    formatAnnotation({ level, title, file, message }).length <= limit;

  if (fits(summary)) return summary;
  if (!fits(TRUNCATION_NOTICE)) return '';

  let low = 0;
  let high = summary.length;

  while (low < high) {
    const mid = Math.ceil((low + high) / 2);
    if (fits(`${summary.slice(0, mid)}${TRUNCATION_NOTICE}`)) low = mid;
    else high = mid - 1;
  }

  return `${summary.slice(0, low)}${TRUNCATION_NOTICE}`;
};

export const formatStepSummary = summary => {
  const longestRun = [...String(summary).matchAll(/`+/g)].reduce(
    (longest, [run]) => Math.max(longest, run.length),
    0
  );
  const fence = '`'.repeat(Math.max(3, longestRun + 1));

  return `## Build failed\n\n${fence}\n${summary}\n${fence}\n\n`;
};

const writeStepSummary = (summary, summaryPath) => {
  if (!summaryPath) return;

  appendFileSync(summaryPath, formatStepSummary(summary));
};

export const run = (args, env = process.env) => {
  const [logPath, label = 'Build site', requestedLevel] = args;
  const level = isAnnotationLevel(requestedLevel) ? requestedLevel : 'error';
  const title = `${label} failed`;

  if (!logPath || !existsSync(logPath)) {
    annotate({
      level,
      title,
      message: `The step failed and no build log was found at "${logPath ?? '<missing path>'}".`
    });
    return;
  }

  const summary = extractFailureSummary(readFileSync(logPath, 'utf8'));

  annotate({
    level,
    title,
    message: fitToAnnotationLimit(summary, { level, title })
  });
  if (level === 'error') writeStepSummary(summary, env.GITHUB_STEP_SUMMARY);
};

const isDirectRun =
  process.argv[1] &&
  import.meta.url === pathToFileURL(realpathSync(process.argv[1])).href;

if (isDirectRun) run(process.argv.slice(2));
