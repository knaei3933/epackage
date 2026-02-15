/**
 * Member Pages Audit Script
 *
 * Generates detailed HTML report for all member pages including:
 * - HTTP status codes
 * - Page load times
 * - UI element inventory
 * - Screenshot capture
 * - Error detection
 * - Navigation verification
 */

import { test, expect } from '@playwright/test';

const MEMBER_PAGES = [
  { path: '/member/dashboard', name: 'Dashboard', description: '会員ダッシュボード' },
  { path: '/member/profile', name: 'Profile', description: '会員プロフィール' },
  { path: '/member/edit', name: 'Edit Profile', description: 'プロフィール編集' },
  { path: '/member/orders/new', name: 'New Orders', description: '新規注文' },
  { path: '/member/orders/history', name: 'Order History', description: '注文履歴' },
  { path: '/member/deliveries', name: 'Deliveries', description: '配送状況' },
  { path: '/member/invoices', name: 'Invoices', description: '請求書' },
  { path: '/member/quotations', name: 'Quotations', description: '見積依頼' },
  { path: '/member/samples', name: 'Samples', description: 'サンプル依頼' },
  { path: '/member/inquiries', name: 'Inquiries', description: 'お問い合わせ' },
];

interface PageAuditResult {
  path: string;
  name: string;
  status: 'success' | 'error' | 'redirect';
  httpStatus: number;
  loadTime: number;
  title?: string;
  elements: {
    headings: number;
    buttons: number;
    links: number;
    forms: number;
    inputs: number;
    cards: number;
  };
  issues: string[];
  screenshot: string;
}

const auditResults: PageAuditResult[] = [];

test.describe('Member Pages Audit', () => {
  test.beforeAll(async ({ request }) => {
    // Create screenshots directory
    const fs = require('fs');
    const path = require('path');
    const screenshotDir = path.join(process.cwd(), 'test-results', 'member-pages-audit');

    if (!fs.existsSync(screenshotDir)) {
      fs.mkdirSync(screenshotDir, { recursive: true });
    }
  });

  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/auth/signin');
    await page.fill('input[type="email"]', 'test@epackage-lab.com');
    await page.fill('input[type="password"]', 'Test1234!');
    await page.click('button[type="submit"]');

    // Wait for successful login
    await page.waitForURL('**/member/dashboard', { timeout: 10000 }).catch(() => {});
  });

  MEMBER_PAGES.forEach(({ path, name, description }) => {
    test(`${name} (${description}) - Full Audit`, async ({ page }) => {
      const result: PageAuditResult = {
        path,
        name,
        status: 'success',
        httpStatus: 200,
        loadTime: 0,
        elements: {
          headings: 0,
          buttons: 0,
          links: 0,
          forms: 0,
          inputs: 0,
          cards: 0,
        },
        issues: [],
        screenshot: '',
      };

      // Measure page load time
      const startTime = Date.now();

      try {
        // Navigate to page
        const response = await page.goto(path);

        // Get HTTP status
        result.httpStatus = response?.status() || 200;
        result.status = response?.ok() ? 'success' : 'error';

        // Wait for page to fully load
        await page.waitForLoadState('networkidle', { timeout: 5000 });
        result.loadTime = Date.now() - startTime;

        // Get page title
        const titleElement = page.locator('h1, h2').first();
        if (await titleElement.count() > 0) {
          result.title = await titleElement.textContent() || undefined;
        }

        // Count UI elements
        result.elements.headings = await page.locator('h1, h2, h3, h4, h5, h6').count();
        result.elements.buttons = await page.locator('button').count();
        result.elements.links = await page.locator('a').count();
        result.elements.forms = await page.locator('form').count();
        result.elements.inputs = await page.locator('input, select, textarea').count();
        result.elements.cards = await page.locator('[class*="card"], [class*="Card"]').count();

        // Check for issues
        if (result.httpStatus !== 200) {
          result.issues.push(`HTTP ${result.httpStatus} - Expected 200`);
        }

        if (result.loadTime > 3000) {
          result.issues.push(`Slow load time: ${result.loadTime}ms (target: <3000ms)`);
        }

        if (result.elements.headings === 0) {
          result.issues.push('No headings found (accessibility issue)');
        }

        // Check for JavaScript errors
        page.on('console', (msg) => {
          if (msg.type() === 'error') {
            result.issues.push(`JS Error: ${msg.text()}`);
          }
        });

        // Check for broken images
        const images = page.locator('img');
        const imageCount = await images.count();

        for (let i = 0; i < imageCount; i++) {
          const img = images.nth(i);
          const src = await img.getAttribute('src');

          if (src) {
            const isBroken = await img.evaluate((el: HTMLImageElement) => el.naturalWidth === 0);
            if (isBroken) {
              result.issues.push(`Broken image: ${src}`);
            }
          }
        }

        // Take screenshot
        const screenshotPath = `test-results/member-pages-audit/${name.replace(/\s+/g, '-').toLowerCase()}.png`;
        await page.screenshot({
          path: screenshotPath,
          fullPage: true,
        });
        result.screenshot = screenshotPath;

        // Verify navigation links
        const navLinks = page.locator('nav a, [role="navigation"] a');
        const navLinkCount = await navLinks.count();

        if (navLinkCount === 0) {
          result.issues.push('No navigation links found');
        }

        // Verify presence of main content area
        const main = page.locator('main, [role="main"]');
        const mainCount = await main.count();

        if (mainCount === 0) {
          result.issues.push('No main content area found (semantic HTML issue)');
        }

        // Check for empty state messages if no data
        const emptyState = page.locator('text=/ありません|データがありません|Empty/');
        const hasEmptyState = await emptyState.count() > 0;

        if (hasEmptyState) {
          console.log(`  ✓ Empty state detected for ${name}`);
        }

        // Log specific findings
        console.log(`\n${name} (${description}):`);
        console.log(`  Status: ${result.status} (${result.httpStatus})`);
        console.log(`  Load Time: ${result.loadTime}ms`);
        console.log(`  Title: ${result.title || 'N/A'}`);
        console.log(`  Elements: ${result.elements.headings} headings, ${result.elements.buttons} buttons, ${result.elements.links} links`);
        console.log(`  Issues: ${result.issues.length > 0 ? result.issues.join(', ') : 'None'}`);

      } catch (error) {
        result.status = 'error';
        result.issues.push(`Navigation error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        console.error(`  ✗ Error accessing ${path}:`, error);
      }

      // Store results
      auditResults.push(result);

      // Assert basic requirements
      expect(result.status).toBe('success');
      expect(result.httpStatus).toBe(200);
      expect(result.issues.length).toBe(0);
    });
  });

  test('Generate Audit Report', async ({ page }) => {
    // Generate HTML report
    const reportHtml = generateAuditReport(auditResults);

    const fs = require('fs');
    const path = require('path');
    const reportPath = path.join(process.cwd(), 'test-results', 'member-pages-audit', 'report.html');

    fs.writeFileSync(reportPath, reportHtml, 'utf-8');

    console.log(`\n✓ Audit report generated: ${reportPath}`);

    // Also generate JSON summary
    const summaryPath = path.join(process.cwd(), 'test-results', 'member-pages-audit', 'summary.json');
    fs.writeFileSync(summaryPath, JSON.stringify(auditResults, null, 2), 'utf-8');

    console.log(`✓ Summary JSON generated: ${summaryPath}`);

    // Print summary to console
    console.log('\n=== Member Pages Audit Summary ===');
    console.log(`Total Pages: ${auditResults.length}`);
    console.log(`Successful: ${auditResults.filter(r => r.status === 'success').length}`);
    console.log(`Errors: ${auditResults.filter(r => r.status === 'error').length}`);

    const avgLoadTime = auditResults.reduce((sum, r) => sum + r.loadTime, 0) / auditResults.length;
    console.log(`Average Load Time: ${avgLoadTime.toFixed(0)}ms`);

    const totalIssues = auditResults.reduce((sum, r) => sum + r.issues.length, 0);
    console.log(`Total Issues: ${totalIssues}`);

    if (totalIssues > 0) {
      console.log('\nIssues by Page:');
      auditResults.forEach(result => {
        if (result.issues.length > 0) {
          console.log(`  ${result.name}:`);
          result.issues.forEach(issue => console.log(`    - ${issue}`));
        }
      });
    }
  });
});

function generateAuditReport(results: PageAuditResult[]): string {
  const timestamp = new Date().toLocaleString('ja-JP');
  const successCount = results.filter(r => r.status === 'success').length;
  const errorCount = results.filter(r => r.status === 'error').length;
  const avgLoadTime = results.reduce((sum, r) => sum + r.loadTime, 0) / results.length;
  const totalIssues = results.reduce((sum, r) => sum + r.issues.length, 0);

  return `
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Member Pages Audit Report - Epackage Lab</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Hiragino Sans', 'Noto Sans JP', sans-serif;
      background: #f5f5f5;
      padding: 20px;
      line-height: 1.6;
    }
    .container {
      max-width: 1200px;
      margin: 0 auto;
      background: white;
      padding: 30px;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    h1 {
      color: #333;
      border-bottom: 3px solid #4a90a4;
      padding-bottom: 10px;
      margin-bottom: 20px;
    }
    h2 {
      color: #555;
      margin-top: 30px;
      margin-bottom: 15px;
      padding-left: 10px;
      border-left: 4px solid #4a90a4;
    }
    .summary {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 15px;
      margin: 20px 0;
    }
    .summary-card {
      background: #f8f9fa;
      padding: 15px;
      border-radius: 6px;
      border-left: 4px solid #4a90a4;
    }
    .summary-card .label {
      font-size: 12px;
      color: #666;
      text-transform: uppercase;
    }
    .summary-card .value {
      font-size: 24px;
      font-weight: bold;
      color: #333;
      margin-top: 5px;
    }
    .summary-card.success { border-left-color: #28a745; }
    .summary-card.error { border-left-color: #dc3545; }
    .summary-card.warning { border-left-color: #ffc107; }
    .page-results {
      display: grid;
      gap: 20px;
      margin-top: 20px;
    }
    .page-card {
      border: 1px solid #e0e0e0;
      border-radius: 6px;
      padding: 20px;
      background: #fafafa;
    }
    .page-card.success { border-left: 4px solid #28a745; }
    .page-card.error { border-left: 4px solid #dc3545; }
    .page-card h3 {
      margin-bottom: 10px;
      color: #333;
    }
    .page-meta {
      display: flex;
      flex-wrap: wrap;
      gap: 15px;
      margin: 10px 0;
      font-size: 13px;
      color: #666;
    }
    .page-meta span {
      background: #e9ecef;
      padding: 4px 8px;
      border-radius: 4px;
    }
    .elements-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
      gap: 10px;
      margin: 15px 0;
    }
    .element-stat {
      background: white;
      padding: 10px;
      border-radius: 4px;
      text-align: center;
      border: 1px solid #e0e0e0;
    }
    .element-stat .count {
      font-size: 20px;
      font-weight: bold;
      color: #4a90a4;
    }
    .element-stat .label {
      font-size: 11px;
      color: #666;
      margin-top: 3px;
    }
    .issues {
      margin-top: 15px;
      padding: 10px;
      background: #fff3cd;
      border-left: 3px solid #ffc107;
      border-radius: 4px;
    }
    .issues ul {
      margin-left: 20px;
      margin-top: 5px;
    }
    .issues li {
      color: #856404;
      margin: 3px 0;
    }
    .screenshot-link {
      display: inline-block;
      margin-top: 10px;
      padding: 6px 12px;
      background: #4a90a4;
      color: white;
      text-decoration: none;
      border-radius: 4px;
      font-size: 13px;
    }
    .screenshot-link:hover {
      background: #3a7a8e;
    }
    .timestamp {
      text-align: right;
      color: #999;
      font-size: 12px;
      margin-top: 30px;
    }
    .badge {
      display: inline-block;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: bold;
      text-transform: uppercase;
    }
    .badge-success { background: #d4edda; color: #155724; }
    .badge-error { background: #f8d7da; color: #721c24; }
  </style>
</head>
<body>
  <div class="container">
    <h1>Member Pages Audit Report</h1>
    <p style="color: #666; margin-bottom: 20px;">
      Epackage Lab会員ページ総合監査レポート
    </p>

    <div class="summary">
      <div class="summary-card">
        <div class="label">Total Pages</div>
        <div class="value">${results.length}</div>
      </div>
      <div class="summary-card success">
        <div class="label">Successful</div>
        <div class="value">${successCount}</div>
      </div>
      <div class="summary-card ${errorCount > 0 ? 'error' : 'success'}">
        <div class="label">Errors</div>
        <div class="value">${errorCount}</div>
      </div>
      <div class="summary-card ${avgLoadTime < 2000 ? 'success' : 'warning'}">
        <div class="label">Avg Load Time</div>
        <div class="value">${avgLoadTime.toFixed(0)}ms</div>
      </div>
      <div class="summary-card ${totalIssues === 0 ? 'success' : 'warning'}">
        <div class="label">Total Issues</div>
        <div class="value">${totalIssues}</div>
      </div>
    </div>

    <h2>Page Details</h2>
    <div class="page-results">
      ${results.map(result => `
        <div class="page-card ${result.status}">
          <h3>
            ${result.name}
            <span class="badge badge-${result.status}">${result.status}</span>
          </h3>
          <p style="color: #666; margin: 5px 0 10px;">${result.path}</p>

          <div class="page-meta">
            <span>HTTP ${result.httpStatus}</span>
            <span>${result.loadTime}ms</span>
            <span>${result.title || 'No Title'}</span>
          </div>

          <div class="elements-grid">
            <div class="element-stat">
              <div class="count">${result.elements.headings}</div>
              <div class="label">Headings</div>
            </div>
            <div class="element-stat">
              <div class="count">${result.elements.buttons}</div>
              <div class="label">Buttons</div>
            </div>
            <div class="element-stat">
              <div class="count">${result.elements.links}</div>
              <div class="label">Links</div>
            </div>
            <div class="element-stat">
              <div class="count">${result.elements.forms}</div>
              <div class="label">Forms</div>
            </div>
            <div class="element-stat">
              <div class="count">${result.elements.inputs}</div>
              <div class="label">Inputs</div>
            </div>
            <div class="element-stat">
              <div class="count">${result.elements.cards}</div>
              <div class="label">Cards</div>
            </div>
          </div>

          ${result.issues.length > 0 ? `
            <div class="issues">
              <strong>Issues Found:</strong>
              <ul>
                ${result.issues.map(issue => `<li>${issue}</li>`).join('')}
              </ul>
            </div>
          ` : ''}

          <a href="${result.screenshot}" target="_blank" class="screenshot-link">
            View Screenshot
          </a>
        </div>
      `).join('')}
    </div>

    <div class="timestamp">
      Generated: ${timestamp}<br>
      Epackage Lab Member Portal Audit
    </div>
  </div>
</body>
</html>
  `;
}
