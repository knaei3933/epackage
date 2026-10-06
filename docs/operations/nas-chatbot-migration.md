# NAS chatbot inference migration readiness

## Purpose and boundaries

This runbook prepares the existing customer-support chat path for a NAS-based relay. It does **not** change the chat UI, `/api/chat` request/response contract, knowledge grounding, suggestion system, human-handoff gates, or `CHAT_PROVIDER=hermes` operations.

The browser continues to call only:

```text
POST /api/chat
```

The Next.js server calls the NAS relay. The browser never receives or calls `LMSTUDIO_BASE_URL`, `LMSTUDIO_API_KEY`, `HERMES_API_KEY`, or any inference credential.

## Target topology

```text
Browser
  -> Next.js server BFF (/api/chat)
  -> HTTPS NAS reverse-proxy hostname (/v1)
  -> existing 3090 workstation OpenAI-compatible Qwen service (private LAN HTTP)
```

The 3090 workstation remains the inference host. Do not create a new model or inference stack for this migration. Reuse the already-running Qwen service and select its exact existing model ID.

The NAS is only a stable HTTPS entry point/reverse proxy. Keep workstation LAN ports unreachable from the public Internet.

## Reuse the existing Qwen model

From a machine that can reach the 3090 workstation, identify the model ID advertised by the existing service. Adjust only the LAN host/port and key to the current service:

```bash
curl -fsS \
  -H 'Authorization: Bearer <workstation-or-relay-key>' \
  http://<3090-workstation-lan-ip>:<openai-compatible-port>/v1/models \
  | jq -r '.data[].id'
```

Use one returned ID verbatim as `LMSTUDIO_MODEL`. Do not rename, quantize, reload, or create a model as part of network migration.

## NAS reverse-proxy requirements

Configure a dedicated HTTPS hostname on the NAS, for example `https://<nas-relay-hostname>/v1`, and forward `/v1/*` to the workstation service. The NAS TLS certificate must be valid and trusted by the Next.js runtime; use a public DNS name and a publicly trusted certificate for Vercel.

The relay must:

- terminate HTTPS and forward only the OpenAI-compatible paths needed by chat;
- require a long random bearer key (`LMSTUDIO_API_KEY`) and reject requests without it;
- stream responses without response buffering;
- keep browser CORS disabled for the relay;
- apply rate limiting, connection/request timeouts, and a bounded request-body size;
- reject unauthenticated `/v1/models` and `/v1/chat/completions`;
- avoid logging prompt/completion bodies, bearer keys, or full URLs containing credentials;
- send traffic only to the workstation's private LAN address.

Do not expose the workstation directly and do not replace `/api/chat` with a browser-to-NAS call.

## Application configuration

Set these only in server-side environment storage (for example Vercel Environment Variables). Never use `NEXT_PUBLIC_` for any value below.

```dotenv
CHAT_PROVIDER=lmstudio
LMSTUDIO_BASE_URL=https://<nas-relay-hostname>/v1
LMSTUDIO_MODEL=<exact-model-id-from-/v1/models>
LMSTUDIO_API_KEY=<server-only-nas-relay-key>
```

Existing behavior remains the default when these optional values are absent:

- local development uses `http://localhost:1234/v1`;
- the model ID defaults to the current `qwen/qwen3-vl-4b` value;
- `LMSTUDIO_API_KEY` is optional so an unauthenticated local LM Studio still works.

For production and Vercel preview, `LMSTUDIO_BASE_URL` must use HTTPS. Plain HTTP is accepted only for `localhost`, `127.0.0.1`, or `[::1]` in non-production/preview development.

Commercial failover remains controlled by the existing `FAILOVER_ENABLED` and `FAILOVER_PROVIDER` settings. If the workstation or NAS is unavailable and failover is enabled, `/api/chat` keeps using the existing fallback provider. Hermes mode remains a separate path and is not selected unless `CHAT_PROVIDER=hermes`.

## Repository preflight

From an operator machine that can reach the NAS hostname, run:

```bash
export LMSTUDIO_BASE_URL='https://<nas-relay-hostname>/v1'
export LMSTUDIO_MODEL='<exact-model-id-from-/v1/models>'
export LMSTUDIO_API_KEY='<server-only-nas-relay-key>'

node scripts/nas-chatbot/verify-model.mjs
```

The command passes only when the NAS advertises the exact expected model ID. It prints model IDs on mismatch but never prints the API key.

After deploying to Vercel preview:

1. `GET /api/health` returns `200` with `service: lmstudio`.
2. Open a public chat entry page and send a support question covered by the existing knowledge base.
3. Confirm streamed markdown renders without UI/layout regressions.
4. Exercise a page-specific suggestion and a quote-context question if the route exposes one.
5. Exercise the existing human-handoff path in its current feature-gate state.
6. Temporarily block the workstation service and verify that error/failover behavior remains stable.

## DNS, NAS, and deployment authority

Do not change public DNS, NAS reverse-proxy rules, TLS certificates, Vercel environment variables, or production deployment state without the owner's explicit authority. This repository supplies configuration and validation; production rollout remains a separately authorized operation.

## Rollback

Keep the prior working values recorded outside Git before cutover:

```dotenv
CHAT_PROVIDER=lmstudio
LMSTUDIO_BASE_URL=<previous-working-url>
LMSTUDIO_MODEL=<previous-working-model-id>
LMSTUDIO_API_KEY=<previous-key-if-used>
```

Roll back by restoring those server-side values and redeploying. Verify `/api/health`, one streamed chat exchange, and the human-handoff gate before removing or disabling the NAS relay. Do not decommission the old path until post-rollback checks pass.
