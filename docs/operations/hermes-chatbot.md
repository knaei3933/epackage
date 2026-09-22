# Hermes Website Chatbot Operations

Scope: isolated local `website-chatbot` runtime for G004/M3. This guide does not execute production changes.

## Topology and authority boundaries

```text
Browser
  -> same-origin Next.js / Vercel BFF (/api/chat, /api/health)
  -> distinct Hermes preview hostname through Cloudflare Tunnel
  -> cloudflared on the Hermes host
  -> Hermes API Server at 127.0.0.1:8642
```

- The browser calls only the site BFF. Never expose `HERMES_API_KEY` with a `NEXT_PUBLIC_` variable or call Hermes directly from the browser.
- The Hermes API Server binds only to loopback. The tunnel is the sole preview ingress and must forward to `127.0.0.1:8642`.
- Keep the existing LM Studio hostname, startup settings, and `LMSTUDIO_BASE_URL` rollback path unchanged.
- The Hermes key is the profile's `API_SERVER_KEY`, stored in owner-only Hermes `.env` and Vercel server-side environment.

## Create the isolated profile

```bash
hermes profile create website-chatbot --no-skills \
  --description "Least-privilege public website chat profile"
hermes profile show website-chatbot
hermes -p website-chatbot config env-path
```

`--no-skills` starts without bundled skills. Do not use `--clone` or `--clone-all`: the profile must not inherit personal tools, files, memory, browser access, or broad tool credentials.

Configure exactly one primary inference provider/model through Hermes' picker:

```bash
hermes -p website-chatbot model
hermes -p website-chatbot fallback list
```

Keep the fallback chain empty. Enter only the credential required by that provider in the profile. Do not copy browser, file, terminal, memory, search, automation, or other tool API keys into it.

## Owner-only profile environment

Create a unique key for this profile only:

```bash
umask 077
env_file="$(hermes -p website-chatbot config env-path)"
printf '\nAPI_SERVER_KEY=%s\n' "$(openssl rand -hex 32)" >> "$env_file"
chmod 600 "$env_file"
```

In the same profile `.env`, set:

```dotenv
API_SERVER_ENABLED=true
API_SERVER_HOST=127.0.0.1
API_SERVER_PORT=8642
```

Keep the file owner-readable only and outside Git. Do not log or print `API_SERVER_KEY`; reuse it as the Vercel `HERMES_API_KEY` only after all local gates pass.

## Empty external-tool policy

With `hermes -p website-chatbot config edit`, set the platform selection to the empty list and apply the global disables as defense in depth:

```yaml
platform_toolsets:
  api_server: []

agent:
  disabled_toolsets:
    - browser
    - code_execution
    - coding
    - computer_use
    - connections
    - cronjob
    - debugging
    - delegation
    - desktop_ui
    - file
    - homeassistant
    - image_gen
    - memory
    - safe
    - search
    - session_search
    - skills
    - terminal
    - vision
    - web
```

The runtime audit is authoritative; YAML intent alone does not pass. Audit semantics:

- require `object="list"`, `platform="api_server"`, and an array `data`;
- require unique, non-empty string names and boolean `enabled` on every well-formed row;
- ignore disabled rows, including their configured tools;
- fail for any enabled row, duplicate enabled name, malformed row, unknown enabled toolset, or non-2xx response.

The serving preflight continuously enforces the configured model and the exact-empty `/v1/toolsets` policy. Successful results are cached for 30 seconds and failures for 5 seconds. The standalone audit remains an operator gate before and after deployment.

## Supervise the Hermes gateway

Configure the profile before installing its service, then use Hermes' service manager:

```bash
hermes -p website-chatbot gateway install --start-now
hermes -p website-chatbot gateway status --deep
hermes -p website-chatbot gateway start
hermes -p website-chatbot gateway status --deep
```

Linux/LXC cautions:

- Do not run a system gateway as root. Prefer a dedicated unprivileged user that owns the `website-chatbot` profile; use `--run-as-user` only when installing a Linux system service.
- In LXC, first confirm the container's service manager is functional. If it is not, use an existing host/container supervisor with restart and health checks instead of pretending a manual process is supervised.
- `hermes gateway run` is a foreground diagnostic path, not an availability control.

Windows/WSL:

- Native Windows has no Hermes systemd/launchd service path. Use a Windows service/supervisor for `hermes -p website-chatbot gateway run`.
- In WSL, use Hermes' service manager only if WSL systemd is enabled; otherwise supervise the foreground process explicitly.

Manual startup alone fails the availability gate. Passing requires installed supervision, a deep status pass, and a restart/recovery check.

Current host baseline (`hermes-gateway-website-chatbot.service`):

- dedicated `hermes-www:hermes-www` account with no login shell;
- profile at `/var/lib/hermes-website-chatbot/.hermes/profiles/website-chatbot`, owned mode `0700`, with `.env` mode `0600`;
- isolated `/var/lib/hermes-website-chatbot/.hermes/auth.json`, owned mode `0600`, containing only the `zai` credential-pool entries needed by this runtime; do not copy the broader root/global authentication file;
- loopback-only `127.0.0.1:8642`;
- `NoNewPrivileges`, private tmp/devices, strict home/system protection, empty capability/ambient sets, network address-family restriction, and write access limited to `/var/lib/hermes-website-chatbot`;
- restart/recovery and authenticated model/toolset checks must pass after any service change.

## Staging tunnel

Create a distinct hostname for Hermes; never point it at the existing LM Studio hostname or port. Example ingress:

```yaml
tunnel: <HERMES_TUNNEL_ID>
credentials-file: <OWNER_ONLY_CREDENTIALS_JSON>
ingress:
  - hostname: hermes-preview.example.com
    service: http://127.0.0.1:8642
  - service: http_status:404
```

Replace both placeholders with owner-managed values and the approved distinct preview DNS name. Create/route and run that named tunnel only with Cloudflare authority. For a temporary staging check, foreground execution is acceptable only in a controlled session; before any preview or production gate, install/run `cloudflared` under the platform service manager with restart and health checks.

The production connector is `cloudflared-chatbot-package-lab.service`, runs as the dedicated non-root `cloudflared` account, and forwards `chatbot.package-lab.com` to `127.0.0.1:8642`. Keep Cloudflare edge WAF/rate limiting and access controls enabled; bearer authentication alone is not the desired final boundary.

## Secret-free local smoke checks

Put the profile key in the shell environment; never echo it or enable shell tracing:

```bash
: "${HERMES_API_KEY:?Set HERMES_API_KEY in the environment}"
base='http://127.0.0.1:8642'

curl -fsS "$base/health" | jq -e '.status == "ok"'
curl -fsS -H "Authorization: Bearer $HERMES_API_KEY" "$base/v1/models" >/dev/null
curl -fsS -H "Authorization: Bearer $HERMES_API_KEY" "$base/v1/toolsets" | jq -e '
  .object == "list" and
  .platform == "api_server" and
  (.data | type == "array") and
  (all(.data[];
    (.name | type == "string" and length > 0) and
    (.enabled | type == "boolean") and
    (((.tools // []) | type == "array") and
     all(.tools // []; type == "string" and length > 0)))) and
  ([.data[] | select(.enabled == true) | .name] |
    length == (unique | length)) and
  ([.data[] | select(.enabled == true)] | length == 0)
'
curl -fsS -o /dev/null \
  -H "Authorization: Bearer $HERMES_API_KEY" \
  -H 'Content-Type: application/json' \
  --data-binary '{"messages":[{"role":"user","content":"availability smoke test"}],"max_tokens":1}' \
  "$base/v1/chat/completions"
```

Run the model check against the exact model exposed by `/v1/models`; if the server requires `model`, use that value in the request JSON. Any non-zero curl or `jq` result, including one enabled tool, fails the gate.

Then point the app at the staged tunnel and verify `/api/health` reports `status:"ok"` and `service:"hermes"` without exposing the endpoint or key.

## Repository automation

- `scripts/hermes-chatbot/bootstrap.sh` validates prerequisites and defaults to dry-run; pass `--apply` to create/configure the profile. `--install-service` requires `--apply` and installs the gateway without starting it. It performs no tunnel, start, or production action.
- `scripts/hermes-chatbot/audit-toolsets.mjs` performs the exact empty-tool audit. Set `HERMES_BASE_URL` to the service root or a URL ending in `/v1`.
- `scripts/hermes-chatbot/smoke.sh` checks `/health`, authenticated `/v1/models`, and the exact tool policy; add `--chat` for the optional chat-completion check. It reads the key only from the environment or the approved profile env file and never prints it.
- `scripts/hermes-chatbot/test-base-url.mjs` verifies service-root and `/v1` URL normalization.

Run the audit and smoke checks only against the isolated local or staged Hermes endpoint after the operator supplies the required variables. Keep service installation separate from the supervised start/status gate.

## Application variables and rollback

Set these only as Vercel server-side values:

```dotenv
CHAT_PROVIDER=hermes
HERMES_BASE_URL=https://hermes-preview.example.com/v1
HERMES_API_KEY=<profile API_SERVER_KEY>
HERMES_MODEL=<model id returned by /v1/models>
```

Current behavior:

- `HERMES_BASE_URL` must use HTTPS for Vercel production and preview. Plain HTTP is accepted only in local, non-production/preview development when the host is exactly `127.0.0.1`, `localhost`, or `[::1]`; a `.local` hostname is not a loopback exemption.
- Before streaming, Hermes mode performs an authenticated model audit and the exact-empty toolset audit from `config/hermes-tool-policy.json -> audit.endpoint`; it also requires authenticated `/health/detailed` readiness (`status`, `readiness.status`, and `readiness.checks.model.status`) and rejects an exposed version below `minimum_hermes_version`. Success is cached for 30 seconds and failure for 5 seconds in each serving process, so this is bounded local caching rather than continuous monitoring or a global enforcement guarantee. The provider never falls back to LM Studio or a commercial provider.
- `/api/health` performs the same authenticated serving preflight. Authentication, model advertisement, health, or tool-policy failure returns HTTP 503 with `status:"degraded"` and a stable reason code, without provider details. It intentionally avoids a billable completion request, so operator smoke tests must also send one small direct chat completion after credential or host migration.
- `CHAT_PROVIDER` accepts only `hermes` or `lmstudio`; an unknown or misspelled value fails closed instead of silently entering LM Studio or commercial failover.
- the BFF sends only validated page context, never form values, files, tokens, or personal identifiers.

## Page-aware suggestion questions

The global widget posts a same-origin JSON request to `/api/chat/suggestions` only after it is opened. The endpoint:

- validates pathname/locale and, on `/quote-simulator`, the wizard step and focused field ID;
- resolves the participant audience from the verified Supabase server session and `profiles` lookup, never caller identity headers;
- returns only public suggestions to anonymous/inactive users;
- adds member, staff/admin, or designer suggestions only for the matching active role;
- responds with `Cache-Control: private, no-store`;
- rate-limits abuse with the `suggestions` policy.

The browser bundle contains only a generic public fallback. Detailed and protected suggestion labels stay in the server catalog. `pnpm run verify:chat-suggestions` scans `.next/static` after a production build and fails if protected member/staff/designer question text leaks into public client chunks.

When a suggestion is selected, the widget sends the displayed question as a normal user message plus a bounded `suggestionId`. `/api/chat` resolves that ID from the server catalog and validates its route, audience, and quote context before using its grounding. Invalid, cross-route, or cross-role IDs are rejected. Free-text input remains available and clears any selected suggestion ID.

### Aggregate non-PII analytics

The suggestion endpoint issues or reuses a server-side `chat_sessions` ID and returns it only to the current tab. The session contains audience and normalized route family—not user ID, raw pathname, IP address, User-Agent, fingerprint, or conversation text.

`/api/chat/events` accepts only:

- a UUID session ID;
- a bounded enum event type;
- an optional allowlisted suggestion ID.

It rejects message text, contact fields, form values, and unknown keys. The database stores aggregate `chat_funnel_events` with service-role-only access; direct `anon` and `authenticated` policies/grants are intentionally absent.

Retention:

- default operational retention is 180 days;
- `purge_expired_chat_analytics` deletes in bounded batches;
- `/api/cron/purge-chat-analytics` runs weekly and requires `CRON_SECRET` in production.

After `next build`, run:

```bash
pnpm run verify:chat-suggestions
```

The scanner generates the complete non-public suggestion manifest, rejects protected/public text overlap, and scans client-observable static/RSC/HTML/JSON build output.

### Lead capture boundary

Requirements for progressive guest/member lead capture are specified in `.omx/specs/deep-interview-page-chat-suggestions.md`, but contact/PII persistence is intentionally not enabled yet. Before implementation:

1. add server-issued `chat_sessions`;
2. add exact structured lead/contact tables with RLS and audit coverage;
3. prove the `CHAT_LEAD_CAPTURE_ENABLED=false` disabled behavior;
4. obtain privacy-policy and retention approval;
5. complete an independent architecture review.

### Local consent-gated lead preparation

Commit `supabase/migrations/20260921120000_create_chat_leads_and_contacts.sql` is a **local design migration only**. It defines:

- exact lead/contact/audit enums and tables;
- member-safe column-level status access;
- service-role-only transactional submit/reveal/workflow/redaction/status RPCs;
- a composite-key durable rate-limit table and atomic limiter RPC;
- machine-checked privacy readiness;
- readiness-controlled bounded retention/purge;
- idempotent account-deletion unlink/redaction.

It must not be applied to production until:

1. privacy wording and retention periods are approved;
2. the final privacy approval record and production retention values are recorded;
3. Architect/Critic review the executable implementation and rollout plan;
4. durable cross-instance limiter behavior and account-deletion lifecycle are revalidated in the target environment;
5. rollout is explicitly authorized.

`CHAT_LEAD_CAPTURE_ENABLED` is false and `/api/chat/lead` returns a stable disabled response before reading or parsing any request body. The suggestions response exposes only boolean capability state and never approval secrets.

`CHAT_LEGACY_HUMAN_HANDOFF_ENABLED` independently governs the legacy email-only phone handoff. It defaults to false in example configuration, is not consent for the new lead system, and must never write phone/conversation data into analytics or lead tables.

`CHAT_LEAD_SCHEMA_READY` is a separate local-schema lifecycle gate used by account deletion. It stays false until the lead migration is actually present in that environment. The lead capture capability itself remains false independently.

The local lead migration also defines a bounded, service-role-only `purge_expired_chat_rate_limits` RPC. `/api/cron/purge-chat-rate-limits` runs daily with `CRON_SECRET`, deletes expired windows and oldest overflow rows in bounded batches, and reports whether more work remains. The repeatable local proof command is:

```bash
pnpm run test:chat-lead-rls
```

Rollback keeps LM Studio intact: restore the prior `LMSTUDIO_BASE_URL` and model settings, change `CHAT_PROVIDER` to `lmstudio`, redeploy, and verify `/api/health`. Do not delete the Hermes preview or prior rollback values until the post-rollback check succeeds.

## Production hard stop (remaining M6 gates)

Do not execute production commands from this repository or guide. Production remains blocked until the owner records all of the following:

1. explicit Vercel project and Cloudflare DNS/tunnel/WAF authority;
2. an active Cloudflare edge rate-limit/WAF control for the Hermes hostname;
3. the exact empty-tool audit passing against the isolated runtime;
4. supervised Hermes and cloudflared restart/recovery evidence;
5. distinct-hostname preview smoke checks, including offline behavior;
6. a private rollback record containing the prior LM Studio values and verified restore steps.

Missing any item is a hard stop. An owner-approved exception cannot substitute for the active edge control or exact tool audit.
