/**
 * Test script for template API endpoints
 * Run with: node scripts/test-template-api.js
 */

const http = require('http');

const BASE_URL = 'http://localhost:3000';

async function testEndpoint(path, method = 'GET') {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const req = http.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body: data,
        });
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (method === 'POST') {
      req.write(JSON.stringify({}));
    }

    req.end();
  });
}

async function main() {
  console.log('🧪 Testing Template API Endpoints\n');

  const tests = [
    { name: 'Excel Template (GET)', path: '/api/download/templates/excel', method: 'GET' },
    { name: 'Excel Template Info (POST)', path: '/api/download/templates/excel', method: 'POST' },
    { name: 'PDF Template Info (GET)', path: '/api/download/templates/pdf', method: 'GET' },
    { name: 'PDF Template Info (POST)', path: '/api/download/templates/pdf', method: 'POST' },
  ];

  for (const test of tests) {
    try {
      console.log(`Testing: ${test.name} (${test.method} ${test.path})`);
      const result = await testEndpoint(test.path, test.method);

      if (result.status === 200 || result.status === 500) {
        console.log(`  ✓ Status: ${result.status}`);

        // For Excel GET, check for binary data
        if (test.path.includes('excel') && test.method === 'GET') {
          const contentType = result.headers['content-type'];
          if (contentType && contentType.includes('spreadsheet')) {
            console.log(`  ✓ Content-Type: ${contentType}`);
            console.log(`  ✓ Binary file size: ${result.body.length} bytes`);
          } else {
            console.log(`  ✗ Wrong Content-Type: ${contentType}`);
          }
        } else {
          // For JSON responses
          try {
            const json = JSON.parse(result.body);
            console.log(`  ✓ Response:`, JSON.stringify(json, null, 2).split('\n').map(l => '    ' + l).join('\n'));
          } catch (e) {
            console.log(`  ✗ Invalid JSON response`);
          }
        }
      } else {
        console.log(`  ✗ Status: ${result.status}`);
      }
    } catch (error) {
      console.log(`  ✗ Error: ${error.message}`);
    }

    console.log();
  }

  console.log('✅ Tests completed');
  console.log('\n📝 Note: Make sure the dev server is running (npm run dev)');
}

main().catch(console.error);
