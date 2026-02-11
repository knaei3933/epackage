#!/usr/bin/env tsx

/**
 * Test Environment Verification Script
 *
 * This script verifies that the environment is correctly configured
 * for running Phase 4 Admin E2E tests.
 */

import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

console.log('========================================');
console.log('Test Environment Verification');
console.log('========================================\n');

// Load environment files
const envFiles = [
  { name: '.env.test', path: '.env.test' },
  { name: '.env.local', path: '.env.local' },
];

let hasErrors = false;

// Check each env file
for (const envFile of envFiles) {
  const filePath = path.resolve(process.cwd(), envFile.path);

  if (!fs.existsSync(filePath)) {
    console.log(`❌ ${envFile.name} not found at ${filePath}`);
    hasErrors = true;
    continue;
  }

  console.log(`✅ ${envFile.name} exists`);

  // Parse the file
  const content = fs.readFileSync(filePath, 'utf-8');
  const parsed = dotenv.parse({ content: Buffer.from(content) });

  // Check key variables
  const nodeEnv = parsed.NODE_ENV;

  console.log(`   NODE_ENV: ${nodeEnv || '(not set)'}`);

  if (nodeEnv !== 'development' && nodeEnv !== 'test') {
    console.log(`   ⚠️  WARNING: NODE_ENV is '${nodeEnv}', expected 'development' or 'test'`);
  } else {
    console.log(`   ✅ NODE_ENV is correctly set`);
  }

  console.log('');
}

// Check if BASE_URL is set in .env.test
const testEnvPath = path.resolve(process.cwd(), '.env.test');
if (fs.existsSync(testEnvPath)) {
  const testEnvContent = fs.readFileSync(testEnvPath, 'utf-8');
  const testEnvParsed = dotenv.parse({ content: Buffer.from(testEnvContent) });

  const baseUrl = testEnvParsed.BASE_URL;
  console.log(`BASE_URL (from .env.test): ${baseUrl || '(not set)'}`);

  if (!baseUrl) {
    console.log(`   ⚠️  WARNING: BASE_URL is not set`);
    console.log(`       Tests may not connect to the correct server`);
  } else {
    const url = new URL(baseUrl);
    console.log(`   Host: ${url.hostname}`);
    console.log(`   Port: ${url.port || '(default)'}`);

    // Try to connect to the server
    console.log(`   Checking if server is accessible...`);
    try {
      const response = await fetch(baseUrl, { method: 'HEAD', signal: AbortSignal.timeout(5000) });
      if (response.ok || response.status === 404) {
        console.log(`   ✅ Server is accessible at ${baseUrl}`);
      }
    } catch (error) {
      console.log(`   ❌ Server is NOT accessible at ${baseUrl}`);
      console.log(`      Make sure the dev server is running:`);
      console.log(`        PORT=${url.port || 3000} npm run dev`);
      hasErrors = true;
    }
  }
}

console.log('\n========================================');
console.log('Verification Summary');
console.log('========================================\n');

if (hasErrors) {
  console.log('❌ Some issues were found. Please fix them before running tests.');
  console.log('\nCommon fixes:');
  console.log('1. Ensure .env.local has correct Supabase credentials');
  console.log('2. Ensure .env.test has correct Supabase credentials');
  console.log('3. Start the dev server: PORT=3002 npm run dev');
  console.log('4. Or start with default port and update .env.test BASE_URL');
  process.exit(1);
} else {
  console.log('✅ All checks passed! You can run the tests.');
  console.log('\nTo run Phase 4 Admin tests:');
  console.log('  npx playwright test tests/e2e/phase-4-admin/ --reporter=list');
  console.log('\nOr use the test runner script:');
  console.log('  ./scripts/run-phase4-admin-tests.sh  (Linux/Mac)');
  console.log('  .\\scripts\\run-phase4-admin-tests.bat  (Windows)');
  process.exit(0);
}
