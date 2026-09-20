#!/usr/bin/env bash
set -euo pipefail

PROFILE=website-chatbot
PROFILE_ENV="$HOME/.hermes/profiles/$PROFILE/.env"
BASE_URL="${HERMES_BASE_URL:-}"
CHAT=false
CHAT_PROMPT='Reply with OK.'

usage() {
  cat <<'EOF'
Usage: scripts/hermes-chatbot/smoke.sh [--base-url URL] [--env-file PATH] [--chat] [--chat-prompt TEXT]

Checks /health, authenticated /v1/models, the exact empty toolset policy, and
optionally POSTs /v1/chat/completions.

The API key is read only from HERMES_API_KEY or the selected Hermes profile env
file (default: $HOME/.hermes/profiles/website-chatbot/.env). The key is never
printed. Failures expose endpoint/status categories only.
EOF
}

die() {
  printf 'smoke failed: %s\n' "$1" >&2
  exit "${2:-1}"
}

read_env_key() {
  local path=$1
  awk -F= '
    /^[[:space:]]*(export[[:space:]]+)?(API_SERVER_KEY|HERMES_API_KEY)[[:space:]]*=/ {
      key=$1; sub(/^[^=]*=/, "", $0); sub(/\r$/, "", $0)
      gsub(/^[[:space:]]+|[[:space:]]+$/, "", key); gsub(/^[[:space:]]+|[[:space:]]+$/, "", $0)
      gsub(/^"/, "", $0); gsub(/"$/, "", $0)
      gsub(/^\x27/, "", $0); gsub(/\x27$/, "", $0)
      print $0; exit
    }' "$path"
}

normalize_service_url() {
  local value=$1
  value=${value%/}
  while [[ "$value" == */ ]]; do
    value=${value%/}
  done
  if [[ "$value" == */v1 ]]; then
    value=${value%/*}
  fi
  printf '%s' "$value"
}

while (($#)); do
  case "$1" in
    --base-url)
      shift; (($#)) || die "--base-url requires a URL" 2
      BASE_URL=$1
      ;;
    --env-file)
      shift; (($#)) || die "--env-file requires a path" 2
      PROFILE_ENV=$1
      ;;
    --chat) CHAT=true ;;
    --chat-prompt)
      shift; (($#)) || die "--chat-prompt requires text" 2
      CHAT_PROMPT=$1
      ;;
    -h|--help) usage; exit 0 ;;
    *) usage >&2; die "unknown argument: $1" 2 ;;
  esac
  shift
done

BASE_URL=$(normalize_service_url "$BASE_URL")

[[ "$BASE_URL" =~ ^https?://[^[:space:]]+$ ]] || die "a valid http(s) base URL is required" 2
if [[ -z "${HERMES_API_KEY:-}" ]]; then
  [[ -f "$PROFILE_ENV" && ! -L "$PROFILE_ENV" ]] || die "profile env is not a regular file: $PROFILE_ENV" 2
  HERMES_API_KEY=$(read_env_key "$PROFILE_ENV")
fi
[[ -n "$HERMES_API_KEY" ]] || die "API key was not found in the approved env source" 2

code=$(curl --silent --show-error --output /dev/null --write-out '%{http_code}' \
  --connect-timeout 3 --max-time 10 "$BASE_URL/health") || die "health request failed" 3
[[ "$code" =~ ^2 ]] || die "health HTTP failure: $code" 3

code=$(curl --silent --show-error --output /dev/null --write-out '%{http_code}' \
  --connect-timeout 3 --max-time 10 -H "Authorization: Bearer $HERMES_API_KEY" \
  "$BASE_URL/v1/models") || die "models request failed" 3
[[ "$code" =~ ^2 ]] || die "authenticated models HTTP failure: $code" 3

HERMES_BASE_URL="$BASE_URL" HERMES_API_KEY="$HERMES_API_KEY" \
  "$(dirname "$0")/audit-toolsets.mjs"

if $CHAT; then
  [[ -n "${HERMES_MODEL:-}" ]] || die "HERMES_MODEL is required for --chat" 2
  chat_body=$(HERMES_CHAT_MODEL="$HERMES_MODEL" HERMES_CHAT_PROMPT="$CHAT_PROMPT" node -e '
    process.stdout.write(JSON.stringify({
      model: process.env.HERMES_CHAT_MODEL,
      messages: [{ role: "user", content: process.env.HERMES_CHAT_PROMPT }]
    }))
  ')
  code=$(curl --silent --show-error --output /dev/null --write-out '%{http_code}' \
    --connect-timeout 3 --max-time 30 -H "Authorization: Bearer $HERMES_API_KEY" \
    -H 'Content-Type: application/json' --data "$chat_body" \
    "$BASE_URL/v1/chat/completions") || die "chat request failed" 3
  [[ "$code" =~ ^2 ]] || die "chat HTTP failure: $code" 3
fi

printf 'smoke passed: health/models/toolsets%s\n' "$($CHAT && echo /chat || echo '')"
