/**
 * Comprehensive Playwright MCP Test Script
 * Tests page rendering, console errors, responsive design, and API endpoints
 */

import { chromium } from 'playwright';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

const BASE_URL = 'http://localhost:3000';
const SCREENSHOT_DIR = join(process.cwd(), 'screenshots', 'mcp-test');

// Ensure screenshot directory exists
mkdirSync(SCREENSHOT_DIR, { recursive: true });

const pages = [
  { path: '/', name: 'Homepage', description: 'Main landing page', critical: true },
  { path: '/catalog', name: 'Catalog', description: 'Product catalog page', critical: true },
  { path: '/quote-simulator', name: 'Quote Simulator', description: 'Interactive pricing calculator', critical: true },
  { path: '/samples', name: 'Samples', description: 'Sample request page', critical: true },
  { path: '/contact', name: 'Contact', description: 'Contact form page', critical: true },
  { path: '/auth/signin', name: 'Sign In', description: 'Login page', critical: true },
  { path: '/auth/register', name: 'Register', description: 'Registration page', critical: true },
  { path: '/guide/packaging-materials', name: 'Packaging Materials Guide', description: 'Guide page', critical: false },
  { path: '/guide/food-container', name: 'Food Container Guide', description: 'Guide page', critical: false },
  { path: '/service', name: 'Service', description: 'Service information page', critical: false },
];

const apiEndpoints = [
  { path: '/api/products/search', name: 'Product Search API', method: 'GET' },
  { path: '/api/products/filter', name: 'Product Filter API', method: 'GET' },
  { path: '/api/auth/session', name: 'Session API', method: 'GET' },
];

const viewports = [
  { name: 'Mobile', width: 375, height: 667 },
  { name: 'Tablet', width: 768, height: 1024 },
  { name: 'Desktop', width: 1920, height: 1080 },
];

const results = {
  summary: {
    totalPages: pages.length,
    testedPages: 0,
    passedPages: 0,
    failedPages: 0,
    totalErrors: 0,
  },
  pages: [],
  apiTests: [],
  consoleErrors: [],
};

function formatError(type, message, url) {
  return { type, message, url, timestamp: new Date().toISOString() };
}

async function testPage(browser, pageConfig, viewport) {
  const page = await browser.newPage({
    viewport: { width: viewport.width, height: viewport.height },
  });

  const url = `${BASE_URL}${pageConfig.path}`;
  const pageResult = {
    name: pageConfig.name,
    path: pageConfig.path,
    description: pageConfig.description,
    critical: pageConfig.critical,
    viewport: viewport.name,
    url,
    loaded: false,
    loadTime: 0,
    title: '',
    consoleErrors: [],
    networkErrors: [],
    screenshot: '',
    status: 'pending',
  };

  const consoleMessages = [];
  const networkErrors = [];

  // Listen for console messages
  page.on('console', msg => {
    const type = msg.type();
    if (type === 'error') {
      const errorText = msg.text();
      consoleMessages.push({
        type: 'error',
        text: errorText,
        location: msg.location(),
      });
      results.consoleErrors.push(formatError('console', errorText, url));
      results.summary.totalErrors++;
    }
  });

  // Listen for network errors
  page.on('response', response => {
    if (response.status() >= 400) {
      networkErrors.push({
        url: response.url(),
        status: response.status(),
        statusText: response.statusText(),
      });
    }
  });

  try {
    const startTime = Date.now();
    const response = await page.goto(url, {
      waitUntil: 'networkidle',
      timeout: 30000,
    });
    const loadTime = Date.now() - startTime;

    pageResult.loaded = response.ok();
    pageResult.loadTime = loadTime;
    pageResult.status = response.status();
    pageResult.title = await page.title();

    // Take screenshot
    const screenshotFilename = `${pageConfig.name.replace(/\s+/g, '-').toLowerCase()}-${viewport.name.toLowerCase()}.png`;
    const screenshotPath = join(SCREENSHOT_DIR, screenshotFilename);
    await page.screenshot({ path: screenshotPath, fullPage: true });
    pageResult.screenshot = screenshotPath;

    // Check for critical elements
    const bodyText = await page.evaluate(() => document.body.innerText);
    pageResult.hasContent = bodyText.length > 100;

    // Store console errors
    pageResult.consoleErrors = consoleMessages;
    pageResult.networkErrors = networkErrors;

    pageResult.passed = response.ok() && consoleMessages.length === 0 && networkErrors.length === 0;

    if (pageResult.passed) {
      results.summary.passedPages++;
    } else {
      results.summary.failedPages++;
    }

    results.summary.testedPages++;

  } catch (error) {
    pageResult.error = error.message;
    pageResult.passed = false;
    results.summary.failedPages++;
    results.consoleErrors.push(formatError('navigation', error.message, url));
    results.summary.totalErrors++;
  } finally {
    await page.close();
  }

  return pageResult;
}

async function testAPIEndpoint(endpoint) {
  const result = {
    name: endpoint.name,
    path: endpoint.path,
    method: endpoint.method,
    passed: false,
    status: 0,
    error: null,
  };

  try {
    const url = `${BASE_URL}${endpoint.path}`;
    const response = await fetch(url, { method: endpoint.method });
    result.status = response.status;
    result.passed = response.status < 400;
  } catch (error) {
    result.error = error.message;
    result.passed = false;
  }

  return result;
}

async function runTests() {
  console.log('🚀 Starting Playwright MCP Tests...\n');
  console.log(`📊 Base URL: ${BASE_URL}`);
  console.log(`📸 Screenshots will be saved to: ${SCREENSHOT_DIR}\n`);

  const browser = await chromium.launch({
    headless: true,
  });

  try {
    // Test critical pages in desktop viewport first
    console.log('🔍 Testing critical pages...\n');
    for (const pageConfig of pages.filter(p => p.critical)) {
      console.log(`Testing: ${pageConfig.name} (${pageConfig.path})`);
      const result = await testPage(browser, pageConfig, viewports[2]); // Desktop
      results.pages.push(result);
      console.log(`  ✓ Status: ${result.passed ? 'PASSED' : 'FAILED'} (${result.loadTime}ms)\n`);
    }

    // Test responsive design for a subset of pages
    console.log('📱 Testing responsive design...\n');
    const responsiveTestPages = pages.filter(p => p.critical).slice(0, 3); // Test first 3 critical pages
    for (const pageConfig of responsiveTestPages) {
      for (const viewport of viewports) {
        console.log(`Testing: ${pageConfig.name} on ${viewport.name}`);
        const result = await testPage(browser, pageConfig, viewport);
        results.pages.push(result);
        console.log(`  ✓ Status: ${result.passed ? 'PASSED' : 'FAILED'}\n`);
      }
    }

    // Test API endpoints
    console.log('🔌 Testing API endpoints...\n');
    for (const endpoint of apiEndpoints) {
      console.log(`Testing: ${endpoint.name} (${endpoint.path})`);
      const result = await testAPIEndpoint(endpoint);
      results.apiTests.push(result);
      console.log(`  ✓ Status: ${result.passed ? 'PASSED' : 'FAILED'} (${result.status})\n`);
    }

  } finally {
    await browser.close();
  }

  // Generate report
  console.log('\n📊 Test Summary:');
  console.log(`Total Pages: ${results.summary.totalPages}`);
  console.log(`Tested: ${results.summary.testedPages}`);
  console.log(`Passed: ${results.summary.passedPages}`);
  console.log(`Failed: ${results.summary.failedPages}`);
  console.log(`Total Errors: ${results.summary.totalErrors}`);

  // Save detailed results
  const reportPath = join(process.cwd(), 'docs', 'reports', 'PLAYWRIGHT_MCP_VERIFICATION.json');
  mkdirSync(join(process.cwd(), 'docs', 'reports'), { recursive: true });
  writeFileSync(reportPath, JSON.stringify(results, null, 2));

  console.log(`\n📄 Detailed report saved to: ${reportPath}`);

  return results;
}

// Run tests
runTests()
  .then(results => {
    console.log('\n✅ All tests completed!');
    process.exit(results.summary.failedPages > 0 ? 1 : 0);
  })
  .catch(error => {
    console.error('\n❌ Test execution failed:', error);
    process.exit(1);
  });
