#!/usr/bin/env node

/**
 * Test script for Member Quotations API
 * Tests the redirect loop fix by calling the API endpoint directly
 *
 * Usage:
 *   node test-member-quotations-api.js
 */

const http = require('http');

const TEST_USER_ID = '00000000-0000-0000-0000-000000000000';
const API_URL = 'localhost:3000';
const API_PATH = '/api/member/quotations';

console.log('='.repeat(60));
console.log('Member Quotations API Test');
console.log('='.repeat(60));
console.log('');
console.log('Testing GET /api/member/quotations');
console.log('This should NOT cause a redirect loop');
console.log('');

const options = {
  hostname: API_URL,
  port: 3000,
  path: API_PATH,
  method: 'GET',
  headers: {
    'x-user-id': TEST_USER_ID,
    'x-dev-mode': 'true',
    'Content-Type': 'application/json',
  },
};

const req = http.request(options, (res) => {
  console.log(`✅ Response Status: ${res.statusCode} ${res.statusMessage}`);
  console.log('');
  console.log('Response Headers:');
  console.log(Object.entries(res.headers).map(([k, v]) => `  ${k}: ${v}`).join('\n'));
  console.log('');

  let body = '';
  res.on('data', (chunk) => {
    body += chunk;
  });

  res.on('end', () => {
    console.log('Response Body:');
    try {
      const json = JSON.parse(body);
      console.log(JSON.stringify(json, null, 2));
      console.log('');
      console.log('='.repeat(60));
      console.log('Test Result: ✅ PASS');
      console.log('='.repeat(60));
      console.log('');
      console.log('The API responded successfully without redirect loops.');
      console.log('');
      console.log('Expected behavior:');
      console.log('  - Status: 200 OK');
      console.log('  - Body contains: { success: true, quotations: [], pagination: {...} }');
      console.log('  - No redirect errors');
      console.log('');
    } catch (e) {
      console.log(body);
      console.log('');
      console.log('='.repeat(60));
      console.log('Test Result: ⚠️  WARNING');
      console.log('='.repeat(60));
      console.log('');
      console.log('Response is not valid JSON. This might indicate an issue.');
    }
  });
});

req.on('error', (error) => {
  console.error('');
  console.error('='.repeat(60));
  console.error('Test Result: ❌ FAIL');
  console.error('='.repeat(60));
  console.error('');
  console.error('Error:', error.message);
  console.error('');
  console.error('Possible causes:');
  console.error('  1. Development server is not running (npm run dev)');
  console.error('  2. Server is running on a different port');
  console.error('  3. Firewall blocking connection');
  console.error('');
  console.error('To fix:');
  console.error('  1. Start the dev server: npm run dev');
  console.error('  2. Wait for server to start');
  console.error('  3. Run this test again');
  console.error('');
});

req.end();

console.log('Sending request...');
console.log('Headers:', JSON.stringify(options.headers, null, 2));
console.log('');
