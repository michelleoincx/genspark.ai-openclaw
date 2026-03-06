// ─── Core Request / Response Types ───────────────────────────────────────────

export interface GenSparkClientOptions {
  /** Session token or Bearer token extracted from browser cookies */
  token: string;
  /** Base URL override (default: https://www.genspark.ai) */
  baseUrl?: string;
  /** Request timeout in milliseconds (default: 60000) */
  timeout?: number;
  /** Max retry attempts on transient errors (default: 3) */
  maxRetries?: number;
  /** Retry delay in milliseconds (default: 1000) */
  retryDelay?: number;
  /** Custom fetch implementation */
  fetch?: typeof fetch;
  /** Extra headers to attach to every request */
  extraHeaders?: Record<string, string>;
  /** Enable verbose debug logging */
  debug?: boolean;
}

// ─── Chat / Copilot ───────────────────────────────────────────────────────────

export type Role = "user" | "assistant" | "system";

export interface ChatMessage {
  role: Role;
  content: string;
}

export interface CopilotRequest {
  query: string;
  /** Conversation history for multi-turn sessions */
  messages?: ChatMessage[];
  /** Whether to stream the response (default: true) */
  stream?: boolean;
  /** Agent type to invoke */
  agentType?: AgentType;
}

export type AgentType =
  | "default"
  | "research"
  | "code"
  | "summarize"
  | "translate"
  | "creative";

export interface CopilotResponse {
  id: string;
  content: string;
  citations?: Citation[];
  searchResults?: SearchResult[];
  finishReason: "stop" | "length" | "error";
  usage?: TokenUsage;
  createdAt: number;
}

export interface StreamChunk {
  type: "text" | "citation" | "search_result" | "done" | "error";
  data: string | Citation | SearchResult | null;
  index: number;
}

// ─── Search ───────────────────────────────────────────────────────────────────

export interface SearchResult {
  title: string;
  url: string;
  snippet: string;
  favicon?: string;
  publishedAt?: string;
}

export interface Citation {
  index: number;
  url: string;
  title: string;
  text: string;
}

// ─── Spark Pages ─────────────────────────────────────────────────────────────

export interface SparkPage {
  id: string;
  title: string;
  slug: string;
  content: string;
  summary?: string;
  tags: string[];
  visibility: "public" | "private" | "unlisted";
  author: UserInfo;
  views: number;
  likes: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSparkPageRequest {
  title: string;
  query: string;
  tags?: string[];
  visibility?: SparkPage["visibility"];
}

// ─── Agents ───────────────────────────────────────────────────────────────────

export interface AgentTask {
  id: string;
  type: AgentType;
  status: "pending" | "running" | "completed" | "failed";
  input: string;
  output?: string;
  steps?: AgentStep[];
  createdAt: string;
  completedAt?: string;
}

export interface AgentStep {
  id: string;
  type: "search" | "read" | "reason" | "write" | "tool_call";
  description: string;
  result?: string;
  timestamp: string;
}

// ─── User & Session ───────────────────────────────────────────────────────────

export interface UserInfo {
  id: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
  isPro: boolean;
}

export interface SessionInfo {
  user: UserInfo;
  expiresAt: string;
  scopes: string[];
}

// ─── Misc ─────────────────────────────────────────────────────────────────────

export interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface GenSparkError {
  code: string;
  message: string;
  status: number;
  details?: unknown;
}
