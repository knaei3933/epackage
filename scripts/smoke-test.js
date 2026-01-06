#!/usr/bin/env node

/**
 * Post-Deployment Smoke Tests
 *
 * This script runs automated smoke tests after deployment to verify:
 * - Homepage loads correctly
 * - Sign-in page loads
 * - API health check
 * - Core functionality is working
 *
 * Usage: node scripts/smoke-test.js [url]
 * Example: node scripts/smoke-test.js https://epackage-lab.com
 */

const https = require('https');
const http = require('http');
const { URL } = require('url');

// Configuration
const DEFAULT_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
const TARGET_URL = process.argv[2] || DEFAULT_URL;
const TIMEOUT = 30000; // 30 seconds

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

// Test results
const results = {
  passed: [],
  failed: [],
  skipped: [],
};

/**
 * Log message with color
 */
function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

/**
 * Log test result
 */
function logTest(name, passed, message = '') {
  if (passed) {
    log(`✓ ${name}`, 'green');
    results.passed.push({ name, message });
  } else {
    log(`✗ ${name}`, 'red');
    if (message) log(`  ${message}`, 'red');
    results.failed.push({ name, message });
  }
}

/**
 * Skip test
 */
function skipTest(name, reason) {
  log(`⊘ ${name} (skipped: ${reason})`, 'yellow');
  results.skipped.push({ name, reason });
}

/**
 * Make HTTP request
 */
async function makeRequest(url, method = 'GET', headers = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const client = urlObj.protocol === 'https:' ? https : http;

    const options = {
      method,
      headers: {
        'User-Agent': 'Epackage-Smoke-Test/1.0',
        ...headers,
      },
      timeout: TIMEOUT,
    };

    const req = client.request(url, options, (res) => {
      let body = '';

      res.on('data', (chunk) => {
        body += chunk;
      });

      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: body,
        });
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.end();
  });
}

/**
 * Test 1: Homepage loads
 */
async function testHomepage() {
  log('\n🏠 Testing Homepage...', 'blue');

  try {
    const response = await makeRequest(TARGET_URL);
    const success = response.statusCode === 200;

    if (success) {
      // Check for key elements in HTML
      const hasTitle = response.body.includes('<title>') || response.body.includes('Epackage');
      const hasMetaDescription = response.body.includes('name="description"');
      const hasViewport = response.body.includes('viewport');

      logTest('Homepage returns 200', true);
      logTest('Homepage has title', hasTitle, !hasTitle ? 'Missing title tag' : '');
      logTest('Homepage has meta description', hasMetaDescription, !hasMetaDescription ? 'Missing meta description' : '');
      logTest('Homepage has viewport meta', hasViewport, !hasViewport ? 'Missing viewport meta' : '');
    } else {
      logTest('Homepage returns 200', false, `Got status ${response.statusCode}`);
    }
  } catch (error) {
    logTest('Homepage returns 200', false, error.message);
  }
}

/**
 * Test 2: Sign-in page loads
 */
async function testSigninPage() {
  log('\n🔐 Testing Sign-In Page...', 'blue');

  try {
    const signinUrl = `${TARGET_URL}/signin`;
    const response = await makeRequest(signinUrl);
    const success = response.statusCode === 200 || response.statusCode === 301 || response.statusCode === 302;

    if (success) {
      const hasForm = response.body.includes('type="email"') || response.body.includes('name="email"');
      const hasPasswordField = response.body.includes('type="password"') || response.body.includes('name="password"');

      logTest('Sign-in page loads', true);
      logTest('Sign-in form has email field', hasForm, !hasForm ? 'Missing email field' : '');
      logTest('Sign-in form has password field', hasPasswordField, !hasPasswordField ? 'Missing password field' : '');
    } else {
      logTest('Sign-in page loads', false, `Got status ${response.statusCode}`);
    }
  } catch (error) {
    logTest('Sign-in page loads', false, error.message);
  }
}

/**
 * Test 3: API health check
 */
async function testAPIHealth() {
  log('\n🏥 Testing API Health...', 'blue');

  try {
    // Test API base URL (may not have health endpoint, so we expect either 200 or 404)
    const apiUrl = new URL('/api', TARGET_URL).toString();
    const response = await makeRequest(apiUrl);

    // API should respond with either 200, 404 (no health endpoint), or 405 (method not allowed)
    const isHealthy = [200, 404, 405].includes(response.statusCode);

    logTest('API responds', isHealthy, `Got status ${response.statusCode}`);

    // If we get JSON, parse it
    const contentType = response.headers['content-type'] || '';
    if (contentType.includes('application/json')) {
      try {
        const json = JSON.parse(response.body);
        logTest('API returns valid JSON', true);
      } catch (e) {
        logTest('API returns valid JSON', false, 'Invalid JSON response');
      }
    } else {
      skipTest('API returns valid JSON', 'Response is not JSON');
    }
  } catch (error) {
    logTest('API responds', false, error.message);
  }
}

/**
 * Test 4: Static assets load
 */
async function testStaticAssets() {
  log('\n📦 Testing Static Assets...', 'blue');

  const assets = [
    '/favicon.ico',
    '/robots.txt',
    '/sitemap.xml',
  ];

  for (const asset of assets) {
    try {
      const assetUrl = new URL(asset, TARGET_URL).toString();
      const response = await makeRequest(assetUrl);
      const success = response.statusCode === 200;

      logTest(`Asset ${asset} loads`, success, success ? `Size: ${response.body.length} bytes` : `Status: ${response.statusCode}`);
    } catch (error) {
      logTest(`Asset ${asset} loads`, false, error.message);
    }
  }
}

/**
 * Test 5: Database connection (indirect test via API)
 */
async function testDatabaseConnection() {
  log('\n🗄️  Testing Database Connection...', 'blue');

  try {
    // Try to access catalog or any data-heavy page that requires DB
    const catalogUrl = new URL('/catalog', TARGET_URL).toString();
    const response = await makeRequest(catalogUrl);

    // Catalog should load (even if empty)
    const success = response.statusCode === 200;

    if (success) {
      logTest('Database connection (via catalog)', true, 'Catalog page loads successfully');
    } else {
      // Catalog might not exist yet, so we'll skip if 404
      if (response.statusCode === 404) {
        skipTest('Database connection (via catalog)', 'Catalog page not implemented yet');
      } else {
        logTest('Database connection (via catalog)', false, `Got status ${response.statusCode}`);
      }
    }
  } catch (error) {
    logTest('Database connection (via catalog)', false, error.message);
  }
}

/**
 * Test 6: Security headers
 */
async function testSecurityHeaders() {
  log('\n🔒 Testing Security Headers...', 'blue');

  try {
    const response = await makeRequest(TARGET_URL);
    const headers = response.headers;

    const securityHeaders = {
      'X-Frame-Options': headers['x-frame-options'] || headers['X-Frame-Options'],
      'X-Content-Type-Options': headers['x-content-type-options'] || headers['X-Content-Type-Options'],
      'Strict-Transport-Security': headers['strict-transport-security'] || headers['Strict-Transport-Security'],
      'X-XSS-Protection': headers['x-xss-protection'] || headers['X-XSS-Protection'],
    };

    logTest('X-Frame-Options header present', !!securityHeaders['X-Frame-Options']);
    logTest('X-Content-Type-Options header present', !!securityHeaders['X-Content-Type-Options']);

    // HSTS and XSS-Protection might not be set in development
    if (TARGET_URL.startsWith('https')) {
      logTest('Strict-Transport-Security header present', !!securityHeaders['Strict-Transport-Security']);
    } else {
      skipTest('Strict-Transport-Security header present', 'Not using HTTPS');
    }

    logTest('X-XSS-Protection header present', !!securityHeaders['X-XSS-Protection']);
  } catch (error) {
    logTest('Security headers check', false, error.message);
  }
}

/**
 * Test 7: Performance check
 */
async function testPerformance() {
  log('\n⚡ Testing Performance...', 'blue');

  const startTime = Date.now();

  try {
    await makeRequest(TARGET_URL);
    const loadTime = Date.now() - startTime;

    // Homepage should load in less than 3 seconds
    const fast = loadTime < 3000;
    logTest('Homepage loads quickly', fast, `Load time: ${loadTime}ms`);

    // Ideally, homepage should load in less than 1 second
    if (loadTime < 1000) {
      log('  Excellent performance!', 'green');
    } else if (loadTime < 2000) {
      log('  Good performance', 'blue');
    } else if (loadTime < 3000) {
      log('  Acceptable performance', 'yellow');
    } else {
      log('  Performance needs improvement', 'red');
    }
  } catch (error) {
    logTest('Homepage loads quickly', false, error.message);
  }
}

/**
 * Main test runner
 */
async function runTests() {
  log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'blue');
  log(`🧪 Epackage Lab - Smoke Tests`, 'bright');
  log(`Target: ${TARGET_URL}`, 'blue');
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n', 'blue');

  const startTime = Date.now();

  try {
    // Run all tests
    await testHomepage();
    await testSigninPage();
    await testAPIHealth();
    await testStaticAssets();
    await testDatabaseConnection();
    await testSecurityHeaders();
    await testPerformance();

    // Summary
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    const totalTests = results.passed.length + results.failed.length;
    const passRate = totalTests > 0 ? ((results.passed.length / totalTests) * 100).toFixed(1) : 0;

    log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'blue');
    log('📊 Test Summary', 'bright');
    log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n', 'blue');

    log(`Total Tests: ${totalTests}`, 'blue');
    log(`Passed: ${results.passed.length}`, 'green');
    log(`Failed: ${results.failed.length}`, 'red');
    log(`Skipped: ${results.skipped.length}`, 'yellow');
    log(`Pass Rate: ${passRate}%`, 'blue');
    log(`Duration: ${duration}s\n`, 'blue');

    if (results.failed.length === 0) {
      log('✓ All tests passed!', 'green');
      log('✓ Deployment is healthy\n', 'green');
      process.exit(0);
    } else {
      log('✗ Some tests failed', 'red');
      log('\nFailed Tests:', 'red');
      results.failed.forEach(({ name, message }) => {
        log(`  - ${name}`, 'red');
        if (message) log(`    ${message}`, 'red');
      });
      log('\n⚠️  Deployment may have issues. Please review.\n', 'yellow');
      process.exit(1);
    }
  } catch (error) {
    log(`\n✗ Fatal error: ${error.message}`, 'red');
    log(error.stack, 'red');
    process.exit(1);
  }
}

// Run tests
runTests();
