#!/usr/bin/env node

import http from 'node:http';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { normalizeHermesServiceRoot } from './hermes-url.mjs';

if (process.argv.includes('-h') || process.argv.includes('--help')) {
  console.log('Usage: scripts/hermes-chatbot/test-base-url.mjs');
  console.log('Verifies /v1 and root base URLs compose the exact Hermes service paths.');
  process.exit(0);
}

const requests = [];
const server = http.createServer((request, response) => {
  requests.push(request.url);
  if (request.url === '/v1/toolsets') {
    response.writeHead(200, { 'content-type': 'application/json' });
    response.end(JSON.stringify({
      object: 'list',
      platform: 'api_server',
      data: [],
    }));
    return;
  }
  response.writeHead(500);
  response.end();
});

function audit(baseURL) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [
      fileURLToPath(new URL('./audit-toolsets.mjs', import.meta.url)),
    ], {
      env: {
        ...process.env,
        HERMES_BASE_URL: baseURL,
        HERMES_API_KEY: 'unused-mock-key',
      },
      stdio: 'ignore',
    });
    child.on('exit', (code) => resolve(code));
    child.on('error', reject);
  });
}

await new Promise((resolve, reject) => {
  server.once('error', reject);
  server.listen(0, '127.0.0.1', resolve);
});
const { port } = server.address();

try {
  const root = `http://127.0.0.1:${port}`;
  if (normalizeHermesServiceRoot(`${root}/v1/`) !== root) {
    throw new Error('normalization did not strip one trailing /v1');
  }

  const code = await audit(`${root}/v1`);
  if (code !== 0) throw new Error(`audit exited ${code}`);
  if (requests.join(',') !== '/v1/toolsets') {
    throw new Error(`unexpected requests: ${requests.join(',')}`);
  }
  console.log('base-url harness passed: /v1 -> /v1/toolsets');
} finally {
  server.close();
}
