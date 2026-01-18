/**
 * Test script to verify /api/member/quotations redirect loop fix
 * Run with: node test-quotations-api-fix.js
 */

const http = require('http');

// Test configuration
const baseUrl = 'http://localhost:3002';
const testUser = {
  email: 'member@test.com',
  password: 'Member1234!'
};

async function makeRequest(path, options = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, baseUrl);
    const requestOptions = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: options.method || 'GET',
      headers: options.headers || {},
      maxRedirects: 0 // Don't follow redirects automatically
    };

    const req = http.request(requestOptions, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data
        });
      });
    });

    req.on('error', reject);
    req.end();
  });
}

async function testQuotationsAPI() {
  console.log('Testing /api/member/quotations API...\n');

  // Test 1: Check if API returns 401 (not redirect) when not authenticated
  console.log('Test 1: Unauthenticated request should return 401, not redirect');
  try {
    const response = await makeRequest('/api/member/quotations');
    console.log('  Status:', response.statusCode);

    if (response.statusCode === 401) {
      console.log('  PASS: API returned 401 (no redirect loop)');
    } else if (response.statusCode >= 300 && response.statusCode < 400) {
      console.log('  FAIL: API returned redirect (redirect loop still exists)');
      console.log('  Location:', response.headers.location);
    } else {
      console.log('  INFO: Unexpected status code:', response.statusCode);
    }
  } catch (error) {
    console.log('  ERROR:', error.message);
  }

  console.log('\nTest complete!');
  console.log('\nNext steps:');
  console.log('1. Start dev server: npm run dev');
  console.log('2. Open browser to http://localhost:3000/auth/signin');
  console.log('3. Login with member@test.com / Member1234!');
  console.log('4. Navigate to http://localhost:3000/member/quotations');
  console.log('5. Check browser console for redirect errors');
}

// Run test
testQuotationsAPI().catch(console.error);
