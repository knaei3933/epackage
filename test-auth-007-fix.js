/**
 * Quick test script for TC-AUTH-007 fix
 * Run with: node test-auth-007-fix.js
 */

const { execSync } = require('child_process');
const path = require('path');

console.log('='.repeat(60));
console.log('Running TC-AUTH-007: 事業形態によるフォーム変化');
console.log('='.repeat(60));

try {
  console.log('\n📋 Test: Checking dynamic form field behavior...');
  console.log('📁 File: tests/e2e/group-b-auth/02-register.spec.ts');
  console.log('🎯 Test: TC-AUTH-007\n');

  const testCommand = 'npx playwright test tests/e2e/group-b-auth/02-register.spec.ts --grep "TC-AUTH-007"';

  console.log('⚡ Executing test...');
  console.log('─'.repeat(60));

  execSync(testCommand, {
    stdio: 'inherit',
    cwd: path.resolve(__dirname),
    env: {
      ...process.env,
      NODE_ENV: 'test'
    }
  });

  console.log('─'.repeat(60));
  console.log('\n✅ Test completed successfully!\n');
  console.log('='.repeat(60));

} catch (error) {
  console.log('─'.repeat(60));
  console.error('\n❌ Test failed or dev server not running');
  console.error('\n💡 Troubleshooting:');
  console.error('   1. Make sure dev server is running: npm run dev');
  console.error('   2. Check that server is on port 3000');
  console.error('   3. Verify .env.local has required environment variables');
  console.log('\n='.repeat(60));
  process.exit(1);
}
