/**
 * Database utility functions with retry logic and concurrent query limiting
 */

const DEFAULT_MAX_RETRIES = 3;
const DEFAULT_INITIAL_DELAY = 100; // ms

/**
 * Retry logic with exponential backoff for database operations
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options?: {
    maxRetries?: number;
    initialDelayMs?: number;
    maxDelayMs?: number;
    shouldRetry?: (error: Error) => boolean;
  },
): Promise<T> {
  const maxRetries = options?.maxRetries ?? DEFAULT_MAX_RETRIES;
  const initialDelay = options?.initialDelayMs ?? DEFAULT_INITIAL_DELAY;
  const maxDelay = options?.maxDelayMs ?? 5000;
  const shouldRetry = options?.shouldRetry ?? isRetryableError;

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Don't retry if error is not retryable
      if (!shouldRetry(lastError)) {
        throw lastError;
      }

      // Don't retry if we've exhausted retries
      if (attempt === maxRetries) {
        throw lastError;
      }

      // Exponential backoff with jitter
      const delay = Math.min(initialDelay * Math.pow(2, attempt), maxDelay);
      const jitter = Math.random() * delay * 0.1; // 10% jitter
      await new Promise((resolve) => setTimeout(resolve, delay + jitter));
    }
  }

  throw lastError || new Error("Unknown error");
}

/**
 * Check if an error is retryable (transient vs permanent)
 */
function isRetryableError(error: Error): boolean {
  const message = error.message.toLowerCase();

  // Retryable errors: connection issues, timeouts, pool exhaustion
  const retryablePatterns = [
    "connection",
    "timeout",
    "econnrefused",
    "econnreset",
    "pool",
    "too many clients",
    "temporarily unavailable",
    "temporarily_unavailable",
    "timed out",
    "socket hang up",
    "broken pipe",
  ];

  return retryablePatterns.some((pattern) => message.includes(pattern));
}

/**
 * Limit concurrent promise executions
 */
export async function withConcurrencyLimit<T>(
  tasks: Array<() => Promise<T>>,
  limit: number = 5,
): Promise<T[]> {
  const results: T[] = [];
  const executing: Promise<void>[] = [];

  for (const task of tasks) {
    const promise = Promise.resolve()
      .then(task)
      .then((result) => {
        results.push(result);
      });

    executing.push(promise);

    if (executing.length >= limit) {
      await Promise.race(executing);
      executing.splice(
        executing.findIndex((p) => p === promise),
        1,
      );
    }
  }

  await Promise.all(executing);
  return results;
}

/**
 * Execute with concurrency limit and retry logic
 */
export async function withConcurrencyAndRetry<T>(
  tasks: Array<() => Promise<T>>,
  options?: {
    concurrencyLimit?: number;
    maxRetries?: number;
    initialDelayMs?: number;
  },
): Promise<T[]> {
  const concurrencyLimit = options?.concurrencyLimit ?? 5;
  const tasksWithRetry = tasks.map(
    (task) => () =>
      withRetry(task, {
        maxRetries: options?.maxRetries,
        initialDelayMs: options?.initialDelayMs,
      }),
  );

  return withConcurrencyLimit(tasksWithRetry, concurrencyLimit);
}

/**
 * Handle query errors with logging and fallback
 */
export function handleQueryError(
  error: Error,
  context: string,
  fallbackValue: unknown = null,
): unknown {
  console.error(`[DB Query Error] ${context}:`, error.message, error.cause);
  return fallbackValue;
}
