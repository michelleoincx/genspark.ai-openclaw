/**
 * genspark.ai-openclaw — Basic Usage Example
 *
 * Run: TOKEN=your-token npx tsx examples/basic.ts
 */

import { GenSparkClient } from "../src/index.js";

const token = process.env.TOKEN;
if (!token) {
  console.error("❌  Set the TOKEN environment variable.");
  console.error(
    "   Extract it from DevTools → Application → Cookies while logged into genspark.ai"
  );
  process.exit(1);
}

const client = new GenSparkClient({ token, debug: false });

async function main() {
  console.log("🔑  Verifying session…");
  const ok = await client.isAuthenticated();
  if (!ok) {
    console.error("❌  Token is invalid or expired.");
    process.exit(1);
  }
  console.log("✅  Authenticated!\n");

  // ── Single-turn chat ───────────────────────────────────────────────────────
  console.log("💬  Single-turn chat:");
  const response = await client.copilot.chat({
    query: "Explain the difference between LLMs and traditional search engines in 3 sentences.",
  });
  console.log(response.content);
  console.log();

  // ── Streaming ─────────────────────────────────────────────────────────────
  console.log("⚡  Streaming response:");
  await client.copilot.streamToConsole({
    query: "What are the top 5 AI trends in 2025?",
    agentType: "research",
  });

  // ── Multi-turn conversation ────────────────────────────────────────────────
  console.log("\n🔄  Multi-turn conversation:");
  const history = [
    { role: "user" as const, content: "My favourite programming language is Rust." },
    { role: "assistant" as const, content: "Rust is a great choice — memory safety with zero-cost abstractions!" },
  ];
  await client.copilot.streamToConsole({
    query: "Given what I told you, what kind of projects should I build next?",
    messages: history,
  });
}

main().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});
