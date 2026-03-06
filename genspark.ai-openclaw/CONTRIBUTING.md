# Contributing to genspark.ai-openclaw

Thank you for your interest in contributing! This is an unofficial, community-driven project, so all help is welcome.

## Getting started

```bash
git clone https://github.com/openclaw/genspark.ai-openclaw.git
cd genspark.ai-openclaw
npm install
npm run build
```

## Running tests

```bash
npm test            # run once
npm run test:watch  # watch mode
npm run test:coverage
```

## Project structure

```
src/
  client/     # API sub-clients (copilot, pages, …)
  errors/     # Custom error classes
  types/      # TypeScript types & interfaces
  utils/      # HTTP helpers, SSE stream parser
  index.ts    # Public entry point
examples/     # Runnable usage examples
tests/        # Unit & integration tests
```

## Adding a new endpoint

1. Add the request/response types in `src/types/index.ts`.
2. Create or extend a client in `src/client/`.
3. Export anything new from `src/index.ts`.
4. Add tests in `tests/`.
5. Update `README.md` with a usage snippet.

## Reporting discovered endpoints

If you find new GenSpark API endpoints by inspecting network traffic, please open an issue or PR with:
- The HTTP method and path
- Sample request body (sanitize any personal data)
- Sample response shape

## Code style

- TypeScript strict mode — no `any`.
- Run `npm run lint:fix && npm run format` before committing.
- Conventional commits preferred: `feat:`, `fix:`, `chore:`, `docs:`.

## Legal notice

This project reverse-engineers the public GenSpark.ai web interface solely for interoperability purposes. Please review GenSpark's Terms of Service before using this library in production.
