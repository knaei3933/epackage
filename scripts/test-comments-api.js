#!/usr/bin/env node
/**
 * Test script to check order comments API
 */

const https = require('https');

const options = {
  hostname: 'localhost',
  port: 3006,
  path: '/api/member/orders/d64c4629-fc81-40c6-b7fe-ea5fa41226b6/comments',
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
    'Cookie': process.env.TEST_COOKIE || ''
  },
  rejectUnauthorized: false
};

const req = https.request(options, (res) => {
  console.log('Status:', res.statusCode);
  console.log('Headers:', JSON.stringify(res.headers, null, 2));

  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log('Response:', data);
  });
});

req.on('error', (e) => {
  console.error('Error:', e.message);
});

req.end();
