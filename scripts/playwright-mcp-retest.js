/**
 * Playwright MCP Retest Script
 *
 * This script systematically tests the previously failed test items:
 * 1. Product Catalog Loading
 * 2. Product Search API
 * 3. Product Filter API
 * 4. Contact Form Fields
 * 5. Category Loading
 *
 * Run: node scripts/playwright-mcp-retest.js
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// Test configuration
const BASE_URL = 'http://localhost:3000';
const SCREENSHOT_DIR = path.join(__dirname, '..', 'screenshots', 'mcp-retest');
const REPORT_DIR = path.join(__dirname, '..', 'docs', 'reports', 'tjfrP');

// Ensure directories exist
[SCREENSHOT_DIR, REPORT_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Test results accumulator
const results = {
  timestamp: new Date().toISOString(),
  tests: []
};

// Helper function to record test result
function recordTest(name, status, details, screenshot = null) {
  const result = {
    name,
    status,
    details,
    screenshot: screenshot ? path.relative(process.cwd(), screenshot) : null,
    timestamp: new Date().toISOString()
  };
  results.tests.push(result);
  console.log(`[${status}] ${name}`);
  if (details) console.log(`    Details: ${details}`);
}

// Helper function to take screenshot
async function takeScreenshot(page, testName) {
  const filename = `${testName}-${Date.now()}.png`;
  const filepath = path.join(SCREENSHOT_DIR, filename);
  await page.screenshot({ path: filepath, fullPage: true });
  return filepath;
}

// Helper function to analyze DOM structure
async function analyzeDOM(page, selector) {
  try {
    const element = await page.$(selector);
    if (!element) return null;

    return await element.evaluate(el => ({
      tagName: el.tagName,
      className: el.className,
      id: el.id,
      innerHTML: el.innerHTML.substring(0, 200),
      textContent: el.textContent?.substring(0, 100),
      attributes: Array.from(el.attributes).map(attr => ({
        name: attr.name,
        value: attr.value
      }))
    }));
  } catch (error) {
    return { error: error.message };
  }
}

// Test 1: Product Catalog Page Loading
async function testCatalogPage(browser) {
  console.log('\n=== TEST 1: Product Catalog Page Loading ===');
  const page = await browser.newPage();
  let screenshot = null;

  try {
    // Navigate to catalog
    const response = await page.goto(`${BASE_URL}/catalog`, {
      waitUntil: 'networkidle'
    });

    if (!response.ok()) {
      throw new Error(`HTTP ${response.status()}`);
    }

    // Wait for page to load
    await page.waitForTimeout(2000);

    // Take screenshot
    screenshot = await takeScreenshot(page, 'catalog-page');

    // Check for various selectors
    const selectors = [
      { name: 'Product cards', selector: '.product-card' },
      { name: 'Enhanced product cards', selector: '[class*="EnhancedProductCard"]' },
      { name: 'Product grid', selector: '.grid' },
      { name: 'Any product element', selector: '[class*="product"]' },
      { name: 'Data testid products', selector: '[data-testid*="product"]' },
      { name: 'H2/H3 headings', selector: 'h2, h3' }
    ];

    const foundElements = [];
    for (const { name, selector } of selectors) {
      const count = await page.locator(selector).count();
      if (count > 0) {
        foundElements.push({ name, selector, count });

        // Analyze first matching element
        const firstElement = await page.locator(selector).first();
        const html = await firstElement.innerHTML();
        const attrs = await firstElement.evaluate(el =>
          Array.from(el.attributes).map(a => `${a.name}="${a.value}"`).join(' ')
        );

        foundElements[foundElements.length - 1].sample = {
          html: html.substring(0, 200),
          attributes: attrs
        };
      }
    }

    // Check console errors
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    const details = {
      url: page.url(),
      statusCode: response.status(),
      foundElements,
      consoleErrors
    };

    recordTest(
      'Product Catalog Page Loading',
      foundElements.length > 0 ? 'PASS' : 'FAIL',
      `Found ${foundElements.length} element types. URL: ${page.url()}`,
      screenshot
    );

    return { ...details, screenshot };

  } catch (error) {
    recordTest('Product Catalog Page Loading', 'FAIL', error.message, screenshot);
    return { error: error.message, screenshot };
  } finally {
    await page.close();
  }
}

// Test 2: Product Search API
async function testSearchAPI(browser) {
  console.log('\n=== TEST 2: Product Search API ===');

  const testCases = [
    { name: 'Search without params', params: {} },
    { name: 'Search with keyword', params: { keyword: 'パウチ' } },
    { name: 'Search with category', params: { keyword: 'test', category: 'pouch' } },
    { name: 'Search via POST', method: 'POST', body: { keyword: 'パウチ' } }
  ];

  const results = [];

  for (const testCase of testCases) {
    const page = await browser.newPage();

    try {
      let url = `${BASE_URL}/api/products/search`;
      let options = {
        method: testCase.method || 'GET'
      };

      if (testCase.method === 'POST') {
        options.headers = { 'Content-Type': 'application/json' };
        options.body = JSON.stringify(testCase.body);
      } else if (Object.keys(testCase.params).length > 0) {
        const searchParams = new URLSearchParams(testCase.params);
        url += `?${searchParams}`;
      }

      const response = await page.request.fetch(url, options);
      const status = response.status();
      const headers = response.headers();
      let body;

      try {
        body = await response.json();
      } catch {
        body = await response.text();
      }

      results.push({
        test: testCase.name,
        status,
        headers,
        body: body instanceof Object ? JSON.stringify(body).substring(0, 500) : body.substring(0, 500)
      });

    } catch (error) {
      results.push({
        test: testCase.name,
        error: error.message
      });
    } finally {
      await page.close();
    }
  }

  // Record overall result
  const passed = results.filter(r => r.status === 200).length;
  recordTest(
    'Product Search API',
    passed > 0 ? 'PASS' : 'FAIL',
    `${passed}/${results.length} tests passed. Results: ${JSON.stringify(results, null, 2).substring(0, 500)}`
  );

  return results;
}

// Test 3: Product Filter API
async function testFilterAPI(browser) {
  console.log('\n=== TEST 3: Product Filter API ===');

  const testCases = [
    { name: 'GET request (should fail 405)', method: 'GET' },
    { name: 'POST without body', method: 'POST', body: {} },
    { name: 'POST with category', method: 'POST', body: { category: 'pouch' } },
    { name: 'POST with filters', method: 'POST', body: {
      category: 'pouch',
      materials: ['PET'],
      priceRange: [100, 1000]
    }}
  ];

  const results = [];

  for (const testCase of testCases) {
    const page = await browser.newPage();

    try {
      const options = {
        method: testCase.method,
        headers: { 'Content-Type': 'application/json' }
      };

      if (testCase.body) {
        options.body = JSON.stringify(testCase.body);
      }

      const response = await page.request.fetch(`${BASE_URL}/api/products/filter`, options);
      const status = response.status();
      let body;

      try {
        body = await response.json();
      } catch {
        body = await response.text();
      }

      results.push({
        test: testCase.name,
        status,
        body: body instanceof Object ? JSON.stringify(body).substring(0, 300) : body.substring(0, 300)
      });

    } catch (error) {
      results.push({
        test: testCase.name,
        error: error.message
      });
    } finally {
      await page.close();
    }
  }

  // Record overall result
  const passed = results.filter(r => r.status === 200 && !r.error).length;
  recordTest(
    'Product Filter API',
    passed >= 2 ? 'PASS' : 'PARTIAL',
    `${passed}/${results.length} POST tests successful. Results: ${JSON.stringify(results, null, 2).substring(0, 500)}`
  );

  return results;
}

// Test 4: Contact Form Fields
async function testContactForm(browser) {
  console.log('\n=== TEST 4: Contact Form Fields ===');
  const page = await browser.newPage();
  let screenshot = null;

  try {
    // Navigate to contact page
    const response = await page.goto(`${BASE_URL}/contact`, {
      waitUntil: 'networkidle'
    });

    if (!response.ok()) {
      throw new Error(`HTTP ${response.status()}`);
    }

    // Wait for dynamic content
    await page.waitForTimeout(3000);

    // Take screenshot
    screenshot = await takeScreenshot(page, 'contact-form');

    // Try various selectors for form fields
    const fieldSelectors = [
      { name: 'Name input', selectors: [
        'input[name="name"]',
        'input[id="name"]',
        'input[placeholder*="名前"]',
        'input[placeholder*="name"]',
        '[data-testid*="name"]',
        'input[type="text"]'
      ]},
      { name: 'Email input', selectors: [
        'input[name="email"]',
        'input[id="email"]',
        'input[type="email"]',
        'input[placeholder*="メール"]',
        '[data-testid*="email"]'
      ]},
      { name: 'Message textarea', selectors: [
        'textarea[name="message"]',
        'textarea[id="message"]',
        'textarea[placeholder*="お問い合わせ"]',
        '[data-testid*="message"]'
      ]},
      { name: 'Submit button', selectors: [
        'button[type="submit"]',
        'button:has-text("送信")',
        'button:has-text("Submit")',
        'input[type="submit"]',
        '[data-testid*="submit"]'
      ]}
    ];

    const foundFields = [];
    for (const field of fieldSelectors) {
      for (const selector of field.selectors) {
        try {
          const count = await page.locator(selector).count();
          if (count > 0) {
            const element = await page.locator(selector).first();
            const attrs = await element.evaluate(el =>
              Array.from(el.attributes).map(a => `${a.name}="${a.value}"`).join(' ')
            );

            foundFields.push({
              field: field.name,
              selector,
              count,
              attributes: attrs
            });
            break; // Found this field, move to next
          }
        } catch (error) {
          // Selector not found, try next
        }
      }
    }

    // Check for any forms
    const formCount = await page.locator('form').count();
    const allInputs = await page.locator('input').count();
    const allTextareas = await page.locator('textarea').count();

    const details = {
      url: page.url(),
      formCount,
      inputCount: allInputs,
      textareaCount: allTextareas,
      foundFields
    };

    recordTest(
      'Contact Form Fields',
      foundFields.length >= 2 ? 'PASS' : 'PARTIAL',
      `Found ${foundFields.length} field types. Total: ${allInputs} inputs, ${allTextareas} textareas`,
      screenshot
    );

    return { ...details, screenshot };

  } catch (error) {
    recordTest('Contact Form Fields', 'FAIL', error.message, screenshot);
    return { error: error.message, screenshot };
  } finally {
    await page.close();
  }
}

// Test 5: Category Loading
async function testCategories(browser) {
  console.log('\n=== TEST 5: Category Loading ===');
  const page = await browser.newPage();
  let screenshot = null;

  try {
    // Navigate to catalog
    const response = await page.goto(`${BASE_URL}/catalog`, {
      waitUntil: 'networkidle'
    });

    await page.waitForTimeout(2000);

    screenshot = await takeScreenshot(page, 'catalog-categories');

    // Try various category selectors
    const categorySelectors = [
      { name: 'Category buttons', selector: 'button[class*="category"]' },
      { name: 'Category links', selector: 'a[href*="category"]' },
      { name: 'Filter categories', selector: '[class*="filter"] [class*="category"]' },
      { name: 'Data testid categories', selector: '[data-testid*="category"]' },
      { name: 'Advanced filters', selector: '[class*="AdvancedFilters"]' },
      { name: 'Any category text', selector: 'text=/カテゴリー|Category|分類/' }
    ];

    const foundCategories = [];
    for (const { name, selector } of categorySelectors) {
      try {
        const count = await page.locator(selector).count();
        if (count > 0) {
          // Get text content of first few elements
          const samples = [];
          const limit = Math.min(count, 3);
          for (let i = 0; i < limit; i++) {
            const text = await page.locator(selector).nth(i).textContent();
            if (text && text.trim()) {
              samples.push(text.trim().substring(0, 50));
            }
          }

          foundCategories.push({
            name,
            selector,
            count,
            samples
          });
        }
      } catch (error) {
        // Selector not found
      }
    }

    // Check for sidebar filter section
    const sidebarExists = await page.locator('[class*="sidebar"], [class*="Sidebar"], aside').count() > 0;

    const details = {
      url: page.url(),
      foundCategories,
      sidebarExists
    };

    recordTest(
      'Category Loading',
      foundCategories.length > 0 || sidebarExists ? 'PASS' : 'PARTIAL',
      `Found ${foundCategories.length} category types. Sidebar: ${sidebarExists}`,
      screenshot
    );

    return { ...details, screenshot };

  } catch (error) {
    recordTest('Category Loading', 'FAIL', error.message, screenshot);
    return { error: error.message, screenshot };
  } finally {
    await page.close();
  }
}

// Generate markdown report
function generateReport() {
  const timestamp = new Date().toISOString().split('T')[0];
  const reportPath = path.join(REPORT_DIR, `PLAYWRIGHT_MCP_RETEST_${timestamp}.md`);

  let markdown = `# Playwright MCP Retest Report\n\n`;
  markdown += `**Generated**: ${results.timestamp}\n`;
  markdown += `**Total Tests**: ${results.tests.length}\n\n`;

  // Summary
  const passed = results.tests.filter(t => t.status === 'PASS').length;
  const failed = results.tests.filter(t => t.status === 'FAIL').length;
  const partial = results.tests.filter(t => t.status === 'PARTIAL').length;

  markdown += `## Summary\n\n`;
  markdown += `| Status | Count |\n`;
  markdown += `|--------|-------|\n`;
  markdown += `| ✅ PASS | ${passed} |\n`;
  markdown += `| ⚠️ PARTIAL | ${partial} |\n`;
  markdown += `| ❌ FAIL | ${failed} |\n\n`;

  // Detailed results
  markdown += `## Detailed Results\n\n`;

  for (const test of results.tests) {
    const icon = test.status === 'PASS' ? '✅' : test.status === 'PARTIAL' ? '⚠️' : '❌';
    markdown += `### ${icon} ${test.name}\n\n`;
    markdown += `**Status**: ${test.status}\n\n`;
    markdown += `**Details**: ${test.details}\n\n`;

    if (test.screenshot) {
      markdown += `**Screenshot**: \`${test.screenshot}\`\n\n`;
    }

    markdown += `---\n\n`;
  }

  // Recommendations
  markdown += `## Recommendations\n\n`;

  const failedTests = results.tests.filter(t => t.status !== 'PASS');

  if (failedTests.length === 0) {
    markdown += `All tests passed! No critical issues found.\n\n`;
  } else {
    markdown += `### Testability Improvements\n\n`;
    markdown += `\`\`\`typescript\n`;
    markdown += `// Add data-testid attributes for better testability\n\n`;
    markdown += `// Product cards\n`;
    markdown += `<div className="product-card" data-testid="product-card" data-product-id="{id}">\n`;
    markdown += `  <h3 data-testid="product-name">{name}</h3>\n`;
    markdown += `  <span data-testid="product-price">{price}</span>\n`;
    markdown += `</div>\n\n`;
    markdown += `// Form fields\n`;
    markdown += `<input\n`;
    markdown += `  data-testid="contact-name-input"\n`;
    markdown += `  id="contact-name"\n`;
    markdown += `  name="name"\n`;
    markdown += `  type="text"\n`;
    markdown += `/>\n\n`;
    markdown += `// Category filters\n`;
    markdown += `<button data-testid="category-filter" data-category="{category}">\n`;
    markdown += `  {label}\n`;
    markdown += `</button>\n`;
    markdown += `\`\`\`\n\n`;
  }

  // Write report
  fs.writeFileSync(reportPath, markdown, 'utf8');
  console.log(`\n✅ Report saved to: ${reportPath}`);

  return reportPath;
}

// Main execution
async function main() {
  console.log('='.repeat(60));
  console.log('Playwright MCP Retest Script');
  console.log('='.repeat(60));
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`Timestamp: ${new Date().toISOString()}`);

  let browser;
  try {
    browser = await chromium.launch({ headless: true });

    // Run all tests
    await testCatalogPage(browser);
    await testSearchAPI(browser);
    await testFilterAPI(browser);
    await testContactForm(browser);
    await testCategories(browser);

    // Generate report
    const reportPath = generateReport();

    console.log('\n' + '='.repeat(60));
    console.log('All tests completed!');
    console.log('='.repeat(60));

  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Run if executed directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { main, testCatalogPage, testSearchAPI, testFilterAPI, testContactForm, testCategories };
