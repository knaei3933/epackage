import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

/**
 * Comprehensive Console Error Check for All 82 Pages
 *
 * This test systematically visits every URL in the Epackage Lab system
 * and captures ALL console errors, warnings, and issues.
 */

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

// Complete URL inventory - 82 pages total
const URL_INVENTORY = [
  // Public Pages (38)
  { path: '/', name: 'Home', category: 'public' },
  { path: '/about', name: 'About', category: 'public' },
  { path: '/contact', name: 'Contact', category: 'public' },
  { path: '/contact/thank-you', name: 'Contact Thank You', category: 'public' },
  { path: '/service', name: 'Service', category: 'public' },
  { path: '/privacy', name: 'Privacy', category: 'public' },
  { path: '/terms', name: 'Terms', category: 'public' },
  { path: '/legal', name: 'Legal', category: 'public' },
  { path: '/csr', name: 'CSR', category: 'public' },
  { path: '/catalog', name: 'Catalog', category: 'public' },
  { path: '/guide', name: 'Guide', category: 'public' },
  { path: '/guide/color', name: 'Color Guide', category: 'public' },
  { path: '/guide/size', name: 'Size Guide', category: 'public' },
  { path: '/guide/image', name: 'Image Guide', category: 'public' },
  { path: '/guide/shirohan', name: 'Shirohan Guide', category: 'public' },
  { path: '/guide/environmentaldisplay', name: 'Environmental Display', category: 'public' },
  { path: '/industry/cosmetics', name: 'Cosmetics Industry', category: 'public' },
  { path: '/industry/electronics', name: 'Electronics Industry', category: 'public' },
  { path: '/industry/food-manufacturing', name: 'Food Industry', category: 'public' },
  { path: '/industry/pharmaceutical', name: 'Pharmaceutical Industry', category: 'public' },
  { path: '/pricing', name: 'Pricing', category: 'public' },
  { path: '/smart-quote', name: 'Smart Quote', category: 'public' },
  { path: '/quote-simulator', name: 'Quote Simulator', category: 'public' },
  { path: '/simulation', name: 'Simulation', category: 'public' },
  { path: '/roi-calculator', name: 'ROI Calculator', category: 'public' },
  { path: '/samples', name: 'Samples', category: 'public' },
  { path: '/samples/thank-you', name: 'Samples Thank You', category: 'public' },
  { path: '/archives', name: 'Archives', category: 'public' },
  { path: '/compare', name: 'Compare', category: 'public' },
  { path: '/compare/shared', name: 'Shared Compare', category: 'public' },
  { path: '/data-templates', name: 'Data Templates', category: 'public' },
  { path: '/flow', name: 'Flow', category: 'public' },
  { path: '/inquiry/detailed', name: 'Detailed Inquiry', category: 'public' },
  { path: '/premium-content', name: 'Premium Content', category: 'public' },
  { path: '/print', name: 'Print', category: 'public' },
  { path: '/news', name: 'News', category: 'public' },
  { path: '/design-system', name: 'Design System', category: 'public' },

  // Auth Pages (8)
  { path: '/auth/signin', name: 'Sign In', category: 'auth' },
  { path: '/auth/register', name: 'Register', category: 'auth' },
  { path: '/auth/signout', name: 'Sign Out', category: 'auth' },
  { path: '/auth/pending', name: 'Pending', category: 'auth' },
  { path: '/auth/suspended', name: 'Suspended', category: 'auth' },
  { path: '/auth/error', name: 'Auth Error', category: 'auth' },
  { path: '/auth/forgot-password', name: 'Forgot Password', category: 'auth' },
  { path: '/auth/reset-password', name: 'Reset Password', category: 'auth' },

  // B2B Pages (5)
  { path: '/b2b/login', name: 'B2B Login', category: 'b2b' },
  { path: '/b2b/register', name: 'B2B Register', category: 'b2b' },
  { path: '/b2b/register/sent', name: 'B2B Register Sent', category: 'b2b' },
  { path: '/b2b/register/verify', name: 'B2B Register Verify', category: 'b2b' },
  { path: '/b2b/contracts', name: 'B2B Contracts', category: 'b2b', requiresAuth: true },

  // Member Pages (20) - Need Login
  { path: '/member/dashboard', name: 'Member Dashboard', category: 'member', requiresAuth: true },
  { path: '/member/orders', name: 'Member Orders', category: 'member', requiresAuth: true },
  { path: '/member/orders/new', name: 'Member New Order', category: 'member', requiresAuth: true },
  { path: '/member/orders/history', name: 'Member Order History', category: 'member', requiresAuth: true },
  { path: '/member/quotations', name: 'Member Quotations', category: 'member', requiresAuth: true },
  { path: '/member/quotations/request', name: 'Member Request Quote', category: 'member', requiresAuth: true },
  { path: '/member/deliveries', name: 'Member Deliveries', category: 'member', requiresAuth: true },
  { path: '/member/invoices', name: 'Member Invoices', category: 'member', requiresAuth: true },
  { path: '/member/samples', name: 'Member Samples', category: 'member', requiresAuth: true },
  { path: '/member/inquiries', name: 'Member Inquiries', category: 'member', requiresAuth: true },
  { path: '/member/profile', name: 'Member Profile', category: 'member', requiresAuth: true },
  { path: '/member/edit', name: 'Member Edit', category: 'member', requiresAuth: true },
  { path: '/member/settings', name: 'Member Settings', category: 'member', requiresAuth: true },

  // Portal Pages (6) - Need B2B Login
  { path: '/portal', name: 'Portal', category: 'portal', requiresAuth: true },
  { path: '/portal/orders', name: 'Portal Orders', category: 'portal', requiresAuth: true },
  { path: '/portal/documents', name: 'Portal Documents', category: 'portal', requiresAuth: true },
  { path: '/portal/profile', name: 'Portal Profile', category: 'portal', requiresAuth: true },
  { path: '/portal/support', name: 'Portal Support', category: 'portal', requiresAuth: true },

  // Admin Pages (13) - Need Admin Login
  { path: '/admin/dashboard', name: 'Admin Dashboard', category: 'admin', requiresAuth: true },
  { path: '/admin/orders', name: 'Admin Orders', category: 'admin', requiresAuth: true },
  { path: '/admin/quotations', name: 'Admin Quotations', category: 'admin', requiresAuth: true },
  { path: '/admin/approvals', name: 'Admin Approvals', category: 'admin', requiresAuth: true },
  { path: '/admin/production', name: 'Admin Production', category: 'admin', requiresAuth: true },
  { path: '/admin/shipments', name: 'Admin Shipments', category: 'admin', requiresAuth: true },
  { path: '/admin/inventory', name: 'Admin Inventory', category: 'admin', requiresAuth: true },
  { path: '/admin/shipping', name: 'Admin Shipping', category: 'admin', requiresAuth: true },
  { path: '/admin/leads', name: 'Admin Leads', category: 'admin', requiresAuth: true },
  { path: '/admin/contracts', name: 'Admin Contracts', category: 'admin', requiresAuth: true },

  // Cart
  { path: '/cart', name: 'Cart', category: 'public' },

  // Profile
  { path: '/profile', name: 'Profile', category: 'public' },

  // Members list
  { path: '/members', name: 'Members', category: 'public' },
];

// Test data structure for results
interface PageResult {
  name: string;
  path: string;
  category: string;
  status: number;
  errors: string[];
  warnings: string[];
  infos: string[];
  loadTime: number;
  hasAuthError?: boolean;
}

const results: PageResult[] = [];
const errorCategories: Map<string, number> = new Map();
const uniqueErrors: Map<string, number> = new Map();

test.describe('Comprehensive Console Error Check', () => {
  test.beforeAll(async () => {
    console.log('\n=== COMPREHENSIVE CONSOLE ERROR CHECK ===');
    console.log(`Total URLs to check: ${URL_INVENTORY.length}`);
    console.log(`Base URL: ${BASE_URL}`);
    console.log('========================================\n');
  });

  for (const urlInfo of URL_INVENTORY) {
    test(`${urlInfo.category.toUpperCase()}: ${urlInfo.name}`, async ({ page }) => {
      const startTime = Date.now();
      const pageErrors: string[] = [];
      const pageWarnings: string[] = [];
      const pageInfos: string[] = [];
      const networkErrors: string[] = [];

      // Enhanced console listener
      page.on('console', msg => {
        const text = msg.text();
        const type = msg.type();

        // Capture the full context
        const context = {
          type,
          text,
          url: page.url(),
          timestamp: new Date().toISOString()
        };

        if (type === 'error') {
          pageErrors.push(JSON.stringify(context));
        } else if (type === 'warning') {
          pageWarnings.push(JSON.stringify(context));
        } else if (type === 'info') {
          pageInfos.push(JSON.stringify(context));
        }
      });

      // Page errors (JavaScript errors)
      page.on('pageerror', error => {
        pageErrors.push(`PAGE ERROR: ${error.message} | Stack: ${error.stack}`);
      });

      // Network errors
      page.on('response', response => {
        if (response.status() >= 400) {
          networkErrors.push(`NETWORK ${response.status()}: ${response.url()}`);
        }
      });

      // Failed requests
      page.on('requestfailed', request => {
        const failure = request.failure();
        if (failure) {
          networkErrors.push(`REQUEST FAILED: ${request.url()} | ${failure.errorText}`);
        }
      });

      // Navigate to page
      try {
        const response = await page.goto(`${BASE_URL}${urlInfo.path}`, {
          waitUntil: 'networkidle',
          timeout: 30000
        });

        const loadTime = Date.now() - startTime;
        const status = response?.status() || 0;

        // Wait for any delayed errors
        await page.waitForTimeout(2000);

        // Process results
        const result: PageResult = {
          name: urlInfo.name,
          path: urlInfo.path,
          category: urlInfo.category,
          status,
          errors: [...pageErrors, ...networkErrors],
          warnings: pageWarnings,
          infos: pageInfos,
          loadTime
        };

        results.push(result);

        // Count error categories
        pageErrors.forEach(err => {
          if (err.includes('Hydration')) {
            errorCategories.set('React Hydration', (errorCategories.get('React Hydration') || 0) + 1);
          } else if (err.includes('Supabase')) {
            errorCategories.set('Supabase', (errorCategories.get('Supabase') || 0) + 1);
          } else if (err.includes('fetch')) {
            errorCategories.set('API Fetch', (errorCategories.get('API Fetch') || 0) + 1);
          } else if (err.includes('NETWORK')) {
            errorCategories.set('Network', (errorCategories.get('Network') || 0) + 1);
          } else if (err.includes('PAGE ERROR')) {
            errorCategories.set('JavaScript Runtime', (errorCategories.get('JavaScript Runtime') || 0) + 1);
          } else {
            errorCategories.set('Other', (errorCategories.get('Other') || 0) + 1);
          }

          // Count unique errors
          const key = err.split('|')[0].substring(0, 100);
          uniqueErrors.set(key, (uniqueErrors.get(key) || 0) + 1);
        });

        networkErrors.forEach(err => {
          errorCategories.set('Network', (errorCategories.get('Network') || 0) + 1);
        });

        // Console output for test results
        console.log(`\n[${urlInfo.category.toUpperCase()}] ${urlInfo.name} (${urlInfo.path})`);
        console.log(`  Status: ${status} | Load Time: ${loadTime}ms`);

        if (result.errors.length > 0) {
          console.log(`  ❌ ERRORS (${result.errors.length}):`);
          result.errors.slice(0, 3).forEach(err => console.log(`     - ${err.substring(0, 150)}...`));
          if (result.errors.length > 3) {
            console.log(`     ... and ${result.errors.length - 3} more errors`);
          }
        }

        if (result.warnings.length > 0) {
          console.log(`  ⚠️  WARNINGS (${result.warnings.length}):`);
          result.warnings.slice(0, 3).forEach(warn => console.log(`     - ${warn.substring(0, 150)}...`));
          if (result.warnings.length > 3) {
            console.log(`     ... and ${result.warnings.length - 3} more warnings`);
          }
        }

        if (result.errors.length === 0 && result.warnings.length === 0) {
          console.log(`  ✅ Clean - No console issues`);
        }

        // Take screenshot on error
        if (result.errors.length > 0) {
          const screenshotPath = path.join(
            process.cwd(),
            'test-results',
            'screenshots',
            `console-error-${urlInfo.name.replace(/\s+/g, '-').toLowerCase()}.png`
          );
          await page.screenshot({ path: screenshotPath, fullPage: true });
          console.log(`  📸 Screenshot saved: ${screenshotPath}`);
        }

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error(`  ❌ FAILED TO NAVIGATE: ${errorMessage}`);

        results.push({
          name: urlInfo.name,
          path: urlInfo.path,
          category: urlInfo.category,
          status: 0,
          errors: [`NAVIGATION ERROR: ${errorMessage}`],
          warnings: [],
          infos: [],
          loadTime: Date.now() - startTime
        });
      }
    });
  }

  // Generate comprehensive report
  test.afterAll(async ({}, testInfo) => {
    console.log('\n\n=== FINAL REPORT ===\n');

    const pagesWithErrors = results.filter(r => r.errors.length > 0);
    const pagesWithWarnings = results.filter(r => r.warnings.length > 0 && r.errors.length === 0);
    const cleanPages = results.filter(r => r.errors.length === 0 && r.warnings.length === 0);

    console.log('📊 SUMMARY');
    console.log('='.repeat(60));
    console.log(`Total URLs Checked:      ${results.length}`);
    console.log(`URLs with Errors:        ${pagesWithErrors.length}`);
    console.log(`URLs with Warnings Only: ${pagesWithWarnings.length}`);
    console.log(`Clean URLs:              ${cleanPages.length}`);
    console.log('');

    // Error categories
    console.log('📋 ERROR CATEGORIES');
    console.log('='.repeat(60));
    if (errorCategories.size > 0) {
      Array.from(errorCategories.entries())
        .sort((a, b) => b[1] - a[1])
        .forEach(([category, count]) => {
          console.log(`${category}:`.padEnd(25) + `${count}`);
        });
    } else {
      console.log('No errors found!');
    }
    console.log('');

    // Most common errors
    console.log('🔥 MOST COMMON ERRORS');
    console.log('='.repeat(60));
    if (uniqueErrors.size > 0) {
      Array.from(uniqueErrors.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .forEach(([error, count]) => {
          console.log(`[${count}x] ${error.substring(0, 100)}`);
        });
    } else {
      console.log('No errors found!');
    }
    console.log('');

    // Pages with errors
    if (pagesWithErrors.length > 0) {
      console.log('❌ PAGES WITH ERRORS');
      console.log('='.repeat(60));
      console.log(
        'Page'.padEnd(30) +
        'Category'.padEnd(12) +
        'Errors'.padEnd(8) +
        'Status'
      );
      console.log('-'.repeat(60));

      pagesWithErrors.forEach(page => {
        console.log(
          page.name.substring(0, 30).padEnd(30) +
          page.category.padEnd(12) +
          String(page.errors.length).padEnd(8) +
          String(page.status)
        );
      });
      console.log('');
    }

    // Pages with warnings
    if (pagesWithWarnings.length > 0) {
      console.log('⚠️  PAGES WITH WARNINGS (NO ERRORS)');
      console.log('='.repeat(60));
      console.log(
        'Page'.padEnd(30) +
        'Category'.padEnd(12) +
        'Warnings'.padEnd(10) +
        'Status'
      );
      console.log('-'.repeat(60));

      pagesWithWarnings.forEach(page => {
        console.log(
          page.name.substring(0, 30).padEnd(30) +
          page.category.padEnd(12) +
          String(page.warnings.length).padEnd(10) +
          String(page.status)
        );
      });
      console.log('');
    }

    // Clean pages
    console.log('✅ CLEAN PAGES (NO ERRORS OR WARNINGS)');
    console.log('='.repeat(60));
    console.log(`Total: ${cleanPages.length} pages`);
    cleanPages.slice(0, 20).forEach(page => {
      console.log(`  ✓ ${page.name} (${page.path})`);
    });
    if (cleanPages.length > 20) {
      console.log(`  ... and ${cleanPages.length - 20} more`);
    }
    console.log('');

    // Generate detailed markdown report
    const reportPath = path.join(process.cwd(), 'docs', 'CONSOLE_ERRORS_COMPLETE_REPORT.md');
    generateMarkdownReport(results, errorCategories, uniqueErrors, reportPath);
    console.log(`📄 Detailed report saved to: ${reportPath}`);
  });
});

function generateMarkdownReport(
  results: PageResult[],
  errorCategories: Map<string, number>,
  uniqueErrors: Map<string, number>,
  reportPath: string
) {
  const pagesWithErrors = results.filter(r => r.errors.length > 0);
  const pagesWithWarnings = results.filter(r => r.warnings.length > 0 && r.errors.length === 0);
  const cleanPages = results.filter(r => r.errors.length === 0 && r.warnings.length === 0);

  let markdown = '# Complete Console Errors Report\n\n';
  markdown += `**Generated:** ${new Date().toISOString()}\n\n`;
  markdown += '## Summary\n\n';
  markdown += '| Category | Count |\n';
  markdown += '|----------|-------|\n';
  markdown += `| Total URLs Checked | ${results.length} |\n`;
  markdown += `| URLs with Errors | ${pagesWithErrors.length} |\n`;
  markdown += `| URLs with Warnings | ${pagesWithWarnings.length} |\n`;
  markdown += `| Clean URLs | ${cleanPages.length} |\n\n`;

  // Error categories
  markdown += '## Error Categories\n\n';
  if (errorCategories.size > 0) {
    markdown += '| Category | Count |\n';
    markdown += '|----------|-------|\n';
    Array.from(errorCategories.entries())
      .sort((a, b) => b[1] - a[1])
      .forEach(([category, count]) => {
        markdown += `| ${category} | ${count} |\n`;
      });
  } else {
    markdown += 'No errors found!\n';
  }
  markdown += '\n';

  // Most common errors
  markdown += '## Most Common Errors\n\n';
  if (uniqueErrors.size > 0) {
    Array.from(uniqueErrors.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .forEach(([error, count]) => {
        markdown += `${count}. \`${error.substring(0, 150)}\`\n\n`;
      });
  } else {
    markdown += 'No errors found!\n';
  }
  markdown += '\n';

  // Pages with errors
  if (pagesWithErrors.length > 0) {
    markdown += '## Pages with Console Errors\n\n';
    markdown += '| Page | URL | Category | Error Count | Status |\n';
    markdown += '|------|-----|----------|-------------|--------|\n';
    pagesWithErrors.forEach(page => {
      markdown += `| ${page.name} | ${page.path} | ${page.category} | ${page.errors.length} | ${page.status} |\n`;
    });
    markdown += '\n';

    // Detailed error listing
    markdown += '### Detailed Errors\n\n';
    pagesWithErrors.forEach(page => {
      markdown += `#### ${page.name} (${page.path})\n\n`;
      markdown += `**Status:** ${page.status} | **Load Time:** ${page.loadTime}ms\n\n`;
      page.errors.slice(0, 5).forEach(err => {
        markdown += `- ${err.substring(0, 300)}\n`;
      });
      if (page.errors.length > 5) {
        markdown += `- ... and ${page.errors.length - 5} more errors\n`;
      }
      markdown += '\n';
    });
  }

  // Pages with warnings
  if (pagesWithWarnings.length > 0) {
    markdown += '## Pages with Warnings\n\n';
    markdown += '| Page | URL | Category | Warning Count | Status |\n';
    markdown += '|------|-----|----------|---------------|--------|\n';
    pagesWithWarnings.forEach(page => {
      markdown += `| ${page.name} | ${page.path} | ${page.category} | ${page.warnings.length} | ${page.status} |\n`;
    });
    markdown += '\n';
  }

  // Clean pages
  markdown += `## Clean Pages (${cleanPages.length} pages)\n\n`;
  markdown += 'The following pages have no console errors or warnings:\n\n';
  cleanPages.forEach(page => {
    markdown += `- ✅ ${page.name} (${page.path})\n`;
  });
  markdown += '\n';

  // Recommended fixes
  markdown += '## Recommended Fixes\n\n';
  if (uniqueErrors.size > 0) {
    markdown += 'Based on the errors found, here are the recommended fixes:\n\n';
    Array.from(uniqueErrors.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .forEach(([error, count]) => {
        markdown += `### ${error.substring(0, 80)}...\n\n`;
        markdown += `- **Occurrences:** ${count}\n`;
        markdown += `- **Priority:** ${count > 5 ? 'HIGH' : count > 2 ? 'MEDIUM' : 'LOW'}\n`;
        markdown += `- **Action:** Investigate and fix the root cause\n\n`;
      });
  } else {
    markdown += 'No fixes needed - all pages are clean!\n';
  }

  // Write report
  fs.writeFileSync(reportPath, markdown, 'utf-8');
}
