import { wait } from './wait.js';
import { annotate } from './gh-annotations.js';
import {
  describeNetworkError,
  isTransientNetworkError
} from './network-error.js';

const DEFAULT_ATTEMPTS = 3;
const DEFAULT_WAIT_MS = 60000;

const pluralAttempts = count => `${count} attempt${count === 1 ? '' : 's'}`;

export const withNetworkRetry = async (
  operation,
  {
    label,
    target,
    file,
    attempts = DEFAULT_ATTEMPTS,
    waitMs = DEFAULT_WAIT_MS,
    sleep = wait
  } = {}
) => {
  if (!label || !target)
    throw new Error(
      'withNetworkRetry needs a label and a target to describe its annotations.'
    );

  if (!Number.isInteger(attempts) || attempts < 1)
    throw new Error(
      `withNetworkRetry needs a positive whole number of attempts, received ${attempts}.`
    );

  for (let attempt = 1; ; attempt++) {
    try {
      return await operation();
    } catch (error) {
      const detail = describeNetworkError(error);
      const transient = isTransientNetworkError(error);
      const attemptsLeft = attempts - attempt;

      if (transient && attemptsLeft > 0) {
        annotate({
          level: 'warning',
          title: `${label} retry`,
          file,
          message: `${label} hit a transient failure on ${target}. ${detail}. Retrying in ${Math.round(waitMs / 1000)}s, ${attemptsLeft} of ${pluralAttempts(attempts)} left.`
        });
        await sleep(waitMs);
        continue;
      }

      const reason = transient
        ? `after ${pluralAttempts(attempts)}`
        : 'with a non-retryable error';
      const summary = `${label} failed ${reason} on ${target}. ${detail}`;

      annotate({
        level: 'error',
        title: `${label} failed`,
        file,
        message: summary
      });

      throw new Error(summary, { cause: error });
    }
  }
};
