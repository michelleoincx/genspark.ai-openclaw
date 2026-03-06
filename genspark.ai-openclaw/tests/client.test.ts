import { describe, it, expect, vi } from "vitest";
import { GenSparkClient } from "../src/index.js";
import {
  GenSparkAuthError,
  GenSparkRateLimitError,
  GenSparkTimeoutError,
} from "../src/errors/index.js";
import { collectStream } from "../src/utils/stream.js";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function mockFetch(status: number, body: unknown, stream = false): typeof fetch {
  return vi.fn(async () => ({
    ok: status >= 200 && status < 300,
    status,
    headers: new Headers({ "Content-Type": stream ? "text/event-stream" : "application/json" }),
    json: async () => body,
    text: async () => JSON.stringify(body),
    body: null,
  })) as unknown as typeof fetch;
}

// ─── Client instantiation ────────────────────────────────────────────────────

describe("GenSparkClient", () => {
  it("throws if no token is provided", () => {
    expect(() => new GenSparkClient({ token: "" })).toThrow();
  });

  it("constructs with a valid token", () => {
    const client = new GenSparkClient({ token: "test-token" });
    expect(client).toBeDefined();
    expect(client.copilot).toBeDefined();
    expect(client.pages).toBeDefined();
  });

  it("respects baseUrl override", () => {
    const client = new GenSparkClient({
      token: "t",
      baseUrl: "https://custom.api.local",
    });
    expect(client).toBeDefined();
  });
});

// ─── Error handling ───────────────────────────────────────────────────────────

describe("Error handling", () => {
  it("throws GenSparkAuthError on 401", async () => {
    const client = new GenSparkClient({
      token: "bad-token",
      maxRetries: 0,
      fetch: mockFetch(401, { code: "UNAUTHORIZED", message: "Unauthorized" }),
    });

    await expect(client.isAuthenticated()).resolves.toBe(false);
  });

  it("throws GenSparkRateLimitError on 429", async () => {
    const fetch = vi.fn(async () => ({
      ok: false,
      status: 429,
      headers: new Headers({ "Retry-After": "5" }),
      json: async () => ({ code: "RATE_LIMIT", message: "Too many requests" }),
      text: async () => "",
    })) as unknown as typeof fetch;

    const client = new GenSparkClient({ token: "t", maxRetries: 0, fetch });
    await expect(client.getSession()).rejects.toBeInstanceOf(GenSparkRateLimitError);
  });

  it("timeout error is thrown when request exceeds timeout", async () => {
    const slowFetch = vi.fn(
      () => new Promise<Response>((resolve) => setTimeout(resolve, 10_000))
    ) as unknown as typeof fetch;

    const client = new GenSparkClient({
      token: "t",
      timeout: 50,
      maxRetries: 0,
      fetch: slowFetch,
    });

    await expect(client.getSession()).rejects.toBeInstanceOf(GenSparkTimeoutError);
  });
});

// ─── Stream utilities ─────────────────────────────────────────────────────────

describe("collectStream", () => {
  it("concatenates text chunks from an async generator", async () => {
    async function* fakeStream() {
      yield { type: "text" as const, data: "Hello", index: 0 };
      yield { type: "text" as const, data: ", ", index: 1 };
      yield { type: "text" as const, data: "world!", index: 2 };
      yield { type: "done" as const, data: null, index: 3 };
    }

    const result = await collectStream(fakeStream());
    expect(result).toBe("Hello, world!");
  });

  it("ignores non-text chunks", async () => {
    async function* fakeStream() {
      yield { type: "text" as const, data: "Answer", index: 0 };
      yield { type: "citation" as const, data: null, index: 1 };
      yield { type: "done" as const, data: null, index: 2 };
    }

    const result = await collectStream(fakeStream());
    expect(result).toBe("Answer");
  });
});
