#!/usr/bin/env bash
set -euo pipefail

POLICY_FILE="config/hermes-tool-policy.json"
PROFILE=""
EXPECTED_VERSION=""
HARD_BLOCKED_JSON=""
API_SERVER_PORT="${HERMES_API_SERVER_PORT:-8642}"
INSTALL_SERVICE=false
APPLY=false

usage() {
  cat <<'EOF'
Usage: scripts/hermes-chatbot/bootstrap.sh [--apply] [--install-service]

Creates the isolated local Hermes website-chatbot profile.

Options:
  --apply            Create and configure the profile. The default is dry-run.
  --install-service  With --apply only, install (but do not start) the Hermes
                     gateway service. Without this flag, no gateway is installed.
  -h, --help         Show this help.

Required operator variables:
  HERMES_INFERENCE_PROVIDER   One Hermes provider id
  HERMES_INFERENCE_MODEL      One explicit model id
  HERMES_PROVIDER_BASE_URL    One http(s) OpenAI-compatible base URL
  HERMES_PROVIDER_API_KEY     Provider credential (never printed)
  HERMES_API_SERVER_PORT      Optional; default 8642

The API server key is written only to:
  $HOME/.hermes/profiles/website-chatbot/.env
The file is created with mode 600 and the key is never printed.

Safety: local profile configuration only. No tunnel, start, or production action.
EOF
}

die() {
  printf 'bootstrap failed: %s\n' "$1" >&2
  exit "${2:-1}"
}

load_policy() {
  [[ -r "$POLICY_FILE" ]] || die "missing tracked policy: $POLICY_FILE"
  PROFILE=$(node -e "const p=require(process.argv[1]); if (p.profile !== 'website-chatbot' || p.platform !== 'api_server' || JSON.stringify(p.expected_enabled_toolset_names) !== '[]' || JSON.stringify(p.expected_enabled_concrete_tools) !== '[]') process.exit(1); console.log(p.profile)" "$PWD/$POLICY_FILE") || die "invalid shared policy"
  EXPECTED_VERSION=$(node -e "const p=require(process.argv[1]); if (typeof p.minimum_hermes_version !== 'string') process.exit(1); console.log(p.minimum_hermes_version)" "$PWD/$POLICY_FILE") || die "invalid policy version"
  HARD_BLOCKED_JSON=$(node -e "const p=require(process.argv[1]); if (!Array.isArray(p.hard_blocked_toolset_names) || p.hard_blocked_toolset_names.length === 0) process.exit(1); console.log(JSON.stringify(p.hard_blocked_toolset_names))" "$PWD/$POLICY_FILE") || die "invalid blocked policy"
}

version_at_least() {
  local actual=$1 required=$2
  local a1 a2 a3 r1 r2 r3
  IFS=. read -r a1 a2 a3 <<<"$actual"
  IFS=. read -r r1 r2 r3 <<<"$required"
  (( ${a1:-0} > r1 )) && return 0
  (( ${a1:-0} < r1 )) && return 1
  (( ${a2:-0} > r2 )) && return 0
  (( ${a2:-0} < r2 )) && return 1
  (( ${a3:-0} >= ${r3:-0} ))
}

validate_provider_inputs() {
  [[ -n "${HERMES_INFERENCE_PROVIDER:-}" ]] || die "HERMES_INFERENCE_PROVIDER is required"
  [[ -n "${HERMES_INFERENCE_MODEL:-}" ]] || die "HERMES_INFERENCE_MODEL is required"
  [[ -n "${HERMES_PROVIDER_BASE_URL:-}" ]] || die "HERMES_PROVIDER_BASE_URL is required"
  [[ -n "${HERMES_PROVIDER_API_KEY:-}" ]] || die "HERMES_PROVIDER_API_KEY is required"
  [[ "$HERMES_INFERENCE_PROVIDER" =~ ^[a-z0-9][a-z0-9_-]*$ ]] || die "invalid HERMES_INFERENCE_PROVIDER"
  [[ "$HERMES_INFERENCE_MODEL" =~ ^[A-Za-z0-9][A-Za-z0-9._/:+-]*$ ]] || die "invalid HERMES_INFERENCE_MODEL"
  [[ "$HERMES_PROVIDER_BASE_URL" =~ ^https?://[^[:space:]]+$ ]] || die "invalid HERMES_PROVIDER_BASE_URL"
  [[ "$API_SERVER_PORT" =~ ^[0-9]+$ ]] && (( API_SERVER_PORT >= 1 && API_SERVER_PORT <= 65535 )) || die "invalid HERMES_API_SERVER_PORT"
}

while (($#)); do
  case "$1" in
    --apply) APPLY=true ;;
    --install-service) INSTALL_SERVICE=true ;;
    -h|--help) usage; exit 0 ;;
    *) usage >&2; die "unknown argument: $1" 2 ;;
  esac
  shift
done

load_policy

actual_version=$(hermes --version | head -n1 | sed -n 's/.*v\([0-9][0-9]*\.[0-9][0-9]*\.[0-9][0-9]*\).*/\1/p' || true)
[[ -n "$actual_version" ]] || die "unable to determine Hermes version"
version_at_least "$actual_version" "$EXPECTED_VERSION" || die "Hermes $actual_version is older than required $EXPECTED_VERSION"

if hermes profile show "$PROFILE" >/dev/null 2>&1; then
  die "profile already exists: $PROFILE"
fi

validate_provider_inputs

if $INSTALL_SERVICE && ! $APPLY; then
  die "--install-service requires --apply" 2
fi

profile_env="$HOME/.hermes/profiles/$PROFILE/.env"
if ! $APPLY; then
  printf 'DRY RUN: prerequisites passed for profile=%s version=%s\n' "$PROFILE" "$actual_version"
  printf 'DRY RUN: would create with --no-skills and write API server env at %s (mode 600)\n' "$profile_env"
  printf 'DRY RUN: would set one provider and exact empty api_server toolsets\n'
  exit 0
fi

hermes profile create "$PROFILE" --no-skills --no-alias \
  --description 'Isolated public website chatbot inference profile'

api_server_key=$(openssl rand -hex 32)
[[ ${#api_server_key} -eq 64 ]] || die "failed to generate a 32-byte API server key"

mkdir -p "$(dirname "$profile_env")"
old_umask=$(umask)
umask 077
env_tmp=$(mktemp "$(dirname "$profile_env")/.env.bootstrap.XXXXXX")
{
  printf '%s\n' "# Profile-only local API server configuration."
  printf 'API_SERVER_ENABLED=true\n'
  printf 'API_SERVER_HOST=127.0.0.1\n'
  printf 'API_SERVER_PORT=%s\n' "$API_SERVER_PORT"
  printf 'API_SERVER_KEY=%s\n' "$api_server_key"
  printf 'HERMES_INFERENCE_API_KEY=%s\n' "$HERMES_PROVIDER_API_KEY"
} >"$env_tmp"
chmod 600 "$env_tmp"
mv "$env_tmp" "$profile_env"
umask "$old_umask"

hermes_config() {
  hermes -p "$PROFILE" config set "$@"
}

hermes_config model.provider "$HERMES_INFERENCE_PROVIDER" >/dev/null
hermes_config model.default "$HERMES_INFERENCE_MODEL" >/dev/null
hermes_config model.base_url "$HERMES_PROVIDER_BASE_URL" >/dev/null
hermes_config model.api_key '${HERMES_INFERENCE_API_KEY}' >/dev/null
hermes_config platform_toolsets.api_server '[]' --force >/dev/null
hermes_config agent.disabled_toolsets "$HARD_BLOCKED_JSON" --force >/dev/null

if $INSTALL_SERVICE; then
  hermes -p "$PROFILE" gateway install --no-start-now
fi

printf 'bootstrap complete: profile=%s env=%s mode=%s gateway=%s\n' \
  "$PROFILE" "$profile_env" "$(stat -c '%a' "$profile_env")" \
  "$($INSTALL_SERVICE && echo installed-not-started || echo not-installed)"
