import type { GenSparkClientOptions } from "../types/index.js";
import {
  buildHeaders,
  handleResponse,
  withRetry,
  withTimeout,
  wrapFetchError,
} from "../utils/http.js";

const DEFAULT_BASE_URL = "https://www.genspark.ai";
const DEFAULT_TIMEOUT = 60_000;
const DEFAULT_MAX_RETRIES = 3;
const DEFAULT_RETRY_DELAY = 1_000;

export class BaseClient {
  protected readonly token: string;
  protected readonly baseUrl: string;
  protected readonly timeout: number;
  protected readonly maxRetries: number;
  protected readonly retryDelay: number;
  protected readonly extraHeaders: Record<string, string>;
  protected readonly debug: boolean;
  private readonly _fetch: typeof fetch;

  constructor(options: GenSparkClientOptions) {
    if (!options.token) {
      throw new Error(
        "[openclaw] A token is required. Extract your session cookie from the browser's DevTools while logged into genspark.ai."
      );
    }

    this.token = options.token;
    this.baseUrl = (options.baseUrl ?? DEFAULT_BASE_URL).replace(/\/$/, "");
    this.timeout = options.timeout ?? DEFAULT_TIMEOUT;
    this.maxRetries = options.maxRetries ?? DEFAULT_MAX_RETRIES;
    this.retryDelay = options.retryDelay ?? DEFAULT_RETRY_DELAY;
    this.extraHeaders = options.extraHeaders ?? {};
    this.debug = options.debug ?? false;
    this._fetch = options.fetch ?? fetch;
  }

  protected async get<T>(path: string, params?: Record<string, string>): Promise<T> {
    const url = this.buildUrl(path, params);
    this.log("GET", url);

    return withRetry(
      async () => {
        try {
          const response = await withTimeout(
            this._fetch(url, {
              method: "GET",
              headers: buildHeaders(this.token, this.extraHeaders),
            }),
            this.timeout
          );
          return handleResponse<T>(response);
        } catch (err) {
          wrapFetchError(err);
        }
      },
      this.maxRetries,
      this.retryDelay
    );
  }

  protected async post<T>(path: string, body: unknown): Promise<T> {
    const url = this.buildUrl(path);
    this.log("POST", url, body);

    return withRetry(
      async () => {
        try {
          const response = await withTimeout(
            this._fetch(url, {
              method: "POST",
              headers: buildHeaders(this.token, this.extraHeaders),
              body: JSON.stringify(body),
            }),
            this.timeout
          );
          return handleResponse<T>(response);
        } catch (err) {
          wrapFetchError(err);
        }
      },
      this.maxRetries,
      this.retryDelay
    );
  }

  protected async postStream(path: string, body: unknown): Promise<Response> {
    const url = this.buildUrl(path);
    this.log("POST (stream)", url, body);

    try {
      const response = await withTimeout(
        this._fetch(url, {
          method: "POST",
          headers: {
            ...buildHeaders(this.token, this.extraHeaders),
            Accept: "text/event-stream",
          },
          body: JSON.stringify(body),
        }),
        this.timeout
      );

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Stream request failed (${response.status}): ${text}`);
      }

      return response;
    } catch (err) {
      wrapFetchError(err);
    }
  }

  private buildUrl(path: string, params?: Record<string, string>): string {
    const url = new URL(`${this.baseUrl}${path}`);
    if (params) {
      for (const [key, value] of Object.entries(params)) {
        url.searchParams.set(key, value);
      }
    }
    return url.toString();
  }

  private log(method: string, url: string, body?: unknown): void {
    if (!this.debug) return;
    console.debug(`[openclaw] ${method} ${url}`);
    if (body) console.debug("[openclaw] body:", JSON.stringify(body, null, 2));
  }
}
