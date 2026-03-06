import type { StreamChunk } from "../types/index.js";

/**
 * Parses a Server-Sent Events (SSE) stream from a Response body
 * and yields structured StreamChunk objects.
 */
export async function* parseSSEStream(
  response: Response
): AsyncGenerator<StreamChunk> {
  if (!response.body) {
    throw new Error("Response body is null — cannot parse SSE stream");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let index = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith(":")) continue; // heartbeat / comment

        if (trimmed.startsWith("data: ")) {
          const raw = trimmed.slice(6);

          if (raw === "[DONE]") {
            yield { type: "done", data: null, index: index++ };
            return;
          }

          try {
            const parsed = JSON.parse(raw);
            yield* parseChunk(parsed, index++);
          } catch {
            // Plain text delta
            yield { type: "text", data: raw, index: index++ };
          }
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}

function* parseChunk(
  parsed: Record<string, unknown>,
  index: number
): Generator<StreamChunk> {
  if (parsed.type === "text_delta" || typeof parsed.text === "string") {
    yield {
      type: "text",
      data: (parsed.text ?? parsed.delta ?? "") as string,
      index,
    };
  } else if (parsed.type === "citation") {
    yield { type: "citation", data: parsed as unknown as StreamChunk["data"], index };
  } else if (parsed.type === "search_result") {
    yield {
      type: "search_result",
      data: parsed as unknown as StreamChunk["data"],
      index,
    };
  } else if (parsed.type === "error") {
    yield {
      type: "error",
      data: (parsed.message ?? "Stream error") as string,
      index,
    };
  }
}

/**
 * Convenience helper: collect all text chunks into a single string
 */
export async function collectStream(
  stream: AsyncGenerator<StreamChunk>
): Promise<string> {
  const parts: string[] = [];
  for await (const chunk of stream) {
    if (chunk.type === "text" && typeof chunk.data === "string") {
      parts.push(chunk.data);
    }
  }
  return parts.join("");
}
