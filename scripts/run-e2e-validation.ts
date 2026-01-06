/**
 * E2E Validation Test Runner
 *
 * Runs comprehensive E2E tests based on COMPLETE_PAGE_FUNCTIONALITY_AUDIT_2026-01-04.md
 * Generates detailed report with pass/fail status for all 74 pages
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

interface TestResult {
  id: string;
  name: string;
  category: string;
  status: 'passed' | 'failed' | 'skipped' | 'pending';
  duration?: number;
  error?: string;
}

interface CategoryReport {
  name: string;
  total: number;
  passed: number;
  failed: number;
  skipped: number;
  tests: TestResult[];
}

interface ValidationReport {
  date: string;
  duration: number;
  summary: {
    total: number;
    passed: number;
    failed: number;
    skipped: number;
    passRate: number;
  };
  categories: CategoryReport[];
  criticalIssues: string[];
  recommendations: string[];
}

const OUTPUT_DIR = path.join(process.cwd(), 'test-reports');
const REPORT_FILE = path.join(OUTPUT_DIR, `e2e-validation-${new Date().toISOString().split('T')[0]}.json`);
const MARKDOWN_FILE = path.join(OUTPUT_DIR, `e2e-validation-${new Date().toISOString().split('T')[0]}.md`);

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

/**
 * Run Playwright tests
 */
function runTests(testFile?: string): { stdout: string; exitCode: number } {
  try {
    console.log('\n🧪 Running E2E tests...\n');

    const testPath = testFile || 'tests/e2e/comprehensive-page-validation.spec.ts';
    const command = `npx playwright test ${testPath} --reporter=json`;

    const output = execSync(command, {
      encoding: 'utf-8',
      stdio: 'pipe'
    });

    return { stdout: output, exitCode: 0 };
  } catch (error: any) {
    return {
      stdout: error.stdout || '',
      exitCode: error.status || 1
    };
  }
}

/**
 * Parse Playwright JSON output
 */
function parseTestResults(jsonOutput: string): CategoryReport[] {
  try {
    const results = JSON.parse(jsonOutput);
    const categories: Map<string, TestResult[]> = new Map();

    for (const suite of results.suites || []) {
      for (const spec of suite.specs || []) {
        const category = categorizeTest(spec.title);
        if (!categories.has(category)) {
          categories.set(category, []);
        }

        categories.get(category)!.push({
          id: spec.title.split(' ')[0] || 'UNKNOWN',
          name: spec.title,
          category,
          status: spec.tests?.[0]?.results?.[0]?.status === 'passed' ? 'passed' : 'failed',
          duration: spec.tests?.[0]?.results?.[0]?.duration,
          error: spec.tests?.[0]?.results?.[0]?.error?.message
        });
      }
    }

    return Array.from(categories.entries()).map(([name, tests]) => {
      const passed = tests.filter(t => t.status === 'passed').length;
      const failed = tests.filter(t => t.status === 'failed').length;
      const skipped = tests.filter(t => t.status === 'skipped').length;

      return {
        name,
        total: tests.length,
        passed,
        failed,
        skipped,
        tests
      };
    });
  } catch (error) {
    console.error('Error parsing test results:', error);
    return [];
  }
}

/**
 * Categorize test by title
 */
function categorizeTest(title: string): string {
  if (title.includes('[HOME-]') || title.includes('[CATALOG-]') || title.includes('[QUOTE-]') ||
      title.includes('[CONTACT-]') || title.includes('[SAMPLES-]') || title.includes('[GUIDE-]') ||
      title.includes('[INDUSTRY-]') || title.includes('[PUBLIC-]') || title.includes('[LEGAL-]')) {
    return 'Public Pages (33)';
  }
  if (title.includes('[AUTH-]')) return 'Auth Pages (6)';
  if (title.includes('[MEMBER-]')) return 'Member Portal (17)';
  if (title.includes('[ADMIN-]')) return 'Admin Pages (12)';
  if (title.includes('[PORTAL-]')) return 'Portal Pages (6)';
  if (title.includes('[SECURITY-]')) return 'Security Tests';
  if (title.includes('[DB-]')) return 'Database Integration';
  if (title.includes('[NAV-]')) return 'Navigation Tests';
  if (title.includes('[PERF-]') || title.includes('[A11Y-]')) return 'Performance & Accessibility';
  return 'Other';
}

/**
 * Generate markdown report
 */
function generateMarkdownReport(report: ValidationReport): string {
  let md = `# E2E Validation Report\n\n`;
  md += `**Date**: ${report.date}\n`;
  md += `**Duration**: ${(report.duration / 1000).toFixed(2)}s\n\n`;

  // Summary
  md += `## 📊 Summary\n\n`;
  md += `| Metric | Value |\n`;
  md += `|--------|-------|\n`;
  md += `| Total Tests | ${report.summary.total} |\n`;
  md += `| Passed | ✅ ${report.summary.passed} |\n`;
  md += `| Failed | ❌ ${report.summary.failed} |\n`;
  md += `| Skipped | ⏭️ ${report.summary.skipped} |\n`;
  md += `| Pass Rate | ${(report.summary.passRate * 100).toFixed(1)}% |\n\n`;

  // Category breakdown
  md += `## 📋 Category Breakdown\n\n`;

  for (const category of report.categories) {
    const passRate = category.total > 0 ? (category.passed / category.total * 100).toFixed(1) : '0';
    const status = category.failed === 0 ? '✅' : '⚠️';

    md += `### ${status} ${category.name}\n\n`;
    md += `- **Total**: ${category.total} tests\n`;
    md += `- **Passed**: ${category.passed}\n`;
    md += `- **Failed**: ${category.failed}\n`;
    md += `- **Skipped**: ${category.skipped}\n`;
    md += `- **Pass Rate**: ${passRate}%\n\n`;

    if (category.failed > 0) {
      md += `**Failed Tests:**\n\n`;
      for (const test of category.tests.filter(t => t.status === 'failed')) {
        md += `- ❌ ${test.name}\n`;
        if (test.error) {
          md += `  - Error: ${test.error}\n`;
        }
      }
      md += `\n`;
    }
  }

  // Critical issues
  if (report.criticalIssues.length > 0) {
    md += `## 🔴 Critical Issues\n\n`;
    for (const issue of report.criticalIssues) {
      md += `- ${issue}\n`;
    }
    md += `\n`;
  }

  // Recommendations
  if (report.recommendations.length > 0) {
    md += `## 💡 Recommendations\n\n`;
    for (const rec of report.recommendations) {
      md += `- ${rec}\n`;
    }
    md += `\n`;
  }

  return md;
}

/**
 * Analyze results and generate recommendations
 */
function analyzeResults(categories: CategoryReport[]): { issues: string[]; recommendations: string[] } {
  const issues: string[] = [];
  const recommendations: string[] = [];

  // Check for failed security tests
  const security = categories.find(c => c.name === 'Security Tests');
  if (security && security.failed > 0) {
    issues.push('Security tests failed - authentication may be broken');
    recommendations.push('Review all admin API authentication');
  }

  // Check for failed database tests
  const db = categories.find(c => c.name === 'Database Integration');
  if (db && db.failed > 0) {
    issues.push('Database integration tests failed');
    recommendations.push('Verify database connections and RLS policies');
  }

  // Check admin pages
  const admin = categories.find(c => c.name.includes('Admin'));
  if (admin && admin.failed > admin.total * 0.5) {
    issues.push('More than 50% of admin pages failed');
    recommendations.push('Review admin page access and authentication');
  }

  // Check member pages
  const member = categories.find(c => c.name.includes('Member'));
  if (member && member.failed > 0) {
    recommendations.push('Fix member portal authentication issues');
  }

  // Check public pages
  const publicPages = categories.find(c => c.name.includes('Public'));
  if (publicPages && public.failed > 0) {
    recommendations.push('Review public page navigation and links');
  }

  // Performance issues
  const perf = categories.find(c => c.name.includes('Performance'));
  if (perf && perf.failed > 0) {
    recommendations.push('Optimize page load times and bundle size');
  }

  return { issues, recommendations };
}

/**
 * Main execution
 */
async function main() {
  console.log('========================================');
  console.log('E2E Validation Test Runner');
  console.log('Based on COMPLETE_PAGE_FUNCTIONALITY_AUDIT_2026-01-04.md');
  console.log('========================================\n');

  const startTime = Date.now();

  // Run tests
  const { stdout, exitCode } = runTests();

  // Parse results
  let categories: CategoryReport[] = [];
  try {
    // Try to get results from test-results folder
    const resultsPath = path.join(process.cwd(), 'test-results', 'results.json');
    if (fs.existsSync(resultsPath)) {
      const jsonOutput = fs.readFileSync(resultsPath, 'utf-8');
      categories = parseTestResults(jsonOutput);
    }
  } catch (error) {
    console.log('Could not parse JSON output, using fallback...');
  }

  const duration = Date.now() - startTime;

  // Analyze results
  const { issues, recommendations } = analyzeResults(categories);

  // Calculate summary
  const totalTests = categories.reduce((sum, cat) => sum + cat.total, 0);
  const passedTests = categories.reduce((sum, cat) => sum + cat.passed, 0);
  const failedTests = categories.reduce((sum, cat) => sum + cat.failed, 0);
  const skippedTests = categories.reduce((sum, cat) => sum + cat.skipped, 0);

  const report: ValidationReport = {
    date: new Date().toISOString(),
    duration,
    summary: {
      total: totalTests,
      passed: passedTests,
      failed: failedTests,
      skipped: skippedTests,
      passRate: totalTests > 0 ? passedTests / totalTests : 0
    },
    categories,
    criticalIssues: issues,
    recommendations
  };

  // Generate markdown report
  const markdown = generateMarkdownReport(report);
  fs.writeFileSync(MARKDOWN_FILE, markdown);

  // Save JSON report
  fs.writeFileSync(REPORT_FILE, JSON.stringify(report, null, 2));

  // Print summary
  console.log('\n========================================');
  console.log('Test Summary');
  console.log('========================================\n');
  console.log(`Total: ${report.summary.total}`);
  console.log(`Passed: ✅ ${report.summary.passed}`);
  console.log(`Failed: ❌ ${report.summary.failed}`);
  console.log(`Skipped: ⏭️ ${report.summary.skipped}`);
  console.log(`Pass Rate: ${(report.summary.passRate * 100).toFixed(1)}%`);

  if (report.criticalIssues.length > 0) {
    console.log('\n🔴 Critical Issues:');
    for (const issue of report.criticalIssues) {
      console.log(`  - ${issue}`);
    }
  }

  if (report.recommendations.length > 0) {
    console.log('\n💡 Recommendations:');
    for (const rec of report.recommendations) {
      console.log(`  - ${rec}`);
    }
  }

  console.log(`\n📄 Reports saved to:`);
  console.log(`  - ${MARKDOWN_FILE}`);
  console.log(`  - ${REPORT_FILE}\n`);

  process.exit(exitCode);
}

main().catch(console.error);
