# 🦞 genspark.ai-openclaw

> Unofficial open-source TypeScript client for the [GenSpark.ai](https://www.genspark.ai) API — reverse-engineered, fully typed, and community-driven.

[![CI](https://github.com/openclaw/genspark.ai-openclaw/actions/workflows/ci.yml/badge.svg)](https://github.com/openclaw/genspark.ai-openclaw/actions)
[![npm version](https://img.shields.io/npm/v/genspark-openclaw)](https://www.npmjs.com/package/genspark-openclaw)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D18-green.svg)](https://nodejs.org/)

---

## ⚠️ Disclaimer

This is an **unofficial** project with **no affiliation** with GenSpark AI, Inc. It reverse-engineers the public web interface for interoperability purposes. Use responsibly and respect GenSpark's [Terms of Service](https://www.genspark.ai/terms). API endpoints may change without notice.

---

## ✨ Features

- 🔄 **Streaming & non-streaming** copilot chat with full SSE parsing
- 📄 **Spark Pages** — create, read, list, and delete AI-generated pages
- 🤖 **Agent types** — `research`, `code`, `summarize`, `translate`, `creative`, and more
- 🔁 **Automatic retries** with exponential backoff
- ⏱️ **Configurable timeouts**
- 🔒 **Fully typed** — strict TypeScript with zero `any`
- 🪶 **Zero heavy dependencies** — uses native `fetch`
- 🧪 **Unit-tested** with Vitest

---

## 📦 Installation

```bash
npm install genspark-openclaw
# or
pnpm add genspark-openclaw
# or
yarn add genspark-openclaw
```

> **Node.js ≥ 18** is required (uses native `fetch` and `ReadableStream`).

---

## 🔑 Authentication

GenSpark does not have a public API key system. You need to extract your **session token** from your browser after logging into [genspark.ai](https://www.genspark.ai):

1. Log in at [genspark.ai](https://www.genspark.ai)
2. Open DevTools → **Application** → **Cookies** → `www.genspark.ai`
3. Copy the value of the session cookie (usually `_ga_session` or similar)
4. Pass it as the `token` option

```ts
import { GenSparkClient } from "genspark-openclaw";

const client = new GenSparkClient({
  token: process.env.GENSPARK_TOKEN!,
});
```

---

## 🚀 Quick Start

### Single-turn chat

```ts
const response = await client.copilot.chat({
  query: "What is the difference between RAG and fine-tuning?",
});

console.log(response.content);
```

### Streaming

```ts
for await (const chunk of client.copilot.stream({ query: "Explain Rust ownership" })) {
  if (chunk.type === "text") {
    process.stdout.write(chunk.data as string);
  }
}
```

### Multi-turn conversation

```ts
const response = await client.copilot.chat({
  query: "What should I build next with it?",
  messages: [
    { role: "user", content: "I love building CLI tools in Rust." },
    { role: "assistant", content: "That's great! Rust is perfect for fast, reliable CLIs." },
  ],
});
```

### Agent types

```ts
// Deep research mode
const research = await client.copilot.chat({
  query: "Compare the latest open-source LLMs by benchmark scores",
  agentType: "research",
});

// Code generation
const code = await client.copilot.chat({
  query: "Write a binary search tree in TypeScript",
  agentType: "code",
});
```

### Spark Pages

```ts
// Create a page
const page = await client.pages.create({
  title: "Intro to WebAssembly",
  query: "Write a comprehensive introduction to WebAssembly for web developers",
  tags: ["wasm", "webdev"],
});

console.log(`Created: https://www.genspark.ai/spark/${page.slug}`);

// List your pages
const { data } = await client.pages.listMine();
data.forEach((p) => console.log(p.title, p.views));
```

---

## ⚙️ Configuration

```ts
const client = new GenSparkClient({
  token: "your-token",           // Required
  baseUrl: "https://www.genspark.ai", // Optional override
  timeout: 60_000,               // ms (default: 60000)
  maxRetries: 3,                 // Retry count on transient errors
  retryDelay: 1_000,             // Base delay between retries (ms)
  extraHeaders: {                // Additional request headers
    "X-Custom-Header": "value",
  },
  debug: false,                  // Log requests to console.debug
});
```

---

## 🛡️ Error handling

```ts
import {
  GenSparkAuthError,
  GenSparkRateLimitError,
  GenSparkTimeoutError,
  GenSparkAPIError,
} from "genspark-openclaw";

try {
  const response = await client.copilot.chat({ query: "Hello" });
} catch (err) {
  if (err instanceof GenSparkAuthError) {
    console.error("Token expired — re-authenticate.");
  } else if (err instanceof GenSparkRateLimitError) {
    console.error(`Rate limited. Retry after ${err.retryAfter}ms`);
  } else if (err instanceof GenSparkTimeoutError) {
    console.error("Request timed out.");
  } else if (err instanceof GenSparkAPIError) {
    console.error(`API error ${err.status}: ${err.message}`);
  }
}
```

---

## 📁 Project structure

```
src/
├── client/
│   ├── base.ts        # Core HTTP client (fetch, retry, timeout)
│   ├── copilot.ts     # Copilot / chat endpoints
│   ├── pages.ts       # Spark Pages endpoints
│   └── index.ts       # GenSparkClient facade
├── errors/
│   └── index.ts       # Typed error classes
├── types/
│   └── index.ts       # All TypeScript types
├── utils/
│   ├── http.ts        # HTTP helpers
│   └── stream.ts      # SSE stream parser
└── index.ts           # Public exports
examples/
└── basic.ts
tests/
└── client.test.ts
```

---

## 🧪 Development

```bash
git clone https://github.com/openclaw/genspark.ai-openclaw.git
cd genspark.ai-openclaw
npm install

npm run build         # Compile TypeScript
npm test              # Run tests
npm run test:coverage # With coverage report
npm run lint          # ESLint
npm run typecheck     # tsc --noEmit
```

---

## 🤝 Contributing

Contributions are very welcome! See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

Found a new undocumented endpoint? Open an issue or PR — growing the API surface together is the whole point of this project.

---

## 📜 License

[MIT](./LICENSE) — Copyright © 2025 openclaw contributors
