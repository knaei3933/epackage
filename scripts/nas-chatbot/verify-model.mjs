#!/usr/bin/env node

/**
 * Verify that the NAS relay exposes the existing workstation model catalog.
 *
 * Required environment:
 *   LMSTUDIO_BASE_URL  OpenAI-compatible root ending in /v1
 *   LMSTUDIO_MODEL     exact model ID to require in /v1/models
 *
 * Optional environment:
 *   LMSTUDIO_API_KEY   bearer token when the NAS relay requires authentication
 */

const baseURL = process.env.LMSTUDIO_BASE_URL?.replace(/\/+$/, '');
const expectedModel = process.env.LMSTUDIO_MODEL;
const apiKey = process.env.LMSTUDIO_API_KEY;

if (!baseURL || !expectedModel) {
  console.error('Set LMSTUDIO_BASE_URL and LMSTUDIO_MODEL before verification.');
  process.exit(2);
}

let parsedURL;
try {
  parsedURL = new URL(baseURL);
} catch {
  console.error('LMSTUDIO_BASE_URL is not a valid URL.');
  process.exit(2);
}

if (
  !['http:', 'https:'].includes(parsedURL.protocol) ||
  !baseURL.endsWith('/v1')
) {
  console.error('LMSTUDIO_BASE_URL must be an http(s) URL ending in /v1.');
  process.exit(2);
}

const controller = new AbortController();
const timeout = setTimeout(() => controller.abort(), 10_000);

try {
  const response = await fetch(`${baseURL}/models`, {
    headers: {
      ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
    },
    signal: controller.signal,
  });

  if (!response.ok) {
    console.error(`Model catalog check failed: HTTP ${response.status}`);
    process.exit(1);
  }

  const payload = await response.json();
  const modelIds = Array.isArray(payload?.data)
    ? payload.data.map((model) => model?.id).filter((id) => typeof id === 'string')
    : [];

  if (!modelIds.includes(expectedModel)) {
    console.error(`Expected model is not advertised: ${expectedModel}`);
    console.error(`Available model IDs: ${JSON.stringify(modelIds)}`);
    process.exit(1);
  }

  console.log(`NAS relay model check passed: ${expectedModel}`);
} catch (error) {
  const reason = error?.name === 'AbortError' ? 'timeout after 10s' : error?.message;
  console.error(`NAS relay is unreachable: ${reason}`);
  process.exit(1);
} finally {
  clearTimeout(timeout);
}
