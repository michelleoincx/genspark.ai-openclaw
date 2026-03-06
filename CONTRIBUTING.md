# Contributing to GenSpark OpenClaw

Thank you for your interest in contributing! This document outlines how to get started.

## Development Setup

```bash
git clone https://github.com/openclaw/genspark.ai-openclaw.git
cd genspark.ai-openclaw
npm install
npm run dev
```

Load the unpacked extension from `dist/chrome` in Chrome (`chrome://extensions` → Developer mode → Load unpacked).

## Project Structure

```
src/
  background/   # Service worker — request interception, message router
  content/      # Content scripts — DOM patching, paywall removal
  popup/        # Extension popup UI (TypeScript + CSS)
  utils/        # Shared utilities (logger, storage, types)
  api/          # API helpers
tests/          # Jest unit tests
public/         # Static assets — manifests, icons, HTML shell
```

## Pull Requests

- Branch from `main`, name your branch `feat/...` or `fix/...`
- Run `npm test` and `npm run lint` before opening a PR
- Keep PRs focused — one feature or fix per PR
- Describe _what_ and _why_ in the PR body

## Reporting Issues

Use the GitHub issue tracker. Include: browser, extension version, and steps to reproduce.
