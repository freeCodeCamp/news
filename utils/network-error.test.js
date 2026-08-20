import {
  describeNetworkError,
  isTransientNetworkError
} from './network-error.js';

const undiciFetchFailed = causeMessage => {
  const cause = new Error(causeMessage);
  return new TypeError('fetch failed', { cause });
};

const withCode = (message, code) => {
  const err = new Error(message);
  err.code = code;
  return err;
};

describe('Network error helpers:', () => {
  describe('isTransientNetworkError', () => {
    test('Bare undici "fetch failed" is transient', () => {
      expect(isTransientNetworkError(new TypeError('fetch failed'))).toBe(true);
    });

    test('Undici "terminated" body abort is transient', () => {
      expect(isTransientNetworkError(new TypeError('terminated'))).toBe(true);
    });

    test('Transient socket codes nested in the cause chain are transient', () => {
      ['ECONNRESET', 'ECONNREFUSED', 'ETIMEDOUT', 'EAI_AGAIN'].forEach(code => {
        const err = new TypeError('fetch failed', {
          cause: withCode('socket problem', code)
        });
        expect(isTransientNetworkError(err)).toBe(true);
      });
    });

    test('Undici timeout codes are transient', () => {
      ['UND_ERR_CONNECT_TIMEOUT', 'UND_ERR_HEADERS_TIMEOUT'].forEach(code => {
        const err = new TypeError('fetch failed', {
          cause: withCode('timeout', code)
        });
        expect(isTransientNetworkError(err)).toBe(true);
      });
    });

    test('5xx, 408 and 429 responses are transient', () => {
      [408, 429, 500, 502, 503].forEach(status => {
        const err = new Error('GraphQL error');
        err.response = { status };
        expect(isTransientNetworkError(err)).toBe(true);
      });
    });

    test('4xx responses other than 408 and 429 are not transient', () => {
      [400, 401, 403, 404].forEach(status => {
        const err = new Error('GraphQL error');
        err.response = { status };
        expect(isTransientNetworkError(err)).toBe(false);
      });
    });

    test('DNS and TLS failures are not transient', () => {
      ['ENOTFOUND', 'CERT_HAS_EXPIRED', 'ERR_TLS_CERT_ALTNAME_INVALID'].forEach(
        code => {
          const err = new TypeError('fetch failed', {
            cause: withCode('bad host', code)
          });
          expect(isTransientNetworkError(err)).toBe(false);
        }
      );
    });

    test('A message that merely contains a transient word is not transient', () => {
      expect(
        isTransientNetworkError(
          new Error('Publication has been terminated by the owner')
        )
      ).toBe(false);
      expect(
        isTransientNetworkError(new Error('The prefetch failed to warm'))
      ).toBe(false);
    });

    test('Dual-stack AggregateError children are inspected', () => {
      const child = withCode('connect ECONNREFUSED ::1:65001', 'ECONNREFUSED');
      const aggregate = new AggregateError([child], '');
      aggregate.code = 'ECONNREFUSED';

      expect(
        isTransientNetworkError(
          new TypeError('fetch failed', { cause: aggregate })
        )
      ).toBe(true);
    });

    test('A fatal code inside an AggregateError child wins', () => {
      const child = withCode('getaddrinfo ENOTFOUND nope', 'ENOTFOUND');
      const aggregate = new AggregateError([child], '');

      expect(
        isTransientNetworkError(
          new TypeError('fetch failed', { cause: aggregate })
        )
      ).toBe(false);
    });

    test('A fatal code in a wide AggregateError is still found', () => {
      const children = [
        ...Array.from({ length: 11 }, (_, i) =>
          withCode(`connect ECONNREFUSED 10.0.0.${i}:443`, 'ECONNREFUSED')
        ),
        withCode('getaddrinfo ENOTFOUND nope', 'ENOTFOUND')
      ];

      expect(
        isTransientNetworkError(
          new TypeError('fetch failed', {
            cause: new AggregateError(children, '')
          })
        )
      ).toBe(false);
    });

    test('Programmer errors are not transient', () => {
      expect(
        isTransientNetworkError(new TypeError('x is not a function'))
      ).toBe(false);
      expect(isTransientNetworkError(undefined)).toBe(false);
    });

    test('A self-referencing cause chain terminates', () => {
      const err = new TypeError('fetch failed');
      err.cause = err;
      expect(isTransientNetworkError(err)).toBe(true);
    });
  });

  describe('describeNetworkError', () => {
    test('Unwraps the cause chain into one line', () => {
      expect(describeNetworkError(undiciFetchFailed('other side closed'))).toBe(
        'TypeError: fetch failed -> caused by: Error: other side closed'
      );
    });

    test('Includes the error code when present', () => {
      const err = new TypeError('fetch failed', {
        cause: withCode('read ECONNRESET', 'ECONNRESET')
      });
      expect(describeNetworkError(err)).toBe(
        'TypeError: fetch failed -> caused by: Error [ECONNRESET]: read ECONNRESET'
      );
    });

    test('Includes the HTTP status when present', () => {
      const err = new Error('Bad gateway');
      err.response = { status: 502 };
      expect(describeNetworkError(err)).toBe('Error (HTTP 502): Bad gateway');
    });

    test('Handles a non-Error throw', () => {
      expect(describeNetworkError('kaboom')).toBe('kaboom');
    });

    test('A self-referencing cause chain terminates', () => {
      const err = new TypeError('fetch failed');
      err.cause = err;
      expect(describeNetworkError(err)).toBe('TypeError: fetch failed');
    });

    test('Unwraps AggregateError children so the address is visible', () => {
      const child = withCode('connect ECONNREFUSED ::1:65001', 'ECONNREFUSED');
      const aggregate = new AggregateError([child], '');
      aggregate.code = 'ECONNREFUSED';
      const err = new TypeError('fetch failed', { cause: aggregate });

      expect(describeNetworkError(err)).toBe(
        'TypeError: fetch failed -> caused by: AggregateError [ECONNREFUSED] -> and: Error [ECONNREFUSED]: connect ECONNREFUSED ::1:65001'
      );
    });

    test('Renders AggregateError siblings as peers, not as a cause chain', () => {
      const aggregate = new AggregateError(
        [
          withCode('connect ECONNREFUSED ::1:443', 'ECONNREFUSED'),
          withCode('connect ECONNREFUSED 127.0.0.1:443', 'ECONNREFUSED')
        ],
        ''
      );

      expect(describeNetworkError(aggregate)).toBe(
        'AggregateError -> and: Error [ECONNREFUSED]: connect ECONNREFUSED ::1:443 -> and: Error [ECONNREFUSED]: connect ECONNREFUSED 127.0.0.1:443'
      );
    });

    test('Caps the rendered chain and counts the remainder', () => {
      const children = Array.from({ length: 12 }, (_, i) =>
        withCode(`connect ECONNREFUSED 10.0.0.${i}:443`, 'ECONNREFUSED')
      );
      const description = describeNetworkError(
        new TypeError('fetch failed', {
          cause: new AggregateError(children, '')
        })
      );

      expect(description.split(' -> ')).toHaveLength(7);
      expect(description).toContain('-> (+8 more) ->');
      expect(
        description.endsWith(
          'and: Error [ECONNREFUSED]: connect ECONNREFUSED 10.0.0.11:443'
        )
      ).toBe(true);
    });

    test('Keeps the innermost cause when the chain is elided', () => {
      let deepest = withCode('getaddrinfo ENOTFOUND gql.example', 'ENOTFOUND');
      for (let i = 0; i < 8; i++)
        deepest = new Error(`wrapper ${i}`, { cause: deepest });

      const description = describeNetworkError(deepest);

      expect(
        description.endsWith(
          'caused by: Error [ENOTFOUND]: getaddrinfo ENOTFOUND gql.example'
        )
      ).toBe(true);
    });

    test('Collapses an adjacent duplicate link', () => {
      const inner = withCode(
        'connect ECONNREFUSED 127.0.0.1:1',
        'ECONNREFUSED'
      );
      const outer = withCode(
        'connect ECONNREFUSED 127.0.0.1:1',
        'ECONNREFUSED'
      );
      outer.cause = inner;

      expect(describeNetworkError(outer)).toBe(
        'Error [ECONNREFUSED]: connect ECONNREFUSED 127.0.0.1:1'
      );
    });
  });
});
