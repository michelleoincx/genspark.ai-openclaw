export { GenSparkClient } from "./client/index.js";
export { CopilotClient } from "./client/copilot.js";
export { PagesClient } from "./client/pages.js";
export { BaseClient } from "./client/base.js";

export {
  GenSparkAPIError,
  GenSparkAuthError,
  GenSparkRateLimitError,
  GenSparkTimeoutError,
  GenSparkNetworkError,
} from "./errors/index.js";

export { parseSSEStream, collectStream } from "./utils/stream.js";

export type {
  GenSparkClientOptions,
  ChatMessage,
  CopilotRequest,
  CopilotResponse,
  StreamChunk,
  SearchResult,
  Citation,
  SparkPage,
  CreateSparkPageRequest,
  AgentTask,
  AgentStep,
  AgentType,
  UserInfo,
  SessionInfo,
  TokenUsage,
  PaginatedResponse,
  GenSparkError,
  Role,
} from "./types/index.js";
