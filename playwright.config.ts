import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.test for testing
// Falls back to .env.local if .env.test doesn't exist
const testEnvFile = path.resolve(process.cwd(), '.env.test');
const localEnvFile = path.resolve(process.cwd(), '.env.local');
const envFile = require('fs').existsSync(testEnvFile) ? testEnvFile : localEnvFile;

// Load environment variables
const envConfig = dotenv.config({ path: envFile });

if (envConfig.error) {
  console.warn('[Playwright Config] Warning: Could not load .env.test or .env.local file');
  console.warn('[Playwright Config] Tests requiring Supabase will be skipped');
}

export default defineConfig({
    testDir: './tests',
    testIgnore: [
        // Ignore Jest-specific test files that use jest.mock()
        '**/api/multi-quantity.test.ts',
        '**/integration/multi-quantity-workflow.test.tsx',
        '**/database/transaction-race.spec.ts', // Requires Supabase service credentials
        // Ignore all tests in directories that use Jest-specific APIs
        '**/__tests__/**',
        '**/*.jest.test.{ts,tsx}',
    ],
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    workers: process.env.CI ? 2 : 4,
    reporter: [
        ['html', { outputFolder: 'playwright-report' }],
        ['json', { outputFile: 'test-results/results.json' }],
        ['junit', { outputFile: 'test-results/results.xml' }],
        ['list'],
    ],
    use: {
        baseURL: process.env.BASE_URL || 'http://localhost:3000',
        trace: 'on-first-retry',
        screenshot: 'only-on-failure',
        video: 'retain-on-failure',
        actionTimeout: 30000,
        navigationTimeout: 30000,
    },
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
        {
            name: 'Mobile Chrome',
            use: { ...devices['Pixel 5'] },
        },
        {
            name: 'Mobile Safari',
            use: { ...devices['iPhone 12'] },
        },
        {
            name: 'Tablet',
            use: { ...devices['iPad Pro'] },
        },
    ],
    // Don't start a web server - reuse existing server on port 3000
    // Run tests when the dev server is already running
    // webServer: {
    //     command: 'npm run dev',
    //     url: 'http://localhost:3000',
    //     reuseExistingServer: !process.env.CI,
    //     timeout: 120000,
    // },
    expect: {
        timeout: 10000,
    },
    timeout: 60000, // Increased timeout for slower page loads
});