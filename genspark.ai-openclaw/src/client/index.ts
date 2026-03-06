import type { GenSparkClientOptions, SessionInfo } from "../types/index.js";
import { BaseClient } from "./base.js";
import { CopilotClient } from "./copilot.js";
import { PagesClient } from "./pages.js";

/**
 * The main GenSpark OpenClaw client.
 *
 * @example
 * ```ts
 * import { GenSparkClient } from "genspark-openclaw";
 *
 * const client = new GenSparkClient({ token: "your-session-token" });
 *
 * // Single-turn chat
 * const response = await client.copilot.chat({ query: "What is the speed of light?" });
 * console.log(response.content);
 *
 * // Streaming
 * for await (const chunk of client.copilot.stream({ query: "Explain quantum computing" })) {
 *   if (chunk.type === "text") process.stdout.write(chunk.data as string);
 * }
 * ```
 */
export class GenSparkClient extends BaseClient {
  /** Access copilot / chat endpoints */
  readonly copilot: CopilotClient;

  /** Access Spark Pages endpoints */
  readonly pages: PagesClient;

  constructor(options: GenSparkClientOptions) {
    super(options);
    this.copilot = new CopilotClient(options);
    this.pages = new PagesClient(options);
  }

  /**
   * Verify the token and return session information.
   */
  async getSession(): Promise<SessionInfo> {
    return this.get<SessionInfo>("/api/auth/session");
  }

  /**
   * Check if the current token is valid.
   */
  async isAuthenticated(): Promise<boolean> {
    try {
      await this.getSession();
      return true;
    } catch {
      return false;
    }
  }
}
