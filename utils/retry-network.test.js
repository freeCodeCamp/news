import { jest } from '@jest/globals';

import { withNetworkRetry } from './retry-network.js';

const transient = () => new TypeError('fetch failed');
const fatal = () => {
  const err = new TypeError('fetch failed', {
    cause: Object.assign(new Error('getaddrinfo ENOTFOUND nope'), {
      code: 'ENOTFOUND'
    })
  });
  return err;
};

const options = {
  label: 'Ghost posts fetch',
  target: 'page 3',
  file: 'utils/ghost/fetch-from-ghost.js',
  waitMs: 0
};

describe('Network retry wrapper:', () => {
  let logSpy;

  beforeEach(() => {
    logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => logSpy.mockRestore());

  test('Returns the operation result without retrying on success', async () => {
    const operation = jest.fn().mockResolvedValue('ok');

    await expect(withNetworkRetry(operation, options)).resolves.toBe('ok');
    expect(operation).toHaveBeenCalledTimes(1);
    expect(logSpy).not.toHaveBeenCalled();
  });

  test('Retries a transient failure and returns the later success', async () => {
    const operation = jest
      .fn()
      .mockRejectedValueOnce(transient())
      .mockResolvedValue('ok');

    await expect(withNetworkRetry(operation, options)).resolves.toBe('ok');
    expect(operation).toHaveBeenCalledTimes(2);
    expect(logSpy).toHaveBeenCalledTimes(1);
    expect(logSpy.mock.calls[0][0]).toContain('2 of 3 attempts left');
  });

  test('Stops after the attempt budget and reports the count', async () => {
    const operation = jest.fn().mockRejectedValue(transient());

    await expect(withNetworkRetry(operation, options)).rejects.toThrow(
      'Ghost posts fetch failed after 3 attempts on page 3. TypeError: fetch failed'
    );
    expect(operation).toHaveBeenCalledTimes(3);
  });

  test('Does not retry a non-retryable failure', async () => {
    const operation = jest.fn().mockRejectedValue(fatal());

    await expect(withNetworkRetry(operation, options)).rejects.toThrow(
      /failed with a non-retryable error on page 3/
    );
    expect(operation).toHaveBeenCalledTimes(1);
  });

  test('Preserves the original error as the cause', async () => {
    const original = fatal();
    const operation = jest.fn().mockRejectedValue(original);

    await expect(withNetworkRetry(operation, options)).rejects.toHaveProperty(
      'cause',
      original
    );
  });

  test('Waits the configured interval between attempts', async () => {
    const sleep = jest.fn().mockResolvedValue(undefined);
    const operation = jest
      .fn()
      .mockRejectedValueOnce(transient())
      .mockResolvedValue('ok');

    await withNetworkRetry(operation, { ...options, waitMs: 60000, sleep });

    expect(sleep).toHaveBeenCalledWith(60000);
  });

  test('Rejects a non-finite attempt budget instead of spinning', async () => {
    const operation = jest.fn().mockRejectedValue(transient());

    await expect(
      withNetworkRetry(operation, { ...options, attempts: Infinity })
    ).rejects.toThrow(/positive whole number of attempts/);
    expect(operation).not.toHaveBeenCalled();
  });

  test('Rejects missing annotation text instead of logging "undefined"', async () => {
    await expect(withNetworkRetry(jest.fn())).rejects.toThrow(
      /needs a label and a target/
    );
  });

  test('Honours a custom attempt budget', async () => {
    const operation = jest.fn().mockRejectedValue(transient());

    await expect(
      withNetworkRetry(operation, { ...options, attempts: 2 })
    ).rejects.toThrow(/after 2 attempts/);
    expect(operation).toHaveBeenCalledTimes(2);
  });

  test('Keeps a huge error detail readable and diagnostic', async () => {
    const inner = new Error(`socket died ${'y'.repeat(20000)}`);
    inner.code = 'ECONNRESET';
    const huge = new Error(`GraphQL Error (Code: 502): ${'x'.repeat(20000)}`, {
      cause: inner
    });
    huge.response = { status: 502 };
    const operation = jest.fn().mockRejectedValue(huge);

    const thrown = await withNetworkRetry(operation, {
      ...options,
      attempts: 1
    }).catch(error => error);

    expect(thrown.message).toContain(
      'Ghost posts fetch failed after 1 attempt on page 3.'
    );
    expect(thrown.message).toContain('(HTTP 502)');
    expect(thrown.message).toContain('caused by: Error [ECONNRESET]:');
    expect(thrown.message).toContain('... (truncated)');
    expect(thrown.message.length).toBeLessThan(600);
    expect(thrown.cause).toBe(huge);

    const [annotation] = logSpy.mock.calls.at(-1);
    expect(annotation.length).toBeLessThan(600);
  });

  test('Leaves a short error detail intact', async () => {
    const operation = jest.fn().mockRejectedValue(transient());

    const thrown = await withNetworkRetry(operation, {
      ...options,
      attempts: 1
    }).catch(error => error);

    expect(thrown.message).toBe(
      'Ghost posts fetch failed after 1 attempt on page 3. TypeError: fetch failed'
    );
  });

  test('Pluralises the attempt count in the retry warning', async () => {
    const operation = jest
      .fn()
      .mockRejectedValueOnce(transient())
      .mockResolvedValue('ok');

    await withNetworkRetry(operation, { ...options, attempts: 2 });

    expect(logSpy.mock.calls[0][0]).toContain('1 of 2 attempts left');
  });
});
