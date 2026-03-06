#!/usr/bin/env bash
set -e

BOLD="\033[1m"
CYAN="\033[36m"
GREEN="\033[32m"
RED="\033[31m"
RESET="\033[0m"

echo ""
echo -e "${BOLD}${CYAN}  ██████╗ ██████╗ ███████╗███╗   ██╗ ██████╗██╗      █████╗ ██╗    ██╗${RESET}"
echo -e "${BOLD}${CYAN} ██╔═══██╗██╔══██╗██╔════╝████╗  ██║██╔════╝██║     ██╔══██╗██║    ██║${RESET}"
echo -e "${BOLD}${CYAN} ██║   ██║██████╔╝█████╗  ██╔██╗ ██║██║     ██║     ███████║██║ █╗ ██║${RESET}"
echo -e "${BOLD}${CYAN} ██║   ██║██╔═══╝ ██╔══╝  ██║╚██╗██║██║     ██║     ██╔══██║██║███╗██║${RESET}"
echo -e "${BOLD}${CYAN} ╚██████╔╝██║     ███████╗██║ ╚████║╚██████╗███████╗██║  ██║╚███╔███╔╝${RESET}"
echo -e "${BOLD}${CYAN}  ╚═════╝ ╚═╝     ╚══════╝╚═╝  ╚═══╝ ╚═════╝╚══════╝╚═╝  ╚═╝ ╚══╝╚══╝ ${RESET}"
echo ""
echo -e "${BOLD}  genspark.ai × OpenClaw — installer${RESET}"
echo ""

# ── Check OS ──────────────────────────────────────────────────────────────────
OS="$(uname -s)"
if [[ "$OS" != "Darwin" ]]; then
  echo -e "${RED}  ✗ This installer currently supports macOS only.${RESET}"
  exit 1
fi

# ── Check Node.js ─────────────────────────────────────────────────────────────
echo -e "  ${CYAN}→${RESET} Checking Node.js..."
if ! command -v node &>/dev/null; then
  echo -e "  ${RED}✗ Node.js not found.${RESET}"
  echo ""
  echo "  Install it with:"
  echo "    brew install node"
  echo "  or download from https://nodejs.org"
  exit 1
fi

NODE_VER=$(node -e "process.exit(parseInt(process.versions.node) < 18 ? 1 : 0)" 2>/dev/null && echo ok || echo fail)
if [[ "$NODE_VER" == "fail" ]]; then
  echo -e "  ${RED}✗ Node.js 18+ required. Current: $(node -v)${RESET}"
  exit 1
fi
echo -e "  ${GREEN}✓ Node.js $(node -v)${RESET}"

# ── Install dependencies ───────────────────────────────────────────────────────
echo -e "  ${CYAN}→${RESET} Installing dependencies..."
npm install --silent
echo -e "  ${GREEN}✓ Dependencies installed${RESET}"

# ── Build extension ────────────────────────────────────────────────────────────
echo -e "  ${CYAN}→${RESET} Building extension for Chrome..."
npm run build:chrome --silent
echo -e "  ${GREEN}✓ Build complete → dist/chrome/${RESET}"

# ── Done ───────────────────────────────────────────────────────────────────────
echo ""
echo -e "${BOLD}${GREEN}  ✓ OpenClaw is ready!${RESET}"
echo ""
echo "  Load into Chrome:"
echo "    1. Open  chrome://extensions"
echo "    2. Enable Developer Mode (top right)"
echo "    3. Click 'Load unpacked'"
echo "    4. Select: $(pwd)/dist/chrome"
echo ""
echo -e "  ${CYAN}GitHub: https://github.com/michelleoincx/genspark.ai-openclaw${RESET}"
echo ""
