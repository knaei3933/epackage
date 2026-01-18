#!/usr/bin/env node

/**
 * Quick test script to verify redirect functionality
 * Tests:
 * 1. B2B routes return 404
 * 2. Portal routes return 301 redirect
 */

async function testRedirects() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  console.log('Testing redirects at:', baseUrl);
  console.log('='.repeat(60));

  const tests = [
    // B2B routes - should return 404
    { path: '/b2b/login', expectedStatus: 404, description: 'B2B login should return 404' },
    { path: '/b2b/register', expectedStatus: 404, description: 'B2B register should return 404' },
    { path: '/b2b/contracts', expectedStatus: 404, description: 'B2B contracts should return 404' },
    // Portal routes - should return 301 redirect
    { path: '/portal', expectedStatus: 301, description: 'Portal should return 301 redirect' },
    { path: '/portal/orders', expectedStatus: 301, description: 'Portal/orders should return 301 redirect' },
    { path: '/portal/profile', expectedStatus: 301, description: 'Portal/profile should return 301 redirect' },
  ];

  const results = [];

  for (const test of tests) {
    try {
      const url = `${baseUrl}${test.path}`;
      const response = await fetch(url, {
        redirect: 'manual', // Don't follow redirects automatically
        headers: {
          'User-Agent': 'Playwright-Test'
        }
      });

      const status = response.status;
      const passed = status === test.expectedStatus;

      results.push({
        ...test,
        status,
        passed,
      });

      console.log(`${passed ? '✓' : '✗'} ${test.description}`);
      console.log(`  Path: ${test.path}`);
      console.log(`  Expected: ${test.expectedStatus}, Got: ${status}`);
      if (!passed) {
        console.log(`  FAILED`);
      }
      console.log();

    } catch (error) {
      console.log(`✗ ${test.description}`);
      console.log(`  Path: ${test.path}`);
      console.log(`  Error: ${error.message}`);
      console.log();
      results.push({
        ...test,
        status: 0,
        passed: false,
        error: error.message,
      });
    }
  }

  console.log('='.repeat(60));
  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;
  console.log(`Results: ${passed} passed, ${failed} failed`);

  return failed === 0;
}

testRedirects()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('Test error:', error);
    process.exit(1);
  });
