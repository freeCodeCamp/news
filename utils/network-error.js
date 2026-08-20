const TRANSIENT_CODES = new Set([
  'EAI_AGAIN',
  'ECONNABORTED',
  'ECONNREFUSED',
  'ECONNRESET',
  'EHOSTUNREACH',
  'ENETDOWN',
  'ENETRESET',
  'ENETUNREACH',
  'EPIPE',
  'ETIMEDOUT',
  'UND_ERR_ABORTED',
  'UND_ERR_BODY_TIMEOUT',
  'UND_ERR_CONNECT_TIMEOUT',
  'UND_ERR_HEADERS_TIMEOUT',
  'UND_ERR_SOCKET'
]);

const FATAL_CODES = new Set([
  'CERT_HAS_EXPIRED',
  'DEPTH_ZERO_SELF_SIGNED_CERT',
  'ENOTFOUND',
  'ERR_TLS_CERT_ALTNAME_INVALID',
  'SELF_SIGNED_CERT_IN_CHAIN',
  'UNABLE_TO_VERIFY_LEAF_SIGNATURE'
]);

const TRANSIENT_MESSAGE_PATTERNS = [
  /^fetch failed$/i,
  /^terminated$/i,
  /^socket hang up$/i,
  /^other side closed$/i,
  /^client network socket disconnected/i,
  /^request to \S+ failed, reason:/i
];

const TRANSIENT_STATUSES = new Set([408, 425, 429]);

const MAX_CHAIN_NODES = 64;
const MAX_DESCRIBED_NODES = 6;

const flattenCauses = error => {
  const chain = [];
  const seen = new Set();
  const queue = [{ link: error, via: 'root' }];

  while (queue.length && chain.length < MAX_CHAIN_NODES) {
    const { link, via } = queue.shift();
    if (!link || typeof link !== 'object' || seen.has(link)) continue;

    seen.add(link);
    chain.push({ link, via });

    if (link.cause) queue.push({ link: link.cause, via: 'cause' });
    if (Array.isArray(link.errors))
      queue.push(
        ...link.errors.map(child => ({ link: child, via: 'sibling' }))
      );
  }

  return chain;
};

const getStatus = error =>
  error?.response?.status ?? error?.status ?? error?.statusCode ?? null;

const isTransientStatus = status =>
  status != null && (status >= 500 || TRANSIENT_STATUSES.has(status));

const matchesTransientMessage = message =>
  typeof message === 'string' &&
  TRANSIENT_MESSAGE_PATTERNS.some(pattern => pattern.test(message.trim()));

export const isTransientNetworkError = error => {
  const chain = flattenCauses(error).map(({ link }) => link);
  if (!chain.length) return false;

  if (chain.some(link => FATAL_CODES.has(link.code))) return false;
  if (chain.some(link => TRANSIENT_CODES.has(link.code))) return true;

  const status = chain.map(getStatus).find(value => value != null) ?? null;
  if (status != null) return isTransientStatus(status);

  return chain.some(link => matchesTransientMessage(link.message));
};

export const describeNetworkError = error => {
  if (!error || typeof error !== 'object') return String(error);

  const labelled = flattenCauses(error).map(({ link, via }) => {
    const name = link.name ?? 'Error';
    const code = link.code ? ` [${link.code}]` : '';
    const status = getStatus(link);
    const statusText = status != null ? ` (HTTP ${status})` : '';
    const message = link.message ?? String(link);

    return {
      via,
      label: message
        ? `${name}${code}${statusText}: ${message}`
        : `${name}${code}${statusText}`
    };
  });

  const chain = labelled.filter(
    (entry, index) => index === 0 || entry.label !== labelled[index - 1].label
  );

  const render = (entry, index) => {
    if (index === 0) return entry.label;
    return entry.via === 'sibling'
      ? `and: ${entry.label}`
      : `caused by: ${entry.label}`;
  };

  if (chain.length <= MAX_DESCRIBED_NODES)
    return chain.map(render).join(' -> ');

  const head = chain.slice(0, MAX_DESCRIBED_NODES - 1).map(render);
  const last = render(chain[chain.length - 1], chain.length - 1);
  const omitted = chain.length - MAX_DESCRIBED_NODES;

  return `${head.join(' -> ')} -> (+${omitted} more) -> ${last}`;
};
