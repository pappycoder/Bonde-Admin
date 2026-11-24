#!/usr/bin/env bash
# =============================================================================
# Bonde Admin — interactive build / run helper (Next.js + npm).
#   Usage:  ./bonde.sh          (run from anywhere in this repo)
# =============================================================================
set -uo pipefail

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Environment tools work without starting the app or installing its runtime.
case "${1:-}" in
  env:init|env:pull|env:push|env:plan|env:validate|env:export|env:github)
    command_name="${1#env:}"; shift
    cd "$PROJECT_DIR" || exit 1
    exec node scripts/env-vercel.mjs "$command_name" "$@"
    ;;
esac


RESET=$'\033[0m'
BOLD=$'\033[1m'
GREEN=$'\033[32m'
YELLOW=$'\033[33m'
CYAN=$'\033[36m'
RED=$'\033[31m'
DIM=$'\033[2m'

title() { printf '\n%b%b%s%b\n\n' "$BOLD$CYAN" "== " "$1" "$RESET"; }
info()  { printf '%b   %b\n' "$CYAN"   "$1$RESET"; }
ok()    { printf '%b   %b\n' "$GREEN"  "$1$RESET"; }
warn()  { printf '%b   %b\n' "$YELLOW" "$1$RESET"; }
fail()  { printf '%b   %b\n' "$RED"    "$1$RESET"; }
dim()   { printf '%b   %b\n' "$DIM"    "$1$RESET"; }

die()   { fail "$1"; exit 1; }

on_int() { printf '%b\n' "${RESET}${YELLOW}   Interrupted.${RESET}"; exit 130; }
trap on_int INT

require() { command -v "$1" >/dev/null 2>&1 || die "Missing required tool: '$1'"; }

enter() { printf '\n%b' "$DIM   Press Enter to continue$RESET"; read -r _; }

run_cmd() {
  local cmd="$1"
  printf '\n%b   $ %b\n' "$GREEN" "$cmd$RESET"
  eval "$cmd"
  local rc=$?
  if [ "$rc" -eq 0 ]; then
    ok "Finished OK."
  else
    fail "Command exited $rc."
  fi
  return "$rc"
}

# --- actions -----------------------------------------------------------------
run_dev() {
  run_cmd "npm run dev"
}

run_prod() {
  if [ ! -d "$PROJECT_DIR/.next" ]; then
    warn "No production build found (missing .next/). 'npm start' needs one."
    printf '%b   Build now? [Y/n]: %b' "$YELLOW" "$RESET"
    read -r ans
    case "${ans:-y}" in
      y|Y|'') run_cmd "npm run build" ;;
      *)      warn "Skipping build — 'npm start' will likely fail." ;;
    esac
  fi
  run_cmd "npm start"
}

build_prod() {
  title "Bonde Admin — build"
  info "Next.js emits a single production bundle; there is no separate debug build."
  dim "Output goes to .next/. Start it later with 'npm start'."
  run_cmd "npm run build"
}

# --- menu --------------------------------------------------------------------
main() {
  require npm
  cd "$PROJECT_DIR" || die "Cannot enter $PROJECT_DIR"

  while true; do
    title "Bonde Admin — build / run helper"
    printf '  %b  Run dev server            %b\n' "$BOLD[1]$RESET" "$DIM npm run dev$RESET"
    printf '  %b  Run production server     %b\n' "$BOLD[2]$RESET" "$DIM npm start$RESET"
    printf '  %b  Build production bundle   %b\n' "$BOLD[3]$RESET" "$DIM npm run build$RESET"
    printf '  %b  Environment sync commands: ./bonde.sh env:pull / env:push / env:plan\n' "$BOLD[e]$RESET"
    printf '  %b  Quit\n\n' "$BOLD[q]$RESET"
    printf '%b> %b' "$GREEN" "$RESET"
    read -r choice
    case "$choice" in
      1) run_dev ;;
      2) run_prod ;;
      3) build_prod ;;
      e|E) printf 'Use ./bonde.sh env:pull --environment preview or env:push --environment preview\n' ;;
      q|Q) ok "Bye!"; exit 0 ;;
      *) warn "Invalid choice: $choice" ;;
    esac
    enter
  done
}

main