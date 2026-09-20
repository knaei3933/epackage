#!/usr/bin/env node

import policy from '../../config/hermes-tool-policy.json' with { type: 'json' };
import { normalizeHermesServiceRoot } from './hermes-url.mjs';

const EXIT_ENV = 2;
const EXIT_HTTP = 3;
const EXIT_POLICY = 4;
const EXIT_REQUEST = 5;

function fail(message, code = EXIT_POLICY) {
  console.error(message);
  process.exitCode = code;
}

const isRecord = (value) => (
  typeof value === 'object' && value !== null && !Array.isArray(value)
);

const isNonEmptyStringArray = (value) => (
  Array.isArray(value) && value.every((item) => typeof item === 'string' && item.length > 0)
);

const isValidRow = (value) => (
  isRecord(value) &&
  typeof value.name === 'string' && value.name.length > 0 &&
  typeof value.enabled === 'boolean' &&
  (value.tools === undefined || isNonEmptyStringArray(value.tools))
);

function normalize(rows) {
  if (!Array.isArray(rows) || !rows.every(isValidRow)) {
    return { ok: false, reason: 'malformed' };
  }

  const enabledRows = rows.filter((row) => row.enabled === true);
  const enabledNames = [];
  const seen = new Set();
  for (const row of enabledRows) {
    if (seen.has(row.name)) {
      return { ok: false, reason: 'duplicate' };
    }
    seen.add(row.name);
    enabledNames.push(row.name);
  }

  if (enabledNames.some((name) => policy.hard_blocked_toolset_names.includes(name))) {
    return { ok: false, reason: 'hard-blocked' };
  }
  if (enabledRows.some((row) => row.tools !== undefined && row.tools.length > 0)) {
    return { ok: false, reason: 'non-empty' };
  }
  if (enabledNames.some((name) => !policy.expected_enabled_toolset_names.includes(name))) {
    return { ok: false, reason: 'unknown-enabled' };
  }

  return {
    ok: true,
    reason: 'empty-policy',
    enabledToolNames: [],
    concreteTools: [],
  };
}

async function main() {
  const baseURL = process.env.HERMES_BASE_URL?.trim();
  const apiKey = process.env.HERMES_API_KEY;
  if (!baseURL || !apiKey) {
    fail('HERMES_BASE_URL and HERMES_API_KEY are required.', EXIT_ENV);
    return;
  }

  let serviceRoot;
  try {
    serviceRoot = normalizeHermesServiceRoot(baseURL);
  } catch {
    fail('HERMES_BASE_URL must be a valid http(s) URL.', EXIT_ENV);
    return;
  }

  const url = new URL(serviceRoot + policy.audit.endpoint);

  let response;
  try {
    response = await fetch(url, {
      method: 'GET',
      headers: { Authorization: `Bearer ${apiKey}` },
      signal: AbortSignal.timeout(10_000),
    });
  } catch (error) {
    const category = error?.name === 'TimeoutError' ? 'timeout' : 'unreachable';
    fail(`toolsets audit request failed: ${category}`, EXIT_REQUEST);
    return;
  }

  if (!response.ok) {
    fail(`toolsets audit HTTP failure: ${response.status}`, EXIT_HTTP);
    return;
  }

  let payload;
  try {
    payload = await response.json();
  } catch {
    fail('toolsets audit HTTP failure: invalid JSON', EXIT_HTTP);
    return;
  }

  const envelope = policy.audit.required_envelope;
  const envelopeValid = isRecord(payload) &&
    payload.object === envelope.object &&
    payload.platform === envelope.platform;
  const result = normalize(envelopeValid ? payload.data : 'malformed');

  if (!result.ok) {
    fail(`toolsets audit rejected: ${result.reason}`, EXIT_POLICY);
    return;
  }

  console.log(`toolsets audit passed: enabled=[] concrete=[] profile=${policy.profile}`);
}

try {
  await main();
} catch {
  fail('toolsets audit failed: unexpected response', EXIT_REQUEST);
}
