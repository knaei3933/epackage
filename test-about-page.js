/**
 * Simple test to verify /about page loads correctly
 * Run with: node test-about-page.js
 */

const http = require('http');

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/about',
  method: 'GET',
  timeout: 20000 // 20 second timeout
};

console.log('Testing /about page...');
console.log('Make sure dev server is running on port 3000');
console.log('');

const req = http.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  console.log(`Headers: ${JSON.stringify(res.headers, null, 2)}`);

  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log(`Response length: ${data.length} bytes`);
    if (res.statusCode === 200) {
      console.log('SUCCESS: /about page loaded correctly');
    } else {
      console.log('FAILURE: /about page returned non-200 status');
    }
    process.exit(res.statusCode === 200 ? 0 : 1);
  });
});

req.on('error', (err) => {
  console.error(`Error: ${err.message}`);
  console.error('Make sure the dev server is running: npm run dev');
  process.exit(1);
});

req.on('timeout', () => {
  console.error('Request timed out after 20 seconds');
  req.destroy();
  process.exit(1);
});

req.end();
