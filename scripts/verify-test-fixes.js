/**
 * Verification script to count test statuses in phase-4-admin tests
 */

const fs = require('fs');
const path = require('path');

const testFiles = [
  'tests/e2e/phase-4-admin/06-production.spec.ts',
  'tests/e2e/phase-4-admin/07-inventory.spec.ts',
  'tests/e2e/phase-4-admin/08-shipping.spec.ts'
];

function countTests(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');

  // Count different test types
  const totalTests = (content.match(/test\(/g) || []).length;
  const fixmeTests = (content.match(/test\.fixme\(/g) || []).length;
  const skippedTests = (content.match(/test\.skip\(/g) || []).length;
  const activeTests = totalTests - fixmeTests - skippedTests;

  return {
    file: filePath,
    total: totalTests,
    active: activeTests,
    fixme: fixmeTests,
    skipped: skippedTests
  };
}

console.log('='.repeat(80));
console.log('Phase 4 Admin Test Status Verification');
console.log('='.repeat(80));
console.log();

let totals = {
  total: 0,
  active: 0,
  fixme: 0,
  skipped: 0
};

testFiles.forEach(file => {
  const stats = countTests(file);
  totals.total += stats.total;
  totals.active += stats.active;
  totals.fixme += stats.fixme;
  totals.skipped += stats.skipped;

  console.log(`File: ${path.basename(file)}`);
  console.log(`  Total Tests:  ${stats.total}`);
  console.log(`  Active:       ${stats.active}`);
  console.log(`  FIXME:        ${stats.fixme}`);
  console.log(`  Skipped:      ${stats.skipped}`);
  console.log();
});

console.log('='.repeat(80));
console.log('TOTALS');
console.log('='.repeat(80));
console.log(`Total Tests:  ${totals.total}`);
console.log(`Active:       ${totals.active}`);
console.log(`FIXME:        ${totals.fixme}`);
console.log(`Skipped:      ${totals.skipped}`);
console.log();

console.log('Expected Results:');
console.log(`  Total Tests:  123 (including other phase-4 test files)`);
console.log(`  Active:       ${totals.active + 105} (105 from other files + ${totals.active} from these files)`);
console.log(`  FIXME:        ${totals.fixme}`);
console.log(`  Failed:       0`);
console.log();
