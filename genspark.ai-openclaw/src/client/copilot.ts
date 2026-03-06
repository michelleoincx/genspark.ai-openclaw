import type {
  CopilotRequest,
  CopilotResponse,
  StreamChunk,
} from "../types/index.js";
import { BaseClient } from "./base.js";
import { parseSSEStream, collectStream } from "../utils/stream.js";

export class CopilotClient extends BaseClient {
  /**
   * Send a message and receive the full response (non-streaming).
   */
  async chat(request: CopilotRequest): Promise<CopilotResponse> {
    const stream = await this.stream({ ...request, stream: true });
    const content = await collectStream(stream);

    return {
      id: crypto.randomUUID(),
      content,
      finishReason: "stop",
      createdAt: Date.now(),
    };
  }

  /**
   * Send a message and receive a streaming response as an async generator.
   * Each yielded value is a StreamChunk (text delta, citation, search result, etc.)
   */
  async *stream(request: CopilotRequest): AsyncGenerator<StreamChunk> {
    const response = await this.postStream("/api/copilot/ask", {
      query: request.query,
      messages: request.messages ?? [],
      agent_type: request.agentType ?? "default",
      stream: true,
    });

    yield* parseSSEStream(response);
  }

  /**
   * Helper: stream and print to stdout in real-time, return final text.
   */
  async streamToConsole(request: CopilotRequest): Promise<string> {
    const parts: string[] = [];
    process.stdout.write("\n");

    for await (const chunk of this.stream(request)) {
      if (chunk.type === "text" && typeof chunk.data === "string") {
        process.stdout.write(chunk.data);
        parts.push(chunk.data);
      }
    }

    process.stdout.write("\n");
    return parts.join("");
  }
}
