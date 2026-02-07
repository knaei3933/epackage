import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright E2E Test Configuration for Epackage Lab
 *
 * Usage:
 * - Run all tests: npx playwright test
 * - Run specific test: npx playwright test quotation-order-workflow.spec.ts
 * - Run with UI: npx playwright test --ui
 * - Run in headed mode: npx playwright test --headed
 * - Generate report: npx playwright test --reporter=html
 */

export default defineConfig({
  // Test directory
  testDir: './tests/e2e',

  // Fully parallelize tests by default
  fullyParallel: true,

  // Fail the build on CI if you accidentally left test.only in the source code
  forbidOnly: !!process.env.CI,

  // Retry on CI only
  retries: process.env.CI ? 2 : 0,

  // Opt out of parallel tests on CI
  workers: process.env.CI ? 1 : undefined,

  // Reporter configuration
  reporter: [
    ['html', { outputFolder: 'test-results/html-report' }],
    ['json', { outputFile: 'test-results/test-results.json' }],
    ['junit', { outputFile: 'test-results/junit-results.xml' }],
    ['list']
  ],

  // Shared settings for all tests
  use: {
    // Base URL for tests
    baseURL: process.env.BASE_URL || 'http://localhost:3000',

    // Collect trace when retrying the failed test
    trace: 'on-first-retry',

    // Take screenshot on failure
    screenshot: 'only-on-failure',

    // Record video on failure
    video: 'retain-on-failure',

    // Browser context options
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true,

    // Action timeout
    actionTimeout: 10000,

    // Navigation timeout
    navigationTimeout: 30000,
  },

  // Configure projects for major browsers
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },

    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },

    /* Test against mobile viewports */
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },

    /* Test against branded browsers */
    {
      name: 'Microsoft Edge',
      use: { channel: 'msedge' },
    },
  ],

  // Run your local dev server before starting the tests
  // Temporarily disabled - using existing server on port 3001
  // webServer: {
  //   command: 'npm run dev',
  //   url: 'http://localhost:3006',
  //   reuseExistingServer: true,
  //   timeout: 120000,
  // },

  // Global setup and teardown
  globalSetup: './tests/e2e/global-setup.ts',
  globalTeardown: './tests/e2e/global-teardown.ts',

  // Output directory for test artifacts
  outputDir: 'test-results/artifacts',

  // Test timeout
  timeout: 60000,
});
