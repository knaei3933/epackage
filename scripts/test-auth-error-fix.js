#!/usr/bin/env node

/**
 * Test script to verify TC-AUTH-012 fix
 * This script runs just the auth error page test
 */

const { execSync } = require('child_process');
const path = require('path');

console.log('🧪 Running TC-AUTH-012: 認証エラーページ表示');
console.log('=' .repeat(60));

try {
  const testFile = path.join(__dirname, '..', 'tests', 'e2e', 'group-b-auth', '04-after-auth.spec.ts');

  // Run only the TC-AUTH-012 test
  const command = `npx playwright test "${testFile}" --grep "TC-AUTH-012"`;

  console.log(`Command: ${command}`);
  console.log('');

  execSync(command, {
    stdio: 'inherit',
    cwd: path.join(__dirname, '..'),
    env: { ...process.env }
  });

  console.log('');
  console.log('✅ Test completed successfully!');
} catch (error) {
  console.error('');
  console.error('❌ Test failed with error:', error.message);
  process.exit(1);
}
