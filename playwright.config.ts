import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright E2E Test Configuration for Epackage Lab
 *
 * Usage:
 * - Run all tests: npx playwright test
 * - Run specific test: npx playwright test tests/e2e/admin-dashboard-navigation.spec.ts
 * - Run with UI: npx playwright test --ui
 * - Run in headed mode: npx playwright test --headed
 *
 * @see https://playwright.dev/docs/test-configuration
 */

export default defineConfig({
  // Test directory
  testDir: './tests/e2e',

  // Fully parallelize tests by default
  fullyParallel: true,

  // Fail the build if you accidentally leave test.only in source code
  forbidOnly: !!process.env.CI,

  // Retry on CI only
  retries: process.env.CI ? 2 : 0,

  // Reporter configuration
  reporter: [
    ['html', { outputFolder: 'test-results/html-report' }],
    ['json', { outputFile: 'test-results/test-results.json' }],
    ['list']
  ],

  // Shared settings for all tests
  use: {
    // Base URL for tests
    baseURL: process.env.BASE_URL || 'http://localhost:3002',

    // Collect trace when retrying
    trace: 'on-first-retry',

    // Take screenshot on failure
    screenshot: 'only-on-failure',

    // Viewport configuration
    viewport: { width: 1280, height: 720 },

    // Ignore HTTPS errors for self-signed certs
    ignoreHTTPSErrors: true,

    // Action timeout (60 seconds - sufficient for slower networks)
    actionTimeout: 60000,

    // Navigation timeout (30 seconds - admin dashboard can be slow)
    navigationTimeout: 60000,

    // Browser context options
    contextOptions: {
      // Enable JavaScript for cookie handling
      javaScriptEnabled: true,

      // User locale
      locale: 'ja-JP',

      // Timezone
      timezoneId: 'Asia/Tokyo',

      // Ignore HTTPS errors for localhost development
      ignoreHTTPSErrors: true,
    },
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
    /* Microsoft Edge */
    {
      name: 'Microsoft Edge',
      use: { channel: 'msedge' },
    },
    /* Mobile Chrome */
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    /* Mobile Safari */
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],

  // Run your local dev server before starting the tests
  // This is currently disabled - tests run on localhost:3002 directly
  webServer: {
    // Command to start the server
    command: 'npm run dev',
    // URL where the server is running
    url: 'http://localhost:3002',
    // Timeout for server startup
    timeout: 120000,
    // Whether to reuse the existing server or launch a new one
    reuseExistingServer: !process.env.CI,
  },

  // Output directory for test artifacts
  outputDir: 'test-results/artifacts',

  // Global setup and teardown
  globalSetup: './tests/e2e/global-setup.ts',
  globalTeardown: './tests/e2e/global-teardown.ts',
});
