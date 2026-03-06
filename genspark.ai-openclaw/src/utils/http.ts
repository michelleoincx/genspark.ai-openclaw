import {
  GenSparkAPIError,
  GenSparkAuthError,
  GenSparkNetworkError,
  GenSparkRateLimitError,
  GenSparkTimeoutError,
} from "../errors/index.js";

export function buildHeaders(
  token: string,
  extra: Record<string, string> = {}
): Record<string, string> {
  return {
    "Content-Type": "application/json",
    Accept: "application/json, text/event-stream",
    Authorization: `Bearer ${token}`,
    "User-Agent": "genspark-openclaw/0.1.0 (https://github.com/openclaw/genspark.ai-openclaw)",
    "X-Requested-With": "XMLHttpRequest",
    ...extra,
  };
}

export async function handleResponse<T>(response: Response): Promise<T> {
  if (response.status === 401) throw new GenSparkAuthError();

  if (response.status === 429) {
    const retryAfter = response.headers.get("Retry-After");
    throw new GenSparkRateLimitError(
      retryAfter ? parseInt(retryAfter, 10) * 1000 : undefined
    );
  }

  if (!response.ok) {
    let body: unknown;
    try {
      body = await response.json();
    } catch {
      body = await response.text();
    }
    throw GenSparkAPIError.fromResponse(response.status, body);
  }

  try {
    return (await response.json()) as T;
  } catch (err) {
    throw new GenSparkAPIError({
      code: "PARSE_ERROR",
      message: "Failed to parse JSON response",
      status: response.status,
    });
  }
}

export async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number
): Promise<T> {
  let timer: ReturnType<typeof setTimeout>;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new GenSparkTimeoutError(timeoutMs)), timeoutMs);
  });

  try {
    const result = await Promise.race([promise, timeout]);
    clearTimeout(timer!);
    return result;
  } catch (err) {
    clearTimeout(timer!);
    throw err;
  }
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number,
  delay: number
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;

      // Don't retry on auth/client errors
      if (
        err instanceof GenSparkAuthError ||
        (err instanceof GenSparkAPIError &&
          err.status >= 400 &&
          err.status < 500 &&
          err.status !== 429)
      ) {
        throw err;
      }

      if (attempt < maxRetries) {
        const backoff =
          err instanceof GenSparkRateLimitError && err.retryAfter
            ? err.retryAfter
            : delay * Math.pow(2, attempt);

        await sleep(backoff);
      }
    }
  }

  throw lastError;
}

export function wrapFetchError(err: unknown): never {
  if (err instanceof GenSparkAPIError) throw err;
  if (err instanceof GenSparkTimeoutError) throw err;
  if (err instanceof Error) {
    throw new GenSparkNetworkError(err.message, err);
  }
  throw new GenSparkNetworkError("Unknown network error");
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
