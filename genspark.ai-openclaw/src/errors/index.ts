import type { GenSparkError } from "../types/index.js";

export class GenSparkAPIError extends Error {
  readonly code: string;
  readonly status: number;
  readonly details?: unknown;

  constructor(error: GenSparkError) {
    super(error.message);
    this.name = "GenSparkAPIError";
    this.code = error.code;
    this.status = error.status;
    this.details = error.details;
  }

  static fromResponse(status: number, body: unknown): GenSparkAPIError {
    if (
      typeof body === "object" &&
      body !== null &&
      "message" in body &&
      "code" in body
    ) {
      return new GenSparkAPIError({
        code: String((body as Record<string, unknown>).code),
        message: String((body as Record<string, unknown>).message),
        status,
        details: (body as Record<string, unknown>).details,
      });
    }
    return new GenSparkAPIError({
      code: "UNKNOWN_ERROR",
      message: `HTTP ${status}: Unexpected response format`,
      status,
      details: body,
    });
  }
}

export class GenSparkAuthError extends GenSparkAPIError {
  constructor(message = "Invalid or expired token. Please re-authenticate.") {
    super({ code: "AUTH_ERROR", message, status: 401 });
    this.name = "GenSparkAuthError";
  }
}

export class GenSparkRateLimitError extends GenSparkAPIError {
  readonly retryAfter?: number;

  constructor(retryAfter?: number) {
    super({
      code: "RATE_LIMIT",
      message: "Rate limit exceeded. Please slow down your requests.",
      status: 429,
    });
    this.name = "GenSparkRateLimitError";
    this.retryAfter = retryAfter;
  }
}

export class GenSparkTimeoutError extends Error {
  constructor(timeoutMs: number) {
    super(`Request timed out after ${timeoutMs}ms`);
    this.name = "GenSparkTimeoutError";
  }
}

export class GenSparkNetworkError extends Error {
  readonly cause?: Error;

  constructor(message: string, cause?: Error) {
    super(message);
    this.name = "GenSparkNetworkError";
    this.cause = cause;
  }
}
