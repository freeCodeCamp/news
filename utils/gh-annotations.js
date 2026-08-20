const LEVELS = new Set(['error', 'warning', 'notice']);

// Escaping rules: https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-commands#example-setting-an-error-message
const escapeData = value =>
  String(value)
    .replace(/%/g, '%25')
    .replace(/\r/g, '%0D')
    .replace(/\n/g, '%0A');

const escapeProperty = value =>
  escapeData(value).replace(/:/g, '%3A').replace(/,/g, '%2C');

const assertLevel = level => {
  if (!LEVELS.has(level))
    throw new Error(
      `Unsupported annotation level "${level}". Use one of: ${[...LEVELS].join(', ')}.`
    );
};

export const isAnnotationLevel = level => LEVELS.has(level);

export const formatAnnotation = ({ level, title, file, message }) => {
  assertLevel(level);

  const properties = Object.entries({ title, file })
    .filter(([, value]) => value !== undefined && value !== null)
    .map(([key, value]) => `${key}=${escapeProperty(value)}`)
    .join(',');

  return `::${level}${properties ? ` ${properties}` : ''}::${escapeData(message)}`;
};

export const annotate = ({ level, title, file, message }) => {
  assertLevel(level);

  if (process.env.GITHUB_ACTIONS === 'true') {
    console.log(formatAnnotation({ level, title, file, message }));
    return;
  }

  const location = file ? ` (${file})` : '';
  const prefix = title ? `${title}${location}: ` : '';
  console.log(`${level.toUpperCase()}: ${prefix}${message}`);
};
